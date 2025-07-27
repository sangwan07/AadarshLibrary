import React, { useState, useEffect, useContext, useRef } from 'react';
import { 
    SafeAreaView, Text, View, FlatList, TouchableOpacity, 
    StyleSheet, Alert, ActivityIndicator, Dimensions,
    Modal, Animated, Platform // Platform ko import karein
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { AuthContext } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, Pattern, Rect, Circle } from 'react-native-svg';
import CustomButton from '../../components/CustomButton';
// --- Naya Import ---
import DateTimePicker from '@react-native-community/datetimepicker';

// --- Screen Size Calculation (waisa hi hai) ---
const { width } = Dimensions.get('window');
const NUM_COLUMNS = 4;
const SCREEN_PADDING = 20;
const SEAT_MARGIN = 8;
const totalPadding = SCREEN_PADDING * 2;
const totalMargin = SEAT_MARGIN * 2 * NUM_COLUMNS;
const availableWidth = width - totalPadding - totalMargin;
const seatSize = availableWidth / NUM_COLUMNS;

// --- SVG Icons (waisa hi hai) ---
const ChairIcon = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19.98 10.86a2 2 0 0 0-1.99-.86H6a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a2 2 0 0 0-.02-1.14Z" />
    <Path d="M8 10V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" /><Path d="M7 19v2" /><Path d="M17 19v2" />
  </Svg>
);
const BackgroundPattern = () => (
    <View style={styles.patternContainer}>
        <Svg height="100%" width="100%">
            <Defs><Pattern id="doodad" patternUnits="userSpaceOnUse" width="30" height="30"><Circle cx="15" cy="15" r="1.5" fill="rgba(0, 0, 0, 0.08)" /></Pattern></Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#doodad)" />
        </Svg>
    </View>
);
const AnimatedSeat = ({ item, renderSeat }) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => { Animated.timing(scaleAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start(); }, []);
    return <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>{renderSeat({ item })}</Animated.View>;
};


const SeatChartScreen = () => {
    const { user } = useContext(AuthContext);
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedSeat, setSelectedSeat] = useState(null);
    // --- Naye State Variables Time Picker ke liye ---
    const [expiryTime, setExpiryTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);

    // ... (useEffect hooks bilkul waise hi hain) ...
    useEffect(() => {
        if (!user) return;
        const sub = firestore().collection('users').doc(user.uid).onSnapshot(doc => setUserData(doc.data()));
        return () => sub();
    }, [user]);
    useEffect(() => {
        const sub = firestore().collection('seats').orderBy('id', 'asc').onSnapshot(q => {
            const arr = [];
            q.forEach(doc => arr.push({ ...doc.data(), key: doc.id }));
            setSeats(arr);
            setLoading(false);
        });
        return () => sub();
    }, []);

    const handleSeatPress = (seat) => {
        if (!userData) return;
        if (userData.role === 'user') {
            if (seat.id === userData.seatId) { vacateSeat(seat); } 
            else if (seat.status === 'Vacant') {
                if (userData.seatId) {
                    Alert.alert("Error", "Aapke paas pehle se ek seat hai. Kripya pehle use khaali karein.");
                    return;
                }
                // Time picker ke liye initial time set karna (aaj se 1 ghanta aage)
                const defaultExpiry = new Date();
                defaultExpiry.setHours(defaultExpiry.getHours() + 1);
                setExpiryTime(defaultExpiry);
                
                setSelectedSeat(seat);
                setModalVisible(true);
            } else {
                if (seat.bookedUntil && seat.bookedUntil.toDate) {
                    const expiry = new Date(seat.bookedUntil.toDate()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                    Alert.alert(`Seat ${seat.id} Booked`, `Yeh seat ${seat.bookedByName} ne ${expiry} tak book ki hai.`);
                } else {
                    Alert.alert(`Seat ${seat.id} Booked`, `Yeh seat abhi book hai.`);
                }
            }
        } else if (userData.role === 'operator') {
            const newStatus = seat.status === 'Vacant' ? 'Occupied' : 'Vacant';
            firestore().collection('seats').doc(seat.key).update({ status: newStatus, bookedByName: null, bookedByUid: null, bookedUntil: null });
        }
    };
    
    const vacateSeat = async (seat) => {
        const seatRef = firestore().collection('seats').doc(seat.key);
        const userRef = firestore().collection('users').doc(user.uid);
        await seatRef.update({ status: 'Vacant', bookedByName: null, bookedByUid: null, bookedUntil: null });
        await userRef.update({ seatId: null });
    };

    // --- Time Picker ka onChange function ---
    const onTimeChange = (event, selectedDate) => {
        const currentDate = selectedDate || expiryTime;
        setShowTimePicker(Platform.OS === 'ios'); // iOS par picker hamesha dikhta hai
        setExpiryTime(currentDate);
    };

    // --- Naya function: Manual time se seat book karna ---
    const handleConfirmBooking = async () => {
        if (!selectedSeat || !userData || !expiryTime) return;

        // Validation: Chuna gaya time abhi ke time se aage hona chahiye
        if (expiryTime <= new Date()) {
            Alert.alert("Invalid Time", "Kripya aane wala samay chunein.");
            return;
        }

        const seatRef = firestore().collection('seats').doc(selectedSeat.key);
        const userRef = firestore().collection('users').doc(user.uid);
        try {
            await seatRef.update({
                status: 'Occupied',
                bookedByName: userData.name,
                bookedByUid: user.uid,
                bookedUntil: firestore.Timestamp.fromDate(expiryTime),
            });
            await userRef.update({ seatId: selectedSeat.id });
            setModalVisible(false);
            setSelectedSeat(null);
        } catch (error) {
            console.error("Booking Error: ", error);
            Alert.alert("Error", "Seat book nahi ho saki.");
        }
    };

    if (loading || !userData) {
        return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
    }

    const renderSeatContent = ({ item }) => {
        const isUserSeat = userData.role === 'user' && item.id === userData.seatId;
        const isOccupied = item.status === 'Occupied';
        const seatStyle = [styles.seat, isOccupied ? styles.seatOccupied : styles.seatVacant, isUserSeat && styles.userSeat];
        const iconColor = isOccupied ? '#a0a0a0' : '#4CAF50';
        let seatStatusText = isOccupied ? 'Booked' : 'Vacant';
        if (isOccupied && item.bookedUntil && typeof item.bookedUntil.toDate === 'function') {
            const expiry = new Date(item.bookedUntil.toDate()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            seatStatusText = `Till ${expiry}`;
        }
        return (
            <TouchableOpacity style={seatStyle} onPress={() => handleSeatPress(item)}>
                <Text style={styles.seatIdText}>{item.id}</Text>
                <ChairIcon size={seatSize * 0.5} color={isUserSeat ? '#fff' : iconColor} />
                <Text style={[styles.seatStatusText, isUserSeat && { color: '#fff' }]}>{seatStatusText}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <LinearGradient colors={['#E3F2FD', '#F4F6F8', '#fff']} style={styles.container}>
            <SafeAreaView style={styles.appScreen}>
                {/* ... (Header aur Legend bilkul waise hi hain) ... */}
                <View style={styles.header}>
                    <Text style={styles.screenTitle}>Seat Chart</Text>
                    <Text style={styles.subtitle}>Apni pasand ki seat chunein</Text>
                </View>
                <View style={styles.mainContent}>
                    <BackgroundPattern />
                    <View style={styles.legendContainer}>
                        <View style={styles.legendItem}><View style={[styles.legendBox, styles.seatVacant]} /><Text>Vacant</Text></View>
                        <View style={styles.legendItem}><View style={[styles.legendBox, styles.seatOccupied]} /><Text>Booked</Text></View>
                        <View style={styles.legendItem}><View style={[styles.legendBox, styles.userSeat]} /><Text>Aapki Seat</Text></View>
                    </View>
                    <FlatList
                        data={seats}
                        renderItem={({ item }) => <AnimatedSeat item={item} renderSeat={renderSeatContent} />}
                        keyExtractor={item => item.key}
                        numColumns={NUM_COLUMNS}
                        contentContainerStyle={styles.seatGrid}
                    />
                </View>

                {/* --- Naya Booking Modal Time Picker ke saath --- */}
                <Modal
                    animationType="slide" transparent={true} visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Book Seat {selectedSeat?.id}</Text>
                            <Text style={styles.modalSubtitle}>Aap yeh seat kab tak book karna chahte hain?</Text>
                            
                            {/* Time Picker dikhane ka button */}
                            <TouchableOpacity style={styles.timeDisplay} onPress={() => setShowTimePicker(true)}>
                                <Text style={styles.timeDisplayText}>
                                    {expiryTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </TouchableOpacity>

                            {/* Android aur iOS ke liye Time Picker */}
                            {showTimePicker && (
                                <DateTimePicker
                                    testID="dateTimePicker"
                                    value={expiryTime}
                                    mode={'time'}
                                    is24Hour={false}
                                    display="default"
                                    onChange={onTimeChange}
                                />
                            )}

                            <CustomButton title="Confirm Booking" onPress={handleConfirmBooking} style={styles.modalButton} />
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

            </SafeAreaView>
        </LinearGradient>
    );
};

// --- Naye Styles ---
const styles = StyleSheet.create({
    container: { flex: 1 },
    appScreen: { flex: 1 },
    header: { paddingVertical: 20, paddingHorizontal: SCREEN_PADDING },
    screenTitle: { fontSize: 28, fontWeight: 'bold', color: '#1A237E', textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#555', textAlign: 'center', marginTop: 4 },
    mainContent: { flex: 1, backgroundColor: '#fff', marginHorizontal: 10, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 5, padding: 15, overflow: 'hidden' },
    patternContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 },
    legendContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20, paddingVertical: 10 },
    legendItem: { flexDirection: 'row', alignItems: 'center' },
    legendBox: { width: 18, height: 18, marginRight: 8, borderRadius: 4, borderWidth: 1 },
    seatGrid: { justifyContent: 'center', alignItems: 'center', paddingBottom: 20 },
    seat: { width: seatSize, height: seatSize, justifyContent: 'center', alignItems: 'center', margin: SEAT_MARGIN, borderRadius: 12, borderWidth: 1, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    seatVacant: { backgroundColor: 'rgba(255, 255, 255, 0.85)', borderColor: '#4CAF50' },
    seatOccupied: { backgroundColor: 'rgba(224, 224, 224, 0.85)', borderColor: '#a0a0a0' },
    userSeat: { backgroundColor: '#3F51B5', borderColor: '#1A237E' },
    seatIdText: { fontWeight: 'bold', fontSize: seatSize * 0.15, position: 'absolute', top: 5, color: '#555' },
    seatStatusText: { fontSize: seatSize * 0.12, fontWeight: '600', position: 'absolute', bottom: 5, color: '#777' },
    // Modal Styles
    modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
    modalSubtitle: { fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 20 },
    timeDisplay: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginBottom: 15,
    },
    timeDisplayText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A237E'
    },
    modalButton: { backgroundColor: '#3F51B5', marginVertical: 5 },
    cancelText: { textAlign: 'center', color: '#D32F2F', marginTop: 15, fontSize: 16, fontWeight: 'bold' },
});

export default SeatChartScreen;
