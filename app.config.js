export default {
  expo: {
    name: "Kwena Properties",
    slug: "kwena_homes_mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "kwena_properties_mobile",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "This app uses your location to show nearby properties and provide location-based property search results."
      },
      bundleIdentifier: "com.chimwemwe_m.kwena_properties_mobile"
    },
    android: {
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ],
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.chimwemwe_m.kwena_properties_mobile",
      versionCode: 1,
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      },
      googleServicesFile: "./google-services.json",
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "kwena_properties_mobile"
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow app to use your location."
        }
      ],
      "expo-secure-store",
      [
        "expo-notifications",
        {
          icon: "./assets/images/icon.png"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: "49cb29f8-35e1-41f8-be27-f9f07e231af6"
      }
    }
  }
};