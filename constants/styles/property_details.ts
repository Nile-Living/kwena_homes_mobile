import { StyleSheet, Dimensions } from "react-native";
import { Colors } from "../Colors";

const { width, height } = Dimensions.get("window"); 

export const propertyDetailsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  carouselImage: {
    width: width,
    height: 300,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: Colors.light.tint,
  },
  imageCounter: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    fontWeight: "600",
  },
  location: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  featuresContainer: {
    flexDirection: "row",
    marginBottom: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  featureText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 12,
    marginTop: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: 24,
  },
  agentSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  agentInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  agentAvatar: {
    marginRight: 12,
  },
  agentDetails: {
    flex: 1,
  },
  agentName: {
    fontSize: 18,
    fontWeight: "500",
    color: Colors.light.text,
    marginBottom: 4,
  },
  agentContact: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  contactButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
  },
  callButton: {
    backgroundColor: "#244835",
  },
  whatsappButton: {
    backgroundColor: "#25D366",
  },
  contactButtonText: {
    color: "#fff",
    fontWeight: "500",
    marginLeft: 8,
  },
  // Full screen modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinchContainer: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: width,
    height: height,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  fullScreenImageCounter: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
});