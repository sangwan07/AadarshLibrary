import React from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import CustomButton from '../../components/CustomButton';

const RoleSelectionScreen = ({ navigation }) => (
  <SafeAreaView style={styles.container}>
    <Text style={styles.title}>Welcome!</Text>
    <Text style={styles.subtitle}>How would you like to continue?</Text>
    <CustomButton title="Run as Operator" onPress={() => navigation.navigate('Auth', { role: 'operator' })} />
    <CustomButton title="Run as User" onPress={() => navigation.navigate('Auth', { role: 'user' })} style={{ backgroundColor: '#00796B' }} />
  </SafeAreaView>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5', justifyContent: 'center', padding: 20 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 10, textAlign: 'center' },
    subtitle: { fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 40 },
});

export default RoleSelectionScreen;