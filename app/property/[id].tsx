import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useStore } from "@/store/useStore";
import { useEffect } from "react";
import { useNavigation } from "expo-router";

export default function PropertyDetails() {
  const { id } = useLocalSearchParams();
  const { properties } = useStore();
  const navigation = useNavigation();

  const property = properties.find((prop) => prop.id === id);

  if (!property) {
    return <Text>Property not found</Text>;
  }

  useEffect(() => {
    if (property) {
      navigation.setOptions({
        title: property.title
      })
    }
  }, [property, navigation])

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: property.images[0] }} style={styles.image} />
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
    width: "100%",
    height: 300,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
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
    color: "#666",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
  },
});
