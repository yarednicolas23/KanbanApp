declare module 'react-native-paper' {
  import { ComponentType } from 'react';
  import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

  export interface Theme {
    colors: {
      primary: string;
      accent: string;
      background: string;
      surface: string;
      text: string;
      disabled: string;
      placeholder: string;
      backdrop: string;
      notification: string;
    };
  }

  export interface ButtonProps {
    mode?: 'text' | 'outlined' | 'contained';
    onPress?: () => void;
    style?: ViewStyle;
    children: React.ReactNode;
    buttonColor?: string;
  }

  export interface TextInputProps {
    label?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    style?: ViewStyle;
    secureTextEntry?: boolean;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    multiline?: boolean;
  }

  export interface CardProps {
    style?: ViewStyle;
    onPress?: () => void;
    children: React.ReactNode;
  }

  export interface CardContentProps {
    children: React.ReactNode;
  }

  export interface FABProps {
    icon: string;
    onPress?: () => void;
    style?: ViewStyle;
  }

  export interface ModalProps {
    visible: boolean;
    onDismiss: () => void;
    contentContainerStyle?: ViewStyle;
    children: React.ReactNode;
  }

  export interface PortalProps {
    children: React.ReactNode;
  }

  export interface IconButtonProps {
    icon: string;
    onPress?: () => void;
  }

  export interface TextProps extends TextStyle {
    children: React.ReactNode;
    numberOfLines?: number;
  }

  export const Button: ComponentType<ButtonProps>;
  export const TextInput: ComponentType<TextInputProps>;
  export const Text: ComponentType<TextProps>;
  export const Card: ComponentType<CardProps>;
  export const CardContent: ComponentType<CardContentProps>;
  export const FAB: ComponentType<FABProps>;
  export const Modal: ComponentType<ModalProps>;
  export const Portal: ComponentType<PortalProps>;
  export const IconButton: ComponentType<IconButtonProps>;
  export const Provider: ComponentType<{ children: React.ReactNode }>;
}

declare module 'react-native-gesture-handler' {
  import { ComponentType } from 'react';
  import { ViewProps } from 'react-native';

  export interface GestureDetectorProps extends ViewProps {
    children: React.ReactNode;
  }

  export interface GestureHandlerRootViewProps extends ViewProps {
    children: React.ReactNode;
  }

  export interface PanGestureHandlerProps extends ViewProps {
    onGestureEvent?: (event: PanGestureHandlerGestureEvent) => void;
    children: React.ReactNode;
  }

  export interface PanGestureHandlerGestureEvent {
    nativeEvent: {
      translationX: number;
      translationY: number;
      state: number;
    };
    state: number;
    translationX: number;
    translationY: number;
  }

  export const GestureDetector: ComponentType<GestureDetectorProps>;
  export const GestureHandlerRootView: ComponentType<GestureHandlerRootViewProps>;
  export const PanGestureHandler: ComponentType<PanGestureHandlerProps>;
  export const Gesture: {
    Pan: () => any;
  };
}

declare module 'react-native-reanimated' {
  export * from 'react-native-reanimated/lib/typescript/reanimated2';
}

declare module 'react-native-safe-area-context' {
  import { ComponentType } from 'react';

  export interface SafeAreaProviderProps {
    children: React.ReactNode;
  }

  export const SafeAreaProvider: ComponentType<SafeAreaProviderProps>;
} 