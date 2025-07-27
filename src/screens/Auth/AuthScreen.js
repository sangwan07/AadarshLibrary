import React, { useState, useContext } from 'react';
import { SafeAreaView, Text, View, Alert, StyleSheet, TouchableOpacity, StatusBar, TextInput } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import CustomButton from '../../components/CustomButton';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// --- Icon wala InputField component ---
const IconInputField = ({ icon, placeholder, value, onChangeText, secureTextEntry = false, keyboardType = 'default' }) => (
    <View style={styles.inputContainer}>
        <MaterialCommunityIcons name={icon} size={22} color="#666" style={styles.inputIcon} />
        <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#aaa"
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize="none"
        />
    </View>
);

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const { login, signUp, resetPassword } = useContext(AuthContext);

  const handleAuth = async () => {
    let result;
    if (isLogin) {
      if (!email || !password) {
        Alert.alert("Error", "Kripya email aur password dono daalein.");
        return;
      }
      result = await login(email, password);
    } else {
      if (!name || !email || !password) {
        Alert.alert("Error", "Sign up ke liye Naam, Email aur Password zaroori hain.");
        return;
      }
      result = await signUp(email, password, name, phone);
    }
    if (result && !result.success) {
      Alert.alert("Authentication Failed", result.message);
    }
  };
  
  const handleForgotPassword = () => {
    if (!email) {
        Alert.alert("Email Zaroori Hai", "Password reset karne ke liye, kripya upar email wale box me apna email daalein.");
        return;
    }
    Alert.alert(
        "Password Reset",
        `Kya aap is email par password reset link bhejna chahte hain?\n\n${email}`,
        [
            { text: "Cancel", style: "cancel" },
            { 
                text: "OK", 
                onPress: async () => {
                    const result = await resetPassword(email);
                    Alert.alert(result.success ? "Success" : "Error", result.message);
                }
            }
        ]
    );
  };

  return (
    <LinearGradient
        colors={['#1A237E', '#3F51B5', '#7986CB']}
        style={styles.container}
    >
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.contentContainer}>
            <View style={styles.header}>
                <MaterialCommunityIcons name="book-open-page-variant" size={60} color="#fff" />
                <Text style={styles.title}>{isLogin ? 'Welcome Back!' : 'Create Account'}</Text>
                <Text style={styles.subtitle}>{isLogin ? 'Apne account me login karein' : 'Library se judne ke liye shuruaat karein'}</Text>
            </View>

            <View style={styles.formContainer}>
                {!isLogin && (
                    <>
                        <IconInputField icon="account-outline" placeholder="Full Name" value={name} onChangeText={setName} />
                        <IconInputField 
                            icon="phone-outline" 
                            placeholder="Phone Number (Optional)" 
                            value={phone} 
                            onChangeText={setPhone} 
                            keyboardType="phone-pad"
                        />
                    </>
                )}
                <IconInputField 
                    icon="email-outline"
                    placeholder="Email Address" 
                    value={email} 
                    onChangeText={setEmail} 
                    keyboardType="email-address" 
                />
                <IconInputField 
                    icon="lock-outline"
                    placeholder="Password" 
                    value={password} 
                    onChangeText={setPassword} 
                    secureTextEntry 
                />
                
                {isLogin && (
                    <TouchableOpacity onPress={handleForgotPassword}>
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>
                )}
                
                <CustomButton 
                    title={isLogin ? 'Login' : 'Sign Up'} 
                    onPress={handleAuth}
                    style={styles.authButton}
                    textStyle={styles.authButtonText}
                />
            </View>

            <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchButton}>
                <Text style={styles.switchText}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <Text style={{fontWeight: 'bold'}}>{isLogin ? "Sign Up" : "Login"}</Text>
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    contentContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 25 },
    header: { alignItems: 'center', marginBottom: 40 },
    title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginTop: 15 },
    subtitle: { fontSize: 16, color: '#E0E0E0', marginTop: 5 },
    formContainer: { backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: 20, borderRadius: 15, elevation: 5 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 15 },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, paddingVertical: 10, fontSize: 16, color: '#333' },
    authButton: { backgroundColor: '#1A237E', elevation: 5, marginTop: 10 },
    authButtonText: { color: '#fff' },
    forgotPasswordText: { color: '#3F51B5', textAlign: 'right', marginBottom: 20, fontWeight: '600' },
    switchButton: { marginTop: 30, alignItems: 'center' },
    switchText: { color: '#fff', fontSize: 15 },
});

export default AuthScreen;

