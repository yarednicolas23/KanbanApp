import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './src/types/navigation';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import KanbanBoardScreen from './src/screens/KanbanBoardScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import { AuthProvider, useAuth } from './src/hooks/useAuth';
import { Platform } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen 
              name="KanbanBoard" 
              component={KanbanBoardScreen}
              options={{
                title: 'Kanban Board',
                headerShown: true,
              }}
            />
            <Stack.Screen 
              name="TaskDetail" 
              component={TaskDetailScreen}
              options={{
                title: 'Task Details',
                headerShown: true,
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{
                headerShown: false,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
} 