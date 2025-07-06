import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
}

export default function LoadingSpinner({ size = 'large' }: LoadingSpinnerProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={Colors.light.tint} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});