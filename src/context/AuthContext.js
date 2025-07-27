import React, { createContext, useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Yeh ab poora user profile (role ke saath) store karega
  const [initializing, setInitializing] = useState(true);

  // Yeh function ab user ke login hone par uska role bhi Firestore se laayega
  function onAuthStateChanged(firebaseUser) {
    if (firebaseUser) {
      const subscriber = firestore()
        .collection('users')
        .doc(firebaseUser.uid)
        .onSnapshot(documentSnapshot => {
          setUser(documentSnapshot.data()); // User ka poora data (role ke saath) set karna
          if (initializing) setInitializing(false);
        });
      return subscriber;
    } else {
      setUser(null);
      if (initializing) setInitializing(false);
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  // Baaki saare functions waise hi rahenge
  const authContextValue = {
    user,
    initializing,
    login: async (email, password) => {
      try {
        await auth().signInWithEmailAndPassword(email, password);
        return { success: true };
      } catch (e) {
        return { success: false, message: e.message };
      }
    },
    signUp: async (email, password, name) => {
      try {
        const userCredential = await auth().createUserWithEmailAndPassword(email, password);
        await firestore().collection('users').doc(userCredential.user.uid).set({
            uid: userCredential.user.uid,
            name: name,
            email: email,
            role: 'user',
            profilePhoto: `https://placehold.co/100x100/E0F7FA/333?text=${name.charAt(0)}`,
            seatId: null,
            attendance: {}
        });
        return { success: true };
      } catch (e) {
        return { success: false, message: e.message };
      }
    },
    resetPassword: async (email) => {
        try {
            await auth().sendPasswordResetEmail(email);
            return { success: true, message: 'Password reset link aapke email par bhej diya gaya hai.' };
        } catch (e) {
            return { success: false, message: e.message };
        }
    },
    logout: async () => {
      try {
        await auth().signOut();
      } catch (error) {
        console.error(error);
      }
    },
  };

  if (initializing) return null;

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

