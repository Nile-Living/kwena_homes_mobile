import React from 'react';
import { createSharedElementStackNavigator } from 'react-navigation-shared-element';

import HomeScreen from './index';
import PropertyDetails from '../property/[id]'; // Adjust the path based on your project structure

const HomeStack = createSharedElementStackNavigator();

export default function HomeStackLayout() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="index" component={HomeScreen} />
      <HomeStack.Screen
        name="property"
        component={PropertyDetails}
        sharedElements={(route, otherRoute, showing) => {
          const { id } = route.params;
          return [`propertyImage-${id}`, `propertyTitle-${id}`];
        }}
      />
    </HomeStack.Navigator>
  );
}

