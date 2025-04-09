import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/hooks/useAuth';
import { Navigation } from './src/navigation';

export default function App() {
  return (
    <View style={styles.container}>
      <SafeAreaProvider>
        <PaperProvider>
          <AuthProvider>
            <Navigation />
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 