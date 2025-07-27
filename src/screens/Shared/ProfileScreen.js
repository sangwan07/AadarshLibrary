import React, { useState, useEffect, useContext } from 'react';
import { 
    SafeAreaView, 
    Text, 
    View, 
    StyleSheet, 
    ActivityIndicator, 
    ScrollView,
    StatusBar
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import CustomButton from '../../components/CustomButton';
import firestore from '@react-native-firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [bookHistory, setBookHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // User ka data (jaise naam, email) fetch karna
  useEffect(() => {
    if (!user) return;
    const userSubscriber = firestore()
      .collection('users')
      .doc(user.uid)
      .onSnapshot(documentSnapshot => {
        const data = documentSnapshot.data();
        setUserData(data);
        if (data) {
          // User ka data milne par book history fetch karein
          fetchBookHistory(data.email); 
        }
        setLoading(false);
      });
    return () => userSubscriber();
  }, [user]);

  // User ki book history fetch karna
  const fetchBookHistory = (userEmail) => {
    // Note: Firestore me book issue karte samay studentEmail field save karna zaroori hai
    const subscriber = firestore()
      .collection('issuedBooks')
      .where('studentEmail', '==', userEmail)
      .onSnapshot(querySnapshot => {
        const books = [];
        querySnapshot.forEach(doc => {
          books.push({ id: doc.id, ...doc.data() });
        });
        setBookHistory(books);
      });
    return subscriber;
  };


  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  if (!userData) {
      return (
          <SafeAreaView style={styles.appScreen}>
              <Text>User data load nahi ho saka.</Text>
              <CustomButton title="Logout" onPress={logout} style={styles.logoutButton} />
          </SafeAreaView>
      );
  }

  return (
    <LinearGradient colors={['#7986CB', '#E8EAF6']} style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.header}>
                <View style={styles.profilePicContainer}>
                    {/* Placeholder Profile Picture */}
                    <Text style={styles.profilePicText}>{userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}</Text>
                </View>
                <Text style={styles.profileName}>{userData.name}</Text>
                <Text style={styles.profileRole}>{userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}</Text>
            </View>

            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <MaterialCommunityIcons name="information-outline" size={24} color="#3F51B5" />
                    <Text style={styles.cardTitle}>Details</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email:</Text>
                    <Text style={styles.detailValue}>{userData.email}</Text>
                </View>
                {userData.role === 'user' && (
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Current Seat:</Text>
                        <Text style={styles.detailValue}>{userData.seatId || 'Not Assigned'}</Text>
                    </View>
                )}
            </View>

            {userData.role === 'user' && (
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="book-open-variant" size={24} color="#3F51B5" />
                        <Text style={styles.cardTitle}>My Book History</Text>
                    </View>
                    {bookHistory.length > 0 ? (
                        bookHistory.map(book => (
                            <View key={book.id} style={styles.bookRow}>
                                <Text style={styles.bookName}>{book.bookName}</Text>
                                <Text style={styles.bookDates}>Issued: {book.issueDate} | Return: {book.lastDate}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noBooksText}>Aapne abhi tak koi book issue nahi ki hai.</Text>
                    )}
                </View>
            )}

            <CustomButton title="Logout" onPress={logout} style={styles.logoutButton} />
        </ScrollView>
    </LinearGradient>
  );
};

// --- Naye aur Behtar Styles ---
const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContainer: { paddingBottom: 30 },
    header: { alignItems: 'center', paddingVertical: 30 },
    profilePicContainer: { 
        width: 140, 
        height: 140, 
        borderRadius: 70, 
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4, 
        borderColor: '#fff',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    profilePicText: {
        fontSize: 60,
        fontWeight: 'bold',
        color: '#3F51B5',
    },
    profileName: { 
        fontSize: 26, 
        fontWeight: 'bold', 
        color: '#fff', 
        marginTop: 15, 
        textShadowColor: 'rgba(0, 0, 0, 0.3)', 
        textShadowOffset: { width: 1, height: 1 }, 
        textShadowRadius: 2 
    },
    profileRole: { fontSize: 16, color: '#E8EAF6', marginTop: 5 },
    card: { 
        backgroundColor: '#fff', 
        borderRadius: 15, 
        padding: 20, 
        marginHorizontal: 20, 
        marginBottom: 15, 
        elevation: 5, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 5 
    },
    cardHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        borderBottomWidth: 1, 
        borderBottomColor: '#eee', 
        paddingBottom: 10, 
        marginBottom: 10 
    },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A237E', marginLeft: 10 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
    detailLabel: { fontSize: 15, color: '#555', fontWeight: '500' },
    detailValue: { fontSize: 15, color: '#111' },
    bookRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
    bookName: { fontSize: 16, fontWeight: '600', color: '#333' },
    bookDates: { fontSize: 12, color: '#777', marginTop: 2 },
    noBooksText: { textAlign: 'center', color: '#888', paddingVertical: 10 },
    logoutButton: { backgroundColor: '#D32F2F', marginHorizontal: 20, marginTop: 10, elevation: 5 },
    appScreen: { flex: 1 }, // Sirf error se bachne ke liye
});

export default ProfileScreen;
