import React, { useState, useEffect } from 'react';
import { 
    SafeAreaView, Text, View, StyleSheet, 
    ActivityIndicator, ScrollView, TouchableOpacity 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import firestore from '@react-native-firebase/firestore'; // Firestore ko import karein

const QuizResultScreen = ({ route, navigation }) => {
    // route.params se submission aur questions dono lene ki koshish karein
    const { submission } = route.params;
    const initialQuestions = route.params.questions;

    const [questions, setQuestions] = useState(initialQuestions || []);
    const [loading, setLoading] = useState(!initialQuestions); // Agar questions nahi hain, toh loading dikhao

    // --- Naya useEffect Sawaalon ko Fetch Karne ke Liye ---
    useEffect(() => {
        // Agar questions pehle se nahi hain, tabhi unhe fetch karo
        if (!initialQuestions && submission?.quizId) {
            const fetchQuestions = async () => {
                try {
                    const questionsSnapshot = await firestore()
                        .collection('quizzes')
                        .doc(submission.quizId)
                        .collection('questions')
                        .get();
                    
                    const questionsArray = questionsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setQuestions(questionsArray);
                    setLoading(false);
                } catch (error) {
                    console.error("Error fetching questions for result: ", error);
                    setLoading(false);
                    Alert.alert("Error", "Sawaal load nahi ho sake.");
                }
            };
            fetchQuestions();
        }
    }, [initialQuestions, submission]);


    const renderQuestionResult = (question, index) => {
        const userAnswer = submission.answers[question.id];
        const isCorrect = userAnswer === question.correctAnswer;

        return (
            <View key={question.id} style={styles.card}>
                <Text style={styles.questionText}>{index + 1}. {question.questionText}</Text>
                {question.options.map((option, optionIndex) => {
                    let optionStyle = styles.optionButton;
                    let icon = 'radiobox-blank';
                    let iconColor = '#aaa';

                    if (optionIndex === question.correctAnswer) {
                        optionStyle = [styles.optionButton, styles.correctOption];
                        icon = 'check-circle';
                        iconColor = '#388E3C';
                    }
                    if (optionIndex === userAnswer && !isCorrect) {
                        optionStyle = [styles.optionButton, styles.incorrectOption];
                        icon = 'close-circle';
                        iconColor = '#D32F2F';
                    }
                    
                    return (
                        <View key={optionIndex} style={optionStyle}>
                            <Text style={styles.optionText}>{option}</Text>
                            <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
                        </View>
                    );
                })}
            </View>
        );
    };

    if (loading) {
        return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
    }

    return (
        <LinearGradient colors={['#F3E5F5', '#E1BEE7']} style={styles.container}>
            <SafeAreaView style={styles.appScreen}>
                <ScrollView>
                    <View style={styles.header}>
                        <Text style={styles.screenTitle}>Test Result</Text>
                        <Text style={styles.quizName}>{submission.testName}</Text>
                    </View>

                    <View style={styles.scoreCard}>
                        <Text style={styles.scoreLabel}>Your Score</Text>
                        <Text style={styles.scoreText}>
                            {submission.score} / {submission.totalQuestions}
                        </Text>
                    </View>

                    {questions.map((q, index) => renderQuestionResult(q, index))}
                    
                    <TouchableOpacity style={styles.doneButton} onPress={() => navigation.navigate('QuizList')}>
                        <Text style={styles.doneButtonText}>Done</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    appScreen: { flex: 1 },
    header: { padding: 20 },
    screenTitle: { fontSize: 28, fontWeight: 'bold', color: '#6A1B9A', textAlign: 'center' },
    quizName: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 5 },
    scoreCard: { backgroundColor: '#fff', padding: 20, marginHorizontal: 20, marginBottom: 20, borderRadius: 15, alignItems: 'center', elevation: 5 },
    scoreLabel: { fontSize: 18, color: '#666' },
    scoreText: { fontSize: 40, fontWeight: 'bold', color: '#8E24AA', marginTop: 5 },
    card: { backgroundColor: '#fff', padding: 15, marginHorizontal: 20, marginBottom: 15, borderRadius: 10, elevation: 3 },
    questionText: { fontSize: 16, fontWeight: '500', marginBottom: 15 },
    optionButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 8 },
    correctOption: { backgroundColor: '#C8E6C9', borderColor: '#388E3C' },
    incorrectOption: { backgroundColor: '#FFCDD2', borderColor: '#D32F2F' },
    optionText: { fontSize: 15, color: '#333', flex: 1 },
    doneButton: { backgroundColor: '#8E24AA', padding: 15, margin: 20, borderRadius: 10, alignItems: 'center' },
    doneButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default QuizResultScreen;
