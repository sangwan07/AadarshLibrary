import React, { useState, useEffect, useContext } from 'react';
import { 
    SafeAreaView, Text, View, FlatList, StyleSheet, 
    ActivityIndicator, TouchableOpacity, Alert
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { useIsFocused } from '@react-navigation/native';

const QuizListScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const [quizzes, setQuizzes] = useState([]);
    const [userSubmissions, setUserSubmissions] = useState({});
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (!user || !isFocused) return;
        
        setLoading(true);
        
        const userSub = firestore().collection('users').doc(user.uid).onSnapshot(doc => setUserData(doc.data()));

        const submissionsSub = firestore().collection('submissions').where('userId', '==', user.uid).onSnapshot(querySnapshot => {
            const subs = {};
            querySnapshot.forEach(doc => {
                subs[doc.data().quizId] = doc.data();
            });
            setUserSubmissions(subs);
        });

        const quizzesSub = firestore().collection('quizzes').orderBy('createdAt', 'desc').onSnapshot(querySnapshot => {
            const now = new Date();
            const quizzesArray = [];
            querySnapshot.forEach(doc => {
                const quizData = { id: doc.id, ...doc.data() };
                const createdAt = quizData.createdAt.toDate();
                const expiresAt = new Date(createdAt.getTime() + 10 * 24 * 60 * 60 * 1000);
                
                quizData.status = now > expiresAt ? 'Expired' : 'New';
                quizzesArray.push(quizData);
            });
            setQuizzes(quizzesArray);
            setLoading(false);
        });

        return () => {
            userSub();
            submissionsSub();
            quizzesSub();
        };
    }, [user, isFocused]);

    const getStatusBadge = (quiz) => {
        if (quiz.status === 'Expired' && !userSubmissions[quiz.id]) {
            return { text: '🔴 Expired', color: '#D32F2F' };
        }
        if (userSubmissions[quiz.id]) {
            return { text: '🟡 Attempted', color: '#FFA000' };
        }
        return { text: '🟢 New', color: '#388E3C' };
    };

    const handlePressQuiz = (quiz) => {
        const status = getStatusBadge(quiz);
        if (status.text === '🔴 Expired') {
            Alert.alert("Test Expired", "Yeh test ab attempt ke liye available nahi hai.");
            return;
        }
        if (status.text === '🟡 Attempted') {
            navigation.navigate('QuizResult', { submission: userSubmissions[quiz.id] });
            return;
        }
        navigation.navigate('QuizAttempt', { quizId: quiz.id, quizName: quiz.testName });
    };

    if (loading || !userData) {
        return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
    }

    // --- YAHAN PAR LOGIC BADLA GAYA HAI ---
    // User ko ab "New" aur "Attempted" dono quizzes dikhenge
    const filteredQuizzes = userData.role === 'operator' 
        ? quizzes 
        : quizzes.filter(q => {
            const badgeText = getStatusBadge(q).text;
            return badgeText === '🟢 New' || badgeText === '🟡 Attempted';
        });

    return (
        <LinearGradient colors={['#F3E5F5', '#E1BEE7']} style={styles.container}>
            <SafeAreaView style={styles.appScreen}>
                <View style={styles.header}>
                    <Text style={styles.screenTitle}>Quiz Tests</Text>
                </View>

                <FlatList
                    data={filteredQuizzes}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        const badge = getStatusBadge(item);
                        return (
                            <TouchableOpacity style={styles.card} onPress={() => handlePressQuiz(item)}>
                                <View style={styles.cardIcon}>
                                    <MaterialCommunityIcons name="fountain-pen-tip" size={30} color="#8E24AA" />
                                </View>
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle}>{item.testName}</Text>
                                    <Text style={styles.cardSubtitle}>Test No: {item.testNumber}</Text>
                                </View>
                                <View style={[styles.badge, { backgroundColor: badge.color }]}>
                                    <Text style={styles.badgeText}>{badge.text}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                    ListEmptyComponent={<Text style={styles.emptyText}>Abhi koi naya quiz available nahi hai.</Text>}
                />

                {userData.role === 'operator' && (
                    <TouchableOpacity 
                        style={styles.fab} 
                        onPress={() => navigation.navigate('CreateQuiz')}
                    >
                        <MaterialCommunityIcons name="plus" size={30} color="#fff" />
                    </TouchableOpacity>
                )}
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    appScreen: { flex: 1 },
    header: { padding: 20 },
    screenTitle: { fontSize: 28, fontWeight: 'bold', color: '#6A1B9A', textAlign: 'center' },
    card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, marginHorizontal: 20, marginBottom: 10, borderRadius: 10, elevation: 3 },
    cardIcon: { marginRight: 15 },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: 'bold' },
    cardSubtitle: { fontSize: 12, color: '#666' },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#888' },
    fab: { position: 'absolute', right: 30, bottom: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#8E24AA', justifyContent: 'center', alignItems: 'center', elevation: 8 },
});

export default QuizListScreen;
