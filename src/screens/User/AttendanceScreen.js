import React, { useState, useEffect, useContext } from 'react';
import { SafeAreaView, Text, View, FlatList, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import CustomButton from '../../components/CustomButton';
import firestore from '@react-native-firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// --- Naya function jo hamesha local date dega ---
const getTodayDateString = () => {
    const todayDate = new Date();
    const year = todayDate.getFullYear();
    // Months 0 se shuru hote hain, isliye +1 karna zaroori hai
    const month = String(todayDate.getMonth() + 1).padStart(2, '0'); 
    const day = String(todayDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};


const AttendanceScreen = () => {
    const { user } = useContext(AuthContext);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const subscriber = firestore().collection('users').doc(user.uid).onSnapshot(doc => {
            setUserData(doc.data());
            setLoading(false);
        });
        return () => subscriber();
    }, [user]);

    const markAttendance = async () => {
        if (!user) return;
        // Yahan bhi naya function use karenge
        const today = getTodayDateString(); 
        const userRef = firestore().collection('users').doc(user.uid);
        await userRef.update({ [`attendance.${today}`]: 'Present' });
        Alert.alert("Success", "Aapki aaj ki attendance mark ho gayi hai!");
    };

    if (loading) {
        return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
    }

    const attendanceData = userData?.attendance || {};
    // Yahan bhi naya function use karenge
    const today = getTodayDateString(); 
    const isMarkedToday = !!attendanceData[today];

    return (
        <LinearGradient colors={['#E0F2F1', '#F4F6F8', '#fff']} style={styles.container}>
            <SafeAreaView style={styles.appScreen}>
                <View style={styles.header}>
                    <Text style={styles.screenTitle}>My Attendance</Text>
                    <Text style={styles.subtitle}>Apni daily presence mark karein</Text>
                </View>

                <View style={styles.mainContent}>
                    <CustomButton 
                        title="Mark Today's Attendance" 
                        onPress={markAttendance} 
                        disabled={isMarkedToday} 
                        style={[styles.markButton, isMarkedToday && styles.disabledButton]}
                    />
                    {isMarkedToday && <Text style={styles.infoText}>Aapne aaj ki attendance mark kar di hai.</Text>}
                    
                    <Text style={styles.listHeader}>Monthly View</Text>
                    
                    <FlatList
                        data={Object.entries(attendanceData).reverse()}
                        keyExtractor={item => item[0]}
                        renderItem={({ item }) => (
                            <View style={styles.attendanceRow}>
                                <MaterialCommunityIcons name="calendar-check" size={24} color="#00796B" />
                                <Text style={styles.dateText}>{item[0]}</Text>
                                <Text style={styles.statusText}>{item[1]}</Text>
                            </View>
                        )}
                        ListEmptyComponent={<Text style={styles.emptyText}>Abhi koi attendance record nahi hai.</Text>}
                    />
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
};

// --- Styles bilkul wahi hain ---
const styles = StyleSheet.create({
    container: { flex: 1 },
    appScreen: { flex: 1 },
    header: { paddingVertical: 20, paddingHorizontal: 20 },
    screenTitle: { fontSize: 28, fontWeight: 'bold', color: '#004D40', textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#555', textAlign: 'center', marginTop: 4 },
    mainContent: { flex: 1, backgroundColor: '#fff', marginHorizontal: 10, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 5, padding: 20 },
    markButton: { backgroundColor: '#00796B', elevation: 4 },
    disabledButton: { backgroundColor: '#BDBDBD' },
    infoText: { textAlign: 'center', marginTop: 15, color: '#00796B', fontWeight: '500' },
    listHeader: { marginTop: 30, fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5 },
    attendanceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    dateText: { flex: 1, marginLeft: 15, fontSize: 16, color: '#333' },
    statusText: { fontSize: 16, color: '#00796B', fontWeight: 'bold' },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#888' },
});

export default AttendanceScreen;
