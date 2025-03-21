export const PROPERTY_TYPES = {
  house: {
    label: 'House',
    hasBedBath: true,
    amenities: ['Boundary Wall', 'Garden', 'Garage', 'Pool', 'Security Gate', 'Staff Quarters']
  },
  apartment: {
    label: 'Apartment',
    hasBedBath: true,
    amenities: ['Parking', 'Elevator', '24hr Security', 'Balcony', 'Fibre Internet']
  },
  land: {
    label: 'Vacant Land',
    hasBedBath: false,
    amenities: ['Serviced Plot', 'Road Access', 'Water Connection', 'Electricity', 'Fenced', 'Zoned']
  },
  commercial: {
    label: 'Commercial',
    hasBedBath: false,
    amenities: ['Parking', 'Loading Bay', 'Fire Safety', 'Air Conditioning', 'Elevator', 'Security']
  },
  farm: {
    label: 'Farm',
    hasBedBath: false,
    amenities: ['Borehole', 'Irrigation', 'Storage Sheds', 'Livestock Facilities', 'Road Access']
  },
  industrial: {
    label: 'Industrial',
    hasBedBath: false,
    amenities: ['Three-Phase Power', 'Loading Bay', 'Warehouse Space', 'Heavy Duty Flooring']
  },
  lodge: {
    label: 'Lodge',
    hasBedBath: true,
    amenities: ['Pool', 'Restaurant', 'Conference Facilities', 'Game Viewing Deck']
  }
} as const;

export type PropertyCategory = keyof typeof PROPERTY_TYPES;