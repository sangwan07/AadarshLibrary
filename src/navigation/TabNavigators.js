import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack'; // Naya import
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Quiz Screens
import QuizListScreen from '../screens/Quiz/QuizListScreen';
import CreateQuizScreen from '../screens/Quiz/CreateQuizScreen';
import QuizAttemptScreen from '../screens/Quiz/QuizAttemptScreen';
import QuizResultScreen from '../screens/Quiz/QuizResultScreen';

// Baaki saare imports
import BookIssueScreen from '../screens/Operator/BookIssueScreen';
import ManageSeatsScreen from '../screens/Operator/ManageSeatsScreen';
import AttendanceScreen from '../screens/User/AttendanceScreen';
import SeatChartScreen from '../screens/Shared/SeatChartScreen';
import ProfileScreen from '../screens/Shared/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator(); // Naya Stack Navigator

// --- Naya Stack Navigator Quiz ke liye ---
// Isse hum Quiz List se baaki quiz screens par ja payenge
const QuizStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="QuizList" component={QuizListScreen} />
            <Stack.Screen name="CreateQuiz" component={CreateQuizScreen} />
            <Stack.Screen name="QuizAttempt" component={QuizAttemptScreen} />
            <Stack.Screen name="QuizResult" component={QuizResultScreen} />
        </Stack.Navigator>
    );
};

const getIconName = (routeName, focused) => {
    let iconName;
    switch (routeName) {
        case 'Seat Chart': iconName = focused ? 'view-dashboard' : 'view-dashboard-outline'; break;
        case 'Attendance': iconName = focused ? 'calendar-check' : 'calendar-check-outline'; break;
        case 'Profile': iconName = focused ? 'account-circle' : 'account-circle-outline'; break;
        case 'Issue Book': iconName = focused ? 'book-plus' : 'book-plus-outline'; break;
        case 'Manage Seats': iconName = focused ? 'chair-school' : 'chair-school'; break;
        case 'Quiz Test': iconName = focused ? 'head-question' : 'head-question-outline'; break;
        default: iconName = 'help-circle';
    }
    return iconName;
};

const screenOptions = ({ route }) => ({
    headerShown: false,
    tabBarIcon: ({ focused, color, size }) => {
        const iconName = getIconName(route.name, focused);
        return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
    },
    tabBarActiveTintColor: '#1A237E',
    tabBarInactiveTintColor: 'gray',
    tabBarStyle: { backgroundColor: '#FFFFFF', borderTopWidth: 0, elevation: 10 },
    tabBarLabelStyle: { fontSize: 12, fontWeight: '500' }
});

// Operator ke liye Sahi Tabs
export const OperatorTabs = () => (
  <Tab.Navigator screenOptions={screenOptions}>
    <Tab.Screen name="Seat Chart" component={SeatChartScreen} />
    <Tab.Screen name="Quiz Test" component={QuizStack} />
    <Tab.Screen name="Manage Seats" component={ManageSeatsScreen} />
    <Tab.Screen name="Issue Book" component={BookIssueScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// User ke liye Sahi Tabs
export const UserTabs = () => (
  <Tab.Navigator screenOptions={screenOptions}>
    <Tab.Screen name="Seat Chart" component={SeatChartScreen} />
    <Tab.Screen name="Quiz Test" component={QuizStack} />
    <Tab.Screen name="Attendance" component={AttendanceScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);
