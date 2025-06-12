import {
  StyleSheet,
  Dimensions,
  StatusBar,
  useColorScheme as useRNColorScheme,
} from "react-native";

export const LIGHT_COLORS = {
  primary: "#244835",
  primaryLight: "#366D51",
  primaryLighter: "#4C916B",
  primaryLightest: "#62B585",
  primaryDark: "#1A352A",
  primaryDarkest: "#0F1E19",
  secondary: "#8AA3F9",
  secondaryLight: "#A1B5FA",
  secondaryLighter: "#B8C7FB",
  secondaryLightest: "#CED9FC",
  secondaryDark: "#6382D7",
  secondaryDarkest: "#4361B5",
  accent: "#F9B16E",
  accentLight: "#FBC38A",
  accentLighter: "#FCD5A6",
  accentLightest: "#FDE7C2",
  accentDark: "#D7904F",
  accentDarkest: "#B56F30",
  background: "#F7F9FC",
  white: "#FFFFFF",
  text: "#1A2138",
  textSecondary: "#5B6987",
  lightGray: "#E8ECF4",
  mediumGray: "#A9B4CC",
  darkGray: "#667085",
  green: "#27AE60",
  greenLight: "#45C178",
  greenLighter: "#63D490",
  greenLightest: "#81E7A8",
  greenDark: "#1E8C4A",
  greenDarkest: "#156A37",
  red: "#FF5252",
  redLight: "#FF6B6B",
  redLighter: "#FF8484",
  redLightest: "#FF9D9D",
  redDark: "#D43F3F",
  redDarkest: "#B22B2B",
  yellow: "#FFBB0E",
  yellowLight: "#FFC93A",
  yellowLighter: "#FFD666",
  yellowLightest: "#FFE392",
  yellowDark: "#D69A0C",
  yellowDarkest: "#B47B0A",
  shadow: "rgba(42, 99, 226, 0.08)",
  backdrop: "rgba(26, 33, 56, 0.7)",
  statusColor: {
    available: "#27AE60",
    occupied: "#FFBB0E",
    rented: "#2A63E2",
    "off-market": "#FF5252",
    "under-maintenance": "#A9B4CC",
    "pending-approval": "#8AA3F9",
    premium: "#FFBB0E",
  },
  cardBackground: "#FFFFFF",
  borderColor: "#E8ECF4",
};

export const DARK_COLORS: typeof LIGHT_COLORS = {
  primary: LIGHT_COLORS.primaryLightest, // #62B585
  primaryLight: LIGHT_COLORS.primaryLighter, // #4C916B
  primaryLighter: LIGHT_COLORS.primaryLight, // #366D51
  primaryLightest: LIGHT_COLORS.primary, // #244835 (original primary)
  primaryDark: LIGHT_COLORS.primaryDarkest, // #0F1E19
  primaryDarkest: "#0A1410", // Even darker
  secondary: LIGHT_COLORS.secondaryLightest, // #CED9FC
  secondaryLight: LIGHT_COLORS.secondaryLighter, // #B8C7FB
  secondaryLighter: LIGHT_COLORS.secondaryLight, // #A1B5FA
  secondaryLightest: LIGHT_COLORS.secondary, // #8AA3F9 (original secondary)
  secondaryDark: LIGHT_COLORS.secondaryDarkest, // #4361B5
  secondaryDarkest: "#2E4A9D",
  accent: LIGHT_COLORS.accentLightest, // #FDE7C2
  accentLight: LIGHT_COLORS.accentLighter, // #FCD5A6
  accentLighter: LIGHT_COLORS.accentLight, // #FBC38A
  accentLightest: LIGHT_COLORS.accent, // #F9B16E (original accent)
  accentDark: LIGHT_COLORS.accentDarkest, // #B56F30
  accentDarkest: "#935B26",
  background: "#121212",
  white: "#FFFFFF",
  text: "#E0E0E0",
  textSecondary: "#A0A0A0",
  lightGray: "#1F2937",
  mediumGray: "#555555",
  darkGray: "#888888",
  green: LIGHT_COLORS.greenLightest, // #81E7A8
  greenLight: LIGHT_COLORS.greenLighter, // #63D490
  greenLighter: LIGHT_COLORS.greenLight, // #45C178
  greenLightest: LIGHT_COLORS.green, // #27AE60
  greenDark: LIGHT_COLORS.greenDarkest, // #156A37
  greenDarkest: "#0E4B25",
  red: LIGHT_COLORS.redLightest, // #FF9D9D
  redLight: LIGHT_COLORS.redLighter, // #FF8484
  redLighter: LIGHT_COLORS.redLight, // #FF6B6B
  redLightest: LIGHT_COLORS.red, // #FF5252
  redDark: LIGHT_COLORS.redDarkest, // #B22B2B
  redDarkest: "#8F2222",
  yellow: LIGHT_COLORS.yellowLightest, // #FFE392
  yellowLight: LIGHT_COLORS.yellowLighter, // #FFD666
  yellowLighter: LIGHT_COLORS.yellowLight, // #FFC93A
  yellowLightest: LIGHT_COLORS.yellow, // #FFBB0E
  yellowDark: LIGHT_COLORS.yellowDarkest, // #B47B0A
  yellowDarkest: "#926308",
  shadow: "rgba(0, 0, 0, 0.4)",
  backdrop: "rgba(0, 0, 0, 0.85)",
  statusColor: {
    available: LIGHT_COLORS.greenLighter, // #63D490
    occupied: LIGHT_COLORS.yellowLighter, // #FFD666
    rented: LIGHT_COLORS.secondaryLight, // #A1B5FA
    "off-market": LIGHT_COLORS.redLighter, // #FF8484
    "under-maintenance": "#888888", // darkGray
    "pending-approval": LIGHT_COLORS.secondaryLighter, // #B8C7FB
    premium: LIGHT_COLORS.yellowLighter, // #FFD666
  },
  cardBackground: "#1E1E1E",
  borderColor: "#3A3A3A",
};

export const useAppColors = (): typeof LIGHT_COLORS => {
  const scheme = useRNColorScheme();
  return scheme === "dark" ? DARK_COLORS : LIGHT_COLORS;
};

const { width, height } = Dimensions.get("window");

export const createStyles = (COLORS: typeof LIGHT_COLORS) =>
  StyleSheet.create({
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: COLORS.background,
    },
    loadingText: {
      marginTop: 15,
      fontSize: 16,
      color: COLORS.textSecondary,
    },
    errorText: {
      marginTop: 15,
      fontSize: 16,
      color: COLORS.red,
      textAlign: "center",
      marginBottom: 20,
    },
    retryButton: {
      backgroundColor: COLORS.primary,
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 8,
    },
    retryButtonText: {
      color: COLORS.white,
      fontSize: 16,
      fontWeight: "600",
    },
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    animatedHeader: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 90,
      paddingTop: 40,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      zIndex: 100,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: "600",
      color: COLORS.text,
      marginHorizontal: 10,
      textAlign: "center",
    },
    headerActions: {
      flexDirection: "row",
    },
    carouselContainer: {
      position: "relative",
      height: height * 0.45,
      width: width,
    },
    carouselImage: {
      width: width,
      height: height * 0.45,
    },
    imageGradient: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    floatingButton: {
      position: "absolute",
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    backButton: {
      top: (StatusBar.currentHeight || 40) + 10,
      left: 16,
      zIndex: 10,
    },
    actionButtons: {
      position: "absolute",
      top: (StatusBar.currentHeight || 40) + 10,
      right: 16,
      flexDirection: "row",
      zIndex: 10,
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 8,
    },
    statusTag: {
      position: "absolute",
      top: (StatusBar.currentHeight || 40) + 60,
      left: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    statusText: {
      color: COLORS.white,
      fontSize: 12,
      fontWeight: "600",
    },
    listedDateTag: {
      position: "absolute",
      top: (StatusBar.currentHeight || 40) + 60,
      right: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      flexDirection: "row",
      alignItems: "center",
    },
    listedDateText: {
      color: COLORS.white,
      fontSize: 12,
      marginLeft: 4,
    },
    imageCounter: {
      position: "absolute",
      bottom: 40,
      right: 16,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 15,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
    imageCounterText: {
      color: COLORS.white,
      fontSize: 12,
      fontWeight: "500",
    },
    pagination: {
      position: "absolute",
      bottom: 16,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    paginationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: COLORS.white,
      marginHorizontal: 4,
      opacity: 0.6,
    },
    paginationDotActive: {
      opacity: 1,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: COLORS.primary,
    },
    contentWrapper: {
      backgroundColor: COLORS.cardBackground,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      marginTop: -24,
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 100,
    },
    propertyHeader: {
      marginBottom: 24,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    price: {
      fontSize: 28,
      fontWeight: "bold",
      color: COLORS.primary,
    },
    propertyTypeTag: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: COLORS.accent,
    },
    propertyTypeText: {
      fontSize: 12,
      fontWeight: "600",
      color: COLORS.white,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: COLORS.text,
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 16,
      color: COLORS.textSecondary,
      marginBottom: 16,
    },
    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    location: {
      flex: 1,
      fontSize: 14,
      color: COLORS.textSecondary,
      marginLeft: 8,
    },
    mapButton: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: COLORS.lightGray,
    },
    mapButtonText: {
      fontSize: 12,
      fontWeight: "600",
      color: COLORS.primary,
    },
    viewCountRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    viewCountText: {
      fontSize: 12,
      color: COLORS.darkGray,
      marginLeft: 6,
    },
    tabContainer: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: COLORS.borderColor,
      marginBottom: 20,
    },
    tab: {
      flex: 1,
      paddingVertical: 14,
      alignItems: "center",
      borderBottomWidth: 3,
      borderBottomColor: "transparent",
    },
    activeTab: {
      borderBottomColor: COLORS.primary,
    },
    tabText: {
      fontSize: 16,
      fontWeight: "600",
      color: COLORS.textSecondary,
    },
    activeTabText: {
      color: COLORS.primary,
    },
    descriptionContainer: {
      marginBottom: 24,
    },
    description: {
      fontSize: 15,
      lineHeight: 24,
      color: COLORS.textSecondary,
    },
    featuresSection: {
      marginBottom: 24,
    },
    featuresGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      width: "48%",
      marginBottom: 18,
      paddingVertical: 8,
    },
    featureText: {
      fontSize: 14,
      color: COLORS.textSecondary,
      marginLeft: 10,
      flexShrink: 1,
    },
    showMoreButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      backgroundColor: COLORS.lightGray,
      borderRadius: 12,
      marginTop: 8,
    },
    showMoreText: {
      fontSize: 14,
      fontWeight: "600",
      color: COLORS.primary,
      marginRight: 6,
    },
    detailsContainer: {
      marginBottom: 24,
    },
    featureCategory: {
      marginBottom: 24,
    },
    categoryTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: COLORS.text,
      marginBottom: 16,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.borderColor,
    },
    categoryFeaturesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    detailFeatureItem: {
      flexDirection: "row",
      alignItems: "center",
      width: "48%",
      marginBottom: 16,
    },
    nearbyContainer: {
      marginBottom: 24,
    },
    nearbyPlaceItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      padding: 12,
      backgroundColor: COLORS.background, // Or COLORS.cardBackground if preferred
      borderRadius: 12,
    },
    nearbyIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: `${COLORS.primary}20`,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    nearbyPlaceInfo: {
      flex: 1,
    },
    nearbyPlaceName: {
      fontSize: 15,
      fontWeight: "600",
      color: COLORS.text,
    },
    nearbyPlaceDistance: {
      fontSize: 13,
      color: COLORS.textSecondary,
      marginTop: 4,
    },
    viewMapButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.primary,
      paddingVertical: 14,
      borderRadius: 12,
      marginTop: 12,
    },
    viewMapButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: COLORS.white,
      marginLeft: 10,
    },
    agentCard: {
      padding: 16,
      backgroundColor: COLORS.cardBackground,
      borderRadius: 12,
      marginBottom: 24,
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: COLORS.borderColor,
    },
    agentHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    viewProfileButton: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
    },
    viewProfileText: {
      fontSize: 13,
      fontWeight: "600",
      color: COLORS.primary,
    },
    agentInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
    agentPhoto: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: 16,
      backgroundColor: COLORS.lightGray,
    },
    agentPhotoIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: 16,
      backgroundColor: COLORS.lightGray,
      justifyContent: "center",
      alignItems: "center",
    },
    agentDetails: {
      flex: 1,
    },
    agentName: {
      fontSize: 18,
      fontWeight: "bold",
      color: COLORS.text,
      marginBottom: 4,
    },
    phoneContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
    },
    agentPhoneText: {
      fontSize: 14,
      color: COLORS.primary,
      marginLeft: 6,
    },
    agentPhoneNotAvailableText: {
      fontSize: 14,
      color: COLORS.mediumGray,
      fontStyle: "italic",
      marginTop: 4,
    },
    agentSpecialty: {
      fontSize: 13,
      color: COLORS.darkGray,
      fontStyle: "italic",
    },
    contactBar: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: COLORS.cardBackground,
      flexDirection: "row",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderTopWidth: 1,
      borderTopColor: COLORS.borderColor,
      alignItems: "center",
    },
    contactButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      borderRadius: 12,
      flex: 1,
      marginHorizontal: 4,
      borderWidth: 1.5,
      borderColor: COLORS.primary,
    },
    contactButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: COLORS.primary,
      marginLeft: 8,
    },
    callButton: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    callButtonText: {
      color: COLORS.white,
      marginLeft: 8,
    },
    whatsappButton: {
      backgroundColor: "#25D366",
      borderColor: "#25D366",
      width: 52,
      height: 52,
      borderRadius: 12,
      flex: 0,
      paddingVertical: 0,
      paddingHorizontal: 0,
      alignItems: "center",
      justifyContent: "center",
    },
    disabledButton: {
      backgroundColor: COLORS.mediumGray,
      borderColor: COLORS.mediumGray,
      opacity: 0.7,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.9)",
      justifyContent: "center",
      alignItems: "center",
    },
    closeButton: {
      position: "absolute",
      top: (StatusBar.currentHeight || 40) + 10,
      right: 16,
      zIndex: 10,
    },
    pinchContainer: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    fullScreenImage: {
      width: "100%",
      height: "100%",
      resizeMode: "contain",
    },
    fullScreenImageCounter: {
      position: "absolute",
      bottom: 40,
      alignSelf: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
    overviewContainer: {
      padding: 16,
    },
    keyFeaturesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      justifyContent: "space-between",
    },
    keyFeatureCard: {
      flex: 1,
      minWidth: "30%",
      backgroundColor: COLORS.cardBackground,
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: COLORS.borderColor,
      shadowColor: COLORS.shadow,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    featureIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: `${COLORS.primary}20`, // Slightly more visible alpha
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
    },
    keyFeatureValue: {
      fontSize: 12,
      fontWeight: "500",
      color: COLORS.textSecondary,
      textAlign: "center",
      lineHeight: 16,
    },
    noFeaturesContainer: {
      alignItems: "center",
      padding: 32,
      backgroundColor: COLORS.lightGray,
      borderRadius: 12,
    },
    noFeaturesText: {
      fontSize: 14,
      color: COLORS.mediumGray,
      textAlign: "center",
      marginTop: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: COLORS.text, // Changed from darkGray to text for better contrast
    },
  });