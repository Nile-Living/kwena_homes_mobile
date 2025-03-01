import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

/**
 * Prepares an image for upload by:
 * 1. Converting it to a local file if it's an asset
 * 2. Compressing it to reduce size
 * 3. Ensuring it's in a format that can be uploaded
 */
export const prepareImageForUpload = async (uri: string): Promise<string> => {
  try {
    // Check if the image exists
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      throw new Error(`Image file does not exist: ${uri}`);
    }

    // Compress and resize the image to reduce upload size
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1200 } }], // Resize to reasonable dimensions
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

    return manipResult.uri;
  } catch (error) {
    console.error("Error preparing image:", error);
    throw error;
  }
};

/**
 * Converts a uri to an ArrayBuffer instead of Blob
 */
export const uriToArrayBuffer = async (uri: string): Promise<ArrayBuffer> => {
  try {
    // Read the file as base64
    const base64Data = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Convert base64 to ArrayBuffer
    return base64ToArrayBuffer(base64Data);
  } catch (error) {
    console.error("Error converting URI to ArrayBuffer:", error);
    throw error;
  }
};

/**
 * Convert base64 string to ArrayBuffer
 */
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * Handles image upload to Supabase with retries
 * Now uses ArrayBuffer instead of Blob for better compatibility
 */
export const uploadImageToSupabase = async (
  supabase: any,
  uri: string,
  userId: string,
  index: number,
  bucket: string = "property-images",
  maxRetries: number = 3
): Promise<string> => {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      // Prepare image by compressing and converting
      const preparedUri = await prepareImageForUpload(uri);

      // Convert URI to ArrayBuffer instead of Blob
      const arrayBuffer = await uriToArrayBuffer(preparedUri);

      // Generate file path
      const fileExt = preparedUri.split(".").pop() || "jpg";
      const fileName = `${Date.now()}-${index}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Upload to Supabase using ArrayBuffer
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, arrayBuffer, {
          cacheControl: "3600",
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (error) throw error;

      // Get the public URL
      const publicUrl = `https://jdscpwxbrlbvnfsivwmp.supabase.co/storage/v1/object/public/${bucket}/${filePath}`;
      
      // Verify URL is accessible
      await fetch(publicUrl, { method: "HEAD" });

      return publicUrl;
    } catch (error) {
      retries++;
      console.error(`Upload attempt ${retries} failed:`, error);

      if (retries >= maxRetries) {
        throw error;
      }

      // Wait before retry (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
    }
  }

  throw new Error("Failed to upload image after multiple attempts");
};