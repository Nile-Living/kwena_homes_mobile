// src/components/OnboardingScreen.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';

// Define the structure of your slides
const slides = [
  {
    key: 'one',
    title: 'Welcome to Kwena Homes!',
    text: 'Find your perfect property for rent or sale easily.',
    // image: require('../assets/images/onboarding_1.png'), // Use require for local images
    // Or use a placeholder/icon for now
    icon: 'home-outline', // Example using Ionicons name
    backgroundColor: '#59b2ab', // Example background color
  },
  {
    key: 'two',
    title: 'Search & Filter',
    text: 'Effortlessly search by location and apply detailed filters.',
    // image: require('../assets/images/onboarding_2.png'),
    icon: 'search-outline',
    backgroundColor: '#febe29',
  },
  {
    key: 'three',
    title: 'Save Your Favorites',
    text: "Like properties to easily find them later in your saved list.",
    // image: require('../assets/images/onboarding_3.png'),
    icon: 'heart-outline',
    backgroundColor: '#22bcb5',
  },
   {
    key: 'four',
    title: 'List Your Property',
    text: "Ready to rent or sell? List your own property in just a few steps.",
    // image: require('../assets/images/onboarding_4.png'),
    icon: 'add-circle-outline',
    backgroundColor: '#3395ff', // Example color
  }
];

interface OnboardingScreenProps {
  onDone: () => void; // Callback function when user presses "Done"
  onSkip?: () => void; // Optional callback for "Skip"
}

export default function OnboardingScreen({ onDone, onSkip }: OnboardingScreenProps) {

  // Render function for each slide
  const renderItem = ({ item }: { item: typeof slides[0] }) => {
    return (
      <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
        {/* You can use item.icon with Ionicons or item.image with <Image> */}
        {/* Example with Text placeholder for icon */}
        <Text style={styles.iconPlaceholder}>{item.icon ? `[Icon: ${item.icon}]` : '[Image]'}</Text>
        {/* <Ionicons name={item.icon} size={100} color="white" style={{ marginBottom: 30 }} /> */}
        {/* <Image source={item.image} style={styles.image} /> */}
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.text}>{item.text}</Text>
      </View>
    );
  };

  return (
    <AppIntroSlider
      data={slides}
      renderItem={renderItem}
      onDone={onDone} // Called when the Done button is pressed
      onSkip={onSkip ?? onDone} // If skip is allowed, call onSkip or default to onDone
      showSkipButton={true} // Show the skip button
      // Customize button labels if needed
      // renderDoneButton={() => <Text>Finish</Text>}
      // renderSkipButton={() => <Text>Skip</Text>}
      // renderNextButton={() => <Text>Next</Text>}
      // Customize dot/active dot style if needed
      // dotStyle={{ backgroundColor: 'rgba(0, 0, 0, .2)' }}
      // activeDotStyle={{ backgroundColor: 'rgba(255, 255, 255, .9)' }}
    />
  );
}

// Basic styles for the slides (customize as needed)
const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30, // Add padding
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 32,
  },
  iconPlaceholder: {
      fontSize: 100,
      color: 'rgba(255, 255, 255, 0.7)',
      marginBottom: 30,
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});
