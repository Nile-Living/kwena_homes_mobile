// src/components/OnboardingScreen.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView, // Use SafeAreaView for top/bottom padding on notches
  Dimensions, // To get screen dimensions
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import Ionicons from '@expo/vector-icons/Ionicons'; // Using Ionicons for buttons

// Get screen height for image sizing
const { height } = Dimensions.get('window');

// Define a potential brand accent color (replace if you have one)
const BRAND_COLOR = '#26A69A'; // A modern teal shade

const slides = [
  {
    key: 'one',
    title: 'Welcome to Kwena Properties',
    text: 'Your journey to finding the perfect home starts here. Explore listings tailored for you.',
    image: require('../assets/images/onboarding_1.png'),
  },
  {
    key: 'two',
    title: 'Discover with Precision',
    text: 'Effortlessly search by location, price, size, and amenities. Your dream property is just a few taps away.',
    image: require('../assets/images/onboarding_2.webp'),
  },
  {
    key: 'three',
    title: 'Never Lose a Gem',
    text: 'Save your favorite properties to a personalized list. Compare and revisit them anytime, anywhere.',
    image: require('../assets/images/onboarding_3.jpg'),
  },
  {
    key: 'four',
    title: 'List & Connect',
    text: 'Ready to sell or rent? List your property easily and connect with potential buyers or tenants quickly.',
    image: require('../assets/images/onboarding_4.jpg'),
  },
];

interface OnboardingScreenProps {
  onDone: () => void;
  onSkip?: () => void;
}

export default function OnboardingScreen({
  onDone,
  onSkip,
}: OnboardingScreenProps) {
  // --- Custom Button Rendering ---

  const renderNextButton = () => {
    return (
      <View style={styles.buttonCircle}>
        <Ionicons
          name="arrow-forward-outline"
          color="rgba(255, 255, 255, .9)"
          size={24}
        />
      </View>
    );
  };

  const renderDoneButton = () => {
    return (
      <View style={styles.buttonCircle}>
        <Ionicons
          name="checkmark-outline"
          color="rgba(255, 255, 255, .9)"
          size={24}
        />
      </View>
    );
  };

  const renderSkipButton = () => {
    return (
      <View style={styles.skipButton}>
        <Text style={styles.skipButtonText}>Skip</Text>
      </View>
    );
  };

  // --- Slide Item Rendering ---

  const renderItem = ({ item }: { item: (typeof slides)[0] }) => {
    return (
      <SafeAreaView style={styles.slide}>
        <View style={styles.imageContainer}>
          <Image source={item.image} style={styles.image} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.text}>{item.text}</Text>
        </View>
      </SafeAreaView>
    );
  };

  return (
    <AppIntroSlider
      data={slides}
      renderItem={renderItem}
      onDone={onDone}
      onSkip={onSkip ?? onDone} // Default skip to done
      showSkipButton={true}
      // Custom rendering props
      renderNextButton={renderNextButton}
      renderDoneButton={renderDoneButton}
      renderSkipButton={renderSkipButton}
      // Dot styling
      dotStyle={styles.dotStyle}
      activeDotStyle={styles.activeDotStyle}
      bottomButton // Places buttons at the bottom corners, looks cleaner
    />
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Use a clean white background
    alignItems: 'center',
    justifyContent: 'flex-start', // Align content to the top
    paddingTop: 20, // Add some padding at the very top
  },
  imageContainer: {
    width: '90%', // Use percentage for responsiveness
    height: height * 0.5, // Allocate roughly 50% of screen height to image
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30, // Space between image and text
    overflow: 'hidden', // Ensures image stays within bounds if needed
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Cover ensures the area is filled, adjust if needed
    borderRadius: 20, // Soften the image corners
  },
  textContainer: {
    width: '85%', // Slightly narrower width for text block
    alignItems: 'center', // Center text block horizontally
    paddingHorizontal: 10, // Horizontal padding within the text block
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333', // Dark grey for better readability than pure black
    textAlign: 'center',
    marginBottom: 16, // Space below title
    fontFamily: 'System', // Use system font, replace if you have custom fonts
  },
  text: {
    fontSize: 16,
    color: '#666666', // Medium grey for body text
    textAlign: 'center',
    lineHeight: 24, // Improve readability with line spacing
    fontFamily: 'System',
  },
  // --- Button & Dot Styles ---
  buttonCircle: {
    width: 44, // Increased touch target size
    height: 44,
    backgroundColor: BRAND_COLOR, // Use accent color
    borderRadius: 22, // Make it a circle
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    // Position skip button differently if needed, default is usually fine
    paddingHorizontal: 15,
    paddingVertical: 10, // Ensure enough touch area
  },
  skipButtonText: {
    fontSize: 16,
    color: '#888888', // Lighter grey for skip
    fontWeight: '600',
  },
  dotStyle: {
    backgroundColor: '#D8D8D8', // Inactive dot color
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDotStyle: {
    backgroundColor: BRAND_COLOR, // Active dot color
    width: 12, // Make active dot slightly larger
    height: 8,
    borderRadius: 4,
  },
});
