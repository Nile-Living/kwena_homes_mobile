import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';

export default function PropertyDetails() {
    const { id } = useLocalSearchParams();
    
    // Mock data - will be replaced with Supabase data
    const property = {
      id: '1',
      title: 'Modern Apartment',
      price: 450000,
      location: 'New Kasama',
      bedrooms: 2,
      bathrooms: 2,
      description: 'Beautiful modern apartment in the heart of New Kasama...',
      images: ['https://plus.unsplash.com/premium_photo-1680300960892-bd11b59b469b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8a2VueWElMjBob3VzZXxlbnwwfHwwfHx8MA%3D%3D'],
    };
  
    return (
      <ScrollView style={styles.container}>
        <Image 
          source={{ uri: property.images[0] }}
          style={styles.image}
        />
        <View style={styles.content}>
          <Text style={styles.title}>{property.title}</Text>
          <Text style={styles.price}>${property.price.toLocaleString()}</Text>
          <Text style={styles.location}>{property.location}</Text>
          <Text style={styles.description}>{property.description}</Text>
        </View>
      </ScrollView>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.light.background,
    },
    image: {
      width: '100%',
      height: 300,
    },
    content: {
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: Colors.light.text,
      marginBottom: 8,
    },
    price: {
      fontSize: 20,
      color: Colors.light.tint,
      marginBottom: 8,
    },
    location: {
      fontSize: 16,
      color: '#666',
      marginBottom: 16,
    },
    description: {
      fontSize: 16,
      color: Colors.light.text,
      lineHeight: 24,
    },
  });