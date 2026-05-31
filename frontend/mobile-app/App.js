import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen.js';
import RegisterScreen from './screens/RegisterScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import StudentManagementScreen from './screens/StudentManagementScreen';
import FilieresScreen from './screens/FilieresScreen';
 
const Stack = createNativeStackNavigator();
 
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        <Stack.Screen name="StudentManagement" component={StudentManagementScreen} />
        <Stack.Screen name="Filieres" component={FilieresScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
 