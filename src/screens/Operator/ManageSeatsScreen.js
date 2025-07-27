import React, { useState, useEffect } from 'react';
import { 
    SafeAreaView, 
    Text, 
    View, 
    FlatList, 
    StyleSheet, 
    Alert, 
    ActivityIndicator,
    TouchableOpacity
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import CustomButton from '../../components/CustomButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ManageSeatsScreen = () => {
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const subscriber = firestore()
            .collection('seats')
            .onSnapshot(querySnapshot => {
                const seatsArray = [];
                querySnapshot.forEach(documentSnapshot => {
                    seatsArray.push({
                        ...documentSnapshot.data(),
                        key: documentSnapshot.id,
                    });
                });
                
                // --- YAHAN BADLAV KIYA GAYA HAI ---
                // Seats ko number ke hisaab se sort karna, lekin surakshit tareeke se
                seatsArray.sort((a, b) => {
                    // Pehle check karein ki 'id' field hai ya nahi
                    if (!a.id || !b.id) {
                        return 0; // Agar id nahi hai, toh order na badlein
                    }
                    try {
                        const numA = parseInt(a.id.toString().replace(/[^0-9]/g, ''), 10);
                        const numB = parseInt(b.id.toString().replace(/[^0-9]/g, ''), 10);
                        // Check karein ki number sahi se mila ya nahi
                        if (isNaN(numA) || isNaN(numB)) {
                            return 0;
                        }
                        return numA - numB;
                    } catch (error) {
                        // Agar koi aur error aaye, toh order na badlein
                        return 0;
                    }
                });

                setSeats(seatsArray);
                setLoading(false);
            });
        return () => subscriber();
    }, []);

    const handleAddSeat = async () => {
        setLoading(true);
        try {
            let lastSeatNumber = 0;
            if (seats.length > 0) {
                // Aakhri seat ko dhoondhna
                const validSeatsWithIds = seats.filter(s => s.id && !isNaN(parseInt(s.id.toString().replace(/[^0-9]/g, ''), 10)));
                if (validSeatsWithIds.length > 0) {
                    const lastSeatId = validSeatsWithIds[validSeatsWithIds.length - 1].id;
                    lastSeatNumber = parseInt(lastSeatId.toString().replace(/[^0-9]/g, ''), 10);
                }
            }
            const newSeatId = `${lastSeatNumber + 1}`;

            await firestore().collection('seats').add({
                id: newSeatId,
                status: 'Vacant'
            });
            Alert.alert("Success", `Seat number ${newSeatId} add ho gayi hai.`);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Nayi seat add nahi ho saki.");
        }
        setLoading(false);
    };

    const handleDeleteSeat = (seat) => {
        if (seat.status === 'Occupied') {
            Alert.alert("Error", "Yeh seat abhi book hai. Isse delete nahi kiya ja sakta.");
            return;
        }

        Alert.alert(
            "Confirm Delete",
            `Kya aap sach me seat number ${seat.id} ko delete karna chahte hain?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await firestore().collection('seats').doc(seat.key).delete();
                            Alert.alert("Success", `Seat number ${seat.id} delete ho gayi hai.`);
                        } catch (error) {
                            console.error(error);
                            Alert.alert("Error", "Seat delete nahi ho saki.");
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
    }

    return (
        <LinearGradient colors={['#FFF3E0', '#FFE0B2', '#FFCC80']} style={styles.container}>
            <SafeAreaView style={styles.appScreen}>
                <View style={styles.header}>
                    <Text style={styles.screenTitle}>Manage Seats</Text>
                    <Text style={styles.subtitle}>Add New Seats Or Remove</Text>
                </View>

                <CustomButton
                    title="Add a New Seat"
                    onPress={handleAddSeat}
                    style={styles.addButton}
                />

                <FlatList
                    data={seats}
                    keyExtractor={item => item.key}
                    renderItem={({ item }) => (
                        <View style={styles.seatRow}>
                            <MaterialCommunityIcons 
                                name="chair-school" // <-- YAHAN BADLAV KIYA GAYA HAI
                                size={24} 
                                color={item.status === 'Occupied' ? '#BDBDBD' : '#4CAF50'} 
                            />
                            <Text style={styles.seatIdText}>Seat: {item.id || 'N/A'}</Text>
                            <Text style={[styles.statusText, { color: item.status === 'Occupied' ? '#BDBDBD' : '#4CAF50' }]}>
                                ({item.status})
                            </Text>
                            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteSeat(item)}>
                                <MaterialCommunityIcons name="delete-outline" size={24} color="#D32F2F" />
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.emptyText}>Abhi library me koi seat nahi hai.</Text>}
                />
            </SafeAreaView>
        </LinearGradient>
    );
};

// --- Styles bilkul wahi hain ---
const styles = StyleSheet.create({
    container: { flex: 1 },
    appScreen: { flex: 1 },
    header: { padding: 20 },
    screenTitle: { fontSize: 28, fontWeight: 'bold', color: '#E65100', textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 4 },
    addButton: { backgroundColor: '#4CAF50', marginHorizontal: 20, marginBottom: 20, elevation: 4 },
    seatRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        marginHorizontal: 20,
        marginBottom: 10,
        borderRadius: 10,
        elevation: 2,
    },
    seatIdText: {
        flex: 1,
        marginLeft: 15,
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
        marginRight: 15,
    },
    deleteButton: {},
    emptyText: { textAlign: 'center', marginTop: 30, color: '#888', fontSize: 16 },
});

export default ManageSeatsScreen;
