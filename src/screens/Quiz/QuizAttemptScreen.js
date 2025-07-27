import React, { useState, useEffect, useContext } from 'react';
import { 
    SafeAreaView, Text, View, StyleSheet, Alert, 
    ActivityIndicator, TouchableOpacity, ScrollView 
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import CustomButton from '../../components/CustomButton';
import { AuthContext } from '../../context/AuthContext';

const QuizAttemptScreen = ({ route, navigation }) => {
    const { quizId, quizName } = route.params;
    const { user } = useContext(AuthContext);
    
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userAnswers, setUserAnswers] = useState({}); // { questionId: selectedOptionIndex }

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const questionsSnapshot = await firestore()
                    .collection('quizzes')
                    .doc(quizId)
                    .collection('questions')
                    .get();
                
                const questionsArray = questionsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setQuestions(questionsArray);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching questions: ", error);
                setLoading(false);
                Alert.alert("Error", "Sawaal load nahi ho sake.");
            }
        };
        fetchQuestions();
    }, [quizId]);

    const handleSelectAnswer = (questionId, optionIndex) => {
        setUserAnswers({
            ...userAnswers,
            [questionId]: optionIndex
        });
    };

    const handleSubmitQuiz = () => {
        if (Object.keys(userAnswers).length !== questions.length) {
            Alert.alert("Incomplete", "Kripya saare sawaalon ke jawaab dein.");
            return;
        }

        Alert.alert(
            "Confirm Submission",
            "Kya aap sach me is test ko submit karna chahte hain? Iske baad aap badlav nahi kar payenge.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Submit", onPress: calculateAndSaveScore }
            ]
        );
    };

    const calculateAndSaveScore = async () => {
        setLoading(true);
        let score = 0;
        questions.forEach(q => {
            if (userAnswers[q.id] === q.correctAnswer) {
                score++;
            }
        });

        const submissionData = {
            userId: user.uid,
            quizId: quizId,
            testName: quizName,
            answers: userAnswers,
            score: score,
            totalQuestions: questions.length,
            submittedAt: firestore.FieldValue.serverTimestamp(),
        };

        try {
            await firestore().collection('submissions').add(submissionData);
            setLoading(false);
            // Result screen par bhejna
            navigation.replace('QuizResult', { submission: submissionData, questions: questions });
        } catch (error) {
            setLoading(false);
            console.error("Error saving submission: ", error);
            Alert.alert("Error", "Aapka test submit nahi ho saka.");
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
    }

    return (
        <LinearGradient colors={['#F3E5F5', '#E1BEE7']} style={styles.container}>
            <SafeAreaView style={styles.appScreen}>
                <ScrollView>
                    <View style={styles.header}>
                        <Text style={styles.screenTitle}>{quizName}</Text>
                    </View>

                    {questions.map((question, index) => (
                        <View key={question.id} style={styles.card}>
                            <Text style={styles.questionText}>{index + 1}. {question.questionText}</Text>
                            {question.options.map((option, optionIndex) => {
                                const isSelected = userAnswers[question.id] === optionIndex;
                                return (
                                    <TouchableOpacity 
                                        key={optionIndex} 
                                        style={[styles.optionButton, isSelected && styles.selectedOption]}
                                        onPress={() => handleSelectAnswer(question.id, optionIndex)}
                                    >
                                        <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ))}

                    <CustomButton 
                        title="Submit Test" 
                        onPress={handleSubmitQuiz} 
                        style={styles.submitButton} 
                    />
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    appScreen: { flex: 1 },
    header: { padding: 20 },
    screenTitle: { fontSize: 24, fontWeight: 'bold', color: '#6A1B9A', textAlign: 'center' },
    card: { backgroundColor: '#fff', padding: 15, marginHorizontal: 20, marginBottom: 15, borderRadius: 10, elevation: 3 },
    questionText: { fontSize: 16, fontWeight: '500', marginBottom: 15 },
    optionButton: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 8 },
    selectedOption: { backgroundColor: '#8E24AA', borderColor: '#8E24AA' },
    optionText: { fontSize: 15, color: '#333' },
    selectedOptionText: { color: '#fff' },
    submitButton: { backgroundColor: '#4CAF50', margin: 20 },
});

export default QuizAttemptScreen;
