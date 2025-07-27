import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, Animated, StyleSheet, StatusBar } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// Splash Screen ko yahan rakha ja sakta hai ya alag file me bhi.
const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 2000, useNativeDriver: true }).start();
  }, [fadeAnim]);

  return (
    <View style={styles.splashContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#1A237E" />
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image source={require('./assets/logo.png')} style={styles.splashLogo} />
        <Text style={styles.splashTitle}>Village Library</Text>
        <Text style={styles.splashSubtitle}>Knowledge at Your Fingertips</Text>
      </Animated.View>
    </View>
  );
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2500); // Splash screen 2.5 seconds ke liye
  }, []);

  return (
    <AuthProvider>
      {isLoading ? <SplashScreen /> : <AppNavigator />}
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#1A237E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashLogo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    alignSelf: 'center'
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center'
  },
  splashSubtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center'
  },
});
