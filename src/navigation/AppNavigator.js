import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';
import { OperatorTabs, UserTabs } from './TabNavigators'; // Sirf isko import karega
import AuthScreen from '../screens/Auth/AuthScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
    const { user } = useContext(AuthContext);

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    user.role === 'operator' ? (
                        <Stack.Screen name="OperatorHome" component={OperatorTabs} />
                    ) : (
                        <Stack.Screen name="UserHome" component={UserTabs} />
                    )
                ) : (
                    <Stack.Screen name="Auth" component={AuthScreen} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
