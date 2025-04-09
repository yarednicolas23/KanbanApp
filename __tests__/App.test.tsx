import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

// Mock de NavigationContainer para evitar errores en las pruebas
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock de useAuth para simular el estado de autenticación
jest.mock('../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('App', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('app-container')).toBeTruthy();
  });
}); 