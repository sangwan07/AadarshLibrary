import React, { useState, useEffect } from 'react';
import { 
    SafeAreaView, Text, View, StyleSheet, Alert, 
    ActivityIndicator, ScrollView, TextInput, TouchableOpacity 
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import CustomButton from '../../components/CustomButton';
import InputField from '../../components/InputField';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// --- Ek Sawaal ke liye alag se component ---
// Isse hamara main code saaf rahega
const QuestionInputCard = ({ question, index, onUpdate, onRemove }) => {
    const updateOption = (optionIndex, text) => {
        const newOptions = [...question.options];
        newOptions[optionIndex] = text;
        onUpdate(index, { ...question, options: newOptions });
    };

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Question {index + 1}</Text>
                <TouchableOpacity onPress={() => onRemove(index)}>
                    <MaterialCommunityIcons name="close-circle" size={24} color="#D32F2F" />
                </TouchableOpacity>
            </View>
            <TextInput
                style={styles.questionInput}
                placeholder="Yahan sawaal type karein..."
                value={question.questionText}
                onChangeText={(text) => onUpdate(index, { ...question, questionText: text })}
                multiline
            />
            
            <Text style={styles.optionsHeader}>Options:</Text>
            {question.options.map((option, optionIndex) => (
                <View key={optionIndex} style={styles.optionContainer}>
                    <TextInput
                        style={styles.optionInput}
                        placeholder={`Option ${optionIndex + 1}`}
                        value={option}
                        onChangeText={(text) => updateOption(optionIndex, text)}
                    />
                    <TouchableOpacity onPress={() => onUpdate(index, { ...question, correctAnswer: optionIndex })}>
                        <MaterialCommunityIcons 
                            name={question.correctAnswer === optionIndex ? 'radiobox-marked' : 'radiobox-blank'} 
                            size={24} 
                            color="#8E24AA" 
                        />
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    );
};


const CreateQuizScreen = ({ navigation }) => {
    const [testName, setTestName] = useState('');
    const [testNumber, setTestNumber] = useState('');
    const [questions, setQuestions] = useState([
        // Shuruaat ke liye ek khaali sawaal
        { questionText: '', options: ['', '', '', ''], correctAnswer: 0 }
    ]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Test Number ko automatically set karna
        const fetchLastTestNumber = async () => {
            const querySnapshot = await firestore().collection('quizzes').orderBy('testNumber', 'desc').limit(1).get();
            if (!querySnapshot.empty) {
                const lastTest = querySnapshot.docs[0].data();
                setTestNumber(String(lastTest.testNumber + 1));
            } else {
                setTestNumber('1');
            }
        };
        fetchLastTestNumber();
    }, []);

    const handleUpdateQuestion = (index, updatedQuestion) => {
        const newQuestions = [...questions];
        newQuestions[index] = updatedQuestion;
        setQuestions(newQuestions);
    };

    const handleAddQuestion = () => {
        if (questions.length >= 100) {
            Alert.alert("Limit Reached", "Aap ek test me maximum 100 sawaal hi add kar sakte hain.");
            return;
        }
        setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: 0 }]);
    };
    
    const handleRemoveQuestion = (index) => {
        if (questions.length <= 1) {
            Alert.alert("Cannot Remove", "Test me kam se kam ek sawaal hona zaroori hai.");
            return;
        }
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
    };

    const handleCreateQuiz = async () => {
        // Validation
        if (!testName || !testNumber || questions.some(q => !q.questionText || q.options.some(o => !o))) {
            Alert.alert("Error", "Kripya saari fields (Test Name, Number, aur saare sawaal/options) bharein.");
            return;
        }

        setLoading(true);
        try {
            // Pehle quiz ka main document banayenge
            const quizRef = await firestore().collection('quizzes').add({
                testName,
                testNumber: parseInt(testNumber, 10),
                questionCount: questions.length,
                createdAt: firestore.FieldValue.serverTimestamp(),
            });

            // Ab batch write ka istemaal karke saare sawaal ek saath add karenge
            const batch = firestore().batch();
            questions.forEach((questionData) => {
                const questionRef = quizRef.collection('questions').doc(); // Naya document reference
                batch.set(questionRef, questionData);
            });
            await batch.commit();

            setLoading(false);
            Alert.alert("Success", "Quiz successfully ban gaya hai!");
            navigation.goBack();

        } catch (error) {
            setLoading(false);
            console.error(error);
            Alert.alert("Error", "Quiz banane me koi samasya aa gayi.");
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
    }

    return (
        <LinearGradient colors={['#F3E5F5', '#E1BEE7']} style={styles.container}>
            <SafeAreaView>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.header}>
                        <Text style={styles.screenTitle}>Create New Quiz</Text>
                    </View>
                    
                    <View style={styles.formContainer}>
                        <InputField placeholder="Test Name (e.g., Weekly GK Test)" value={testName} onChangeText={setTestName} />
                        <InputField placeholder="Test Number" value={testNumber} onChangeText={setTestNumber} keyboardType="numeric" />
                    </View>

                    {questions.map((q, index) => (
                        <QuestionInputCard 
                            key={index}
                            question={q}
                            index={index}
                            onUpdate={handleUpdateQuestion}
                            onRemove={handleRemoveQuestion}
                        />
                    ))}

                    <View style={styles.buttonContainer}>
                        <CustomButton title="Add Another Question" onPress={handleAddQuestion} style={styles.addButton} />
                        <CustomButton title="Create Quiz" onPress={handleCreateQuiz} style={styles.createButton} />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContainer: { paddingBottom: 50 },
    header: { padding: 20 },
    screenTitle: { fontSize: 28, fontWeight: 'bold', color: '#6A1B9A', textAlign: 'center' },
    formContainer: { paddingHorizontal: 20, marginBottom: 10 },
    card: { backgroundColor: '#fff', padding: 15, marginHorizontal: 20, marginBottom: 15, borderRadius: 10, elevation: 3 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#4A148C' },
    questionInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 10, minHeight: 60, textAlignVertical: 'top' },
    optionsHeader: { marginTop: 15, marginBottom: 5, fontWeight: '500', color: '#666' },
    optionContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    optionInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 8, marginRight: 10 },
    buttonContainer: { paddingHorizontal: 20, marginTop: 20 },
    addButton: { backgroundColor: '#4CAF50' },
    createButton: { backgroundColor: '#8E24AA', marginTop: 10 },
});

export default CreateQuizScreen;
