import imageCompression from "browser-image-compression";
import { DebugLogger } from "./DebugLogger";

export const CompressImage = async (file: any) => {
  DebugLogger("Compressing image");

  try {
    const options = {
      useWebWorker: true, // Use multi-threading for faster compression
    };

    const compressedFile = await imageCompression(file, options);

    return compressedFile;
  } catch (error) {
    console.log("Failed to compress file", error);
    return null;
  }
};
