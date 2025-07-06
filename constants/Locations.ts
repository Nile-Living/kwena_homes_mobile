export interface LocationArea {
    name: string;
    compounds: string[];
  }
  
  export const LUSAKA_LOCATIONS: LocationArea[] = [
    {
      name: "Central Lusaka",
      compounds: [
        "Lusaka City Center (CBD)",
        "Cairo Road",
        "Kamwala",
        "Northmead",
        "Longacres",
        "Ridgeway",
        "Fairview",
        "Cathedral Hill",
      ],
    },
    {
      name: "North & Northeastern Lusaka",
      compounds: [
        "Roma",
        "Kalundu",
        "Olympia",
        "Mass Media",
        "Jesmondine",
        "Munali",
        "Kaunda Square",
        "Ng'ombe",
        "Mandevu",
        "Chainda",
      ],
    },
    {
      name: "East & Southeastern Lusaka",
      compounds: [
        "Chelstone",
        "Avondale",
        "Ibex Hill",
        "PHI (Presidential Housing Initiative)",
        "Kalingalinga",
        "Chamba Valley",
        "Silverest",
        "Meanwood Ibex",
        "Meanwood Ndeke",
        "Mtendere",
        "Nyumba Yanga",
        "Chainama",
      ],
    },
    {
      name: "South & Southwestern Lusaka",
      compounds: [
        "Libala",
        "Chalala",
        "Chilenje",
        "Kabwata",
        "Woodlands",
        "Woodlands Extension",
        "Nyumbayanga",
        "Kamwala South",
        "Leopard's Hill",
        "State Lodge",
        "New Kasama",
      ],
    },
    {
      name: "West Lusaka",
      compounds: [
        "Kanyama",
        "Garden House",
        "George Compound",
        "Matero",
        "Zingalume",
        "Lilanda",
        "Emmasdale",
        "Heavy Industrial Area",
      ],
    },
    {
      name: "Industrial & Commercial Areas",
      compounds: [
        "Makeni",
        "Chinika",
        "Lusaka South",
        "Lusaka West",
      ],
    },
  ];
  
  // Flatten all compounds for easy searching and picker use
  export const ALL_COMPOUNDS = LUSAKA_LOCATIONS.reduce<string[]>(
    (acc, area) => [...acc, ...area.compounds],
    [],
  );
  
  // Helper function to get area by compound
  export const getAreaByCompound = (compound: string): string | null => {
    for (const area of LUSAKA_LOCATIONS) {
      if (area.compounds.includes(compound)) {
        return area.name;
      }
    }
    return null;
  };
  
  // Helper function for search suggestions
  export const searchCompounds = (query: string): string[] => {
    if (!query.trim()) return [];
    
    const lowercaseQuery = query.toLowerCase();
    return ALL_COMPOUNDS.filter(compound =>
      compound.toLowerCase().includes(lowercaseQuery)
    ).slice(0, 5); // Limit to 5 suggestions
  };
  