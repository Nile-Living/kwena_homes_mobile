export const PROPERTY_TYPES = {
    house: {
      label: 'House',
      amenities: ['Bedrooms', 'Bathrooms', 'Garden', 'Garage', 'Pool', 'Security']
    },
    apartment: {
      label: 'Apartment',
      amenities: ['Bedrooms', 'Bathrooms', 'Parking', 'Security', 'Elevator']
    },
    land: {
      label: 'Vacant Land',
      amenities: ['Water Connection', 'Electricity', 'Road Access', 'Fenced']
    },
    commercial: {
      label: 'Commercial',
      amenities: ['Parking', 'Security', 'Loading Bay', 'Reception']
    },
    industrial: {
      label: 'Industrial',
      amenities: ['Loading Bay', 'Security', 'Power Supply', 'Water Supply']
    },
    lodge: {
      label: 'Lodge',
      amenities: ['Bedrooms', 'Bathrooms', 'Pool', 'Security', 'Parking']
    },
    gated_estate: {
      label: 'Gated Estate',
      amenities: ['Security', 'Clubhouse', 'Roads', 'Street Lights']
    }
  } as const;
  
  export type PropertyType = keyof typeof PROPERTY_TYPES;
  