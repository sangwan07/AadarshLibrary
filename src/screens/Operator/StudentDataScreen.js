import React from 'react';
import { SafeAreaView, Text, View, Image, FlatList, StyleSheet } from 'react-native';
import { mockDatabase } from '../../constants/mockDatabase';

const StudentDataScreen = () => {
    const allUsers = Object.values(mockDatabase.users).filter(u => u.role === 'user');

    const renderStudent = ({ item }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.profilePhoto }} style={styles.profilePhotoSmall} />
            <View style={{flex: 1}}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text>Phone: {Object.keys(mockDatabase.users).find(key => mockDatabase.users[key] === item)}</Text>
                <Text>Seat: {item.seatId || 'None'}</Text>
                <Text>Books Issued: {item.bookHistory.length}</Text>
            </View>
        </View>
    );
    return (
        <SafeAreaView style={styles.appScreen}>
            <Text style={styles.screenTitle}>Student Data</Text>
            <FlatList data={allUsers} renderItem={renderStudent} keyExtractor={(item, index) => index.toString()} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    appScreen: { flex: 1, backgroundColor: '#FFFFFF', padding: 20 },
    screenTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20 },
    card: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 15, marginTop: 10, flexDirection: 'row', alignItems: 'center' },
    cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
    profilePhotoSmall: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
});

export default StudentDataScreen;
