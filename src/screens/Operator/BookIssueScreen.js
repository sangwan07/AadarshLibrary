import React, { useState, useEffect } from 'react';
import { 
    SafeAreaView, 
    Text, 
    View,
    FlatList,
    Alert, 
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import CustomButton from '../../components/CustomButton';
import InputField from '../../components/InputField';
import firestore from '@react-native-firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const BookIssueScreen = () => {
    const [studentName, setStudentName] = useState('');
    const [studentEmail, setStudentEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [bookName, setBookName] = useState('');
    const [bookNumber, setBookNumber] = useState('');
    const [lastDate, setLastDate] = useState('');
    const [issuedBooks, setIssuedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const issueDate = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const subscriber = firestore()
            .collection('issuedBooks')
            .orderBy('issuedAt', 'desc')
            .onSnapshot(querySnapshot => {
                const books = [];
                querySnapshot.forEach(doc => {
                    books.push({ id: doc.id, ...doc.data() });
                });
                setIssuedBooks(books);
                setLoading(false);
            });
        return () => subscriber();
    }, []);

    const handleIssue = async () => {
        if(!studentName || !studentEmail || !phone || !bookName || !bookNumber || !lastDate) {
            Alert.alert("Error", "Kripya saari fields bharein.");
            return;
        }
        try {
            await firestore().collection('issuedBooks').add({
                studentName,
                studentEmail,
                phone,
                bookName,
                bookNumber,
                issueDate,
                lastDate,
                issuedAt: firestore.FieldValue.serverTimestamp(),
            });

            Alert.alert("Success", "Book issue ho gayi hai!");
            setStudentName(''); setStudentEmail(''); setPhone(''); setBookName(''); setBookNumber(''); setLastDate('');
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Book issue nahi ho saki.");
        }
    };

    const handleReturnBook = (bookId) => {
        Alert.alert(
            "Confirm Return",
            "Kya aap sach me is book ko return mark karna chahte hain?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Yes, Return",
                    style: "destructive",
                    onPress: async () => {
                        await firestore().collection('issuedBooks').doc(bookId).delete();
                    }
                }
            ]
        );
    };

    // --- Form aur Header ko ek alag component me daal denge ---
    const renderListHeader = () => (
        <>
            <View style={styles.header}>
                <Text style={styles.screenTitle}>Issue a Book</Text>
            </View>

            <View style={styles.formContainer}>
                <InputField placeholder="Student Name" value={studentName} onChangeText={setStudentName} />
                <InputField placeholder="Student Email" value={studentEmail} onChangeText={setStudentEmail} keyboardType="email-address" />
                <InputField placeholder="Student Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                <InputField placeholder="Book Name" value={bookName} onChangeText={setBookName} />
                <InputField placeholder="Book Number" value={bookNumber} onChangeText={setBookNumber} />
                <InputField placeholder="Return Date (YYYY-MM-DD)" value={lastDate} onChangeText={setLastDate} />
                <Text style={styles.infoText}>Issue Date: {issueDate}</Text>
                <CustomButton title="Issue Book" onPress={handleIssue} style={styles.issueButton} />
            </View>

            <Text style={styles.listHeader}>Currently Issued Books</Text>
        </>
    );

    return (
        <LinearGradient colors={['#EDE7F6', '#F5F5F5']} style={styles.container}>
            <SafeAreaView style={styles.appScreen}>
                {/* --- Ab FlatList poori screen me scroll hogi --- */}
                <FlatList
                    ListHeaderComponent={renderListHeader} // Form aur header ko list ke upar dikhayenge
                    data={issuedBooks}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <MaterialCommunityIcons name="book-open-variant" size={40} color="#673AB7" />
                            <View style={styles.cardContent}>
                                <Text style={styles.bookName}>{item.bookName} ({item.bookNumber})</Text>
                                <Text style={styles.studentInfo}>To: {item.studentName} ({item.phone || item.studentEmail})</Text>
                                <Text style={styles.dateInfo}>Issued: {item.issueDate} | Return by: {item.lastDate}</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleReturnBook(item.id)}>
                                <MaterialCommunityIcons name="keyboard-return" size={28} color="#4CAF50" />
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.emptyText}>Abhi koi book issue nahi hui hai.</Text>}
                    contentContainerStyle={{ paddingBottom: 20 }} // Neeche thodi jagah
                />
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    appScreen: { flex: 1 },
    header: { padding: 20 },
    screenTitle: { fontSize: 28, fontWeight: 'bold', color: '#512DA8', textAlign: 'center' },
    formContainer: {
        backgroundColor: '#fff',
        padding: 20,
        marginHorizontal: 20,
        borderRadius: 15,
        elevation: 4,
    },
    infoText: { textAlign: 'center', marginVertical: 10, color: '#555' },
    issueButton: { backgroundColor: '#673AB7', marginTop: 10 },
    listHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginHorizontal: 20,
        marginBottom: 10,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        marginHorizontal: 20,
        marginBottom: 10,
        borderRadius: 10,
        elevation: 2,
    },
    cardContent: {
        flex: 1,
        marginLeft: 15,
    },
    bookName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    studentInfo: {
        fontSize: 14,
        color: '#666',
        marginVertical: 2,
    },
    dateInfo: {
        fontSize: 12,
        color: '#888',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
    },
});

export default BookIssueScreen;
