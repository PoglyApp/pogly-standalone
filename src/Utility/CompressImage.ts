import imageCompression from "browser-image-compression";

export const CompressImage = async (file: any) => {
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
