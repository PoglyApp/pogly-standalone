import { DebugLogger } from "./DebugLogger";

export const GetFontFamily = async (fontURL: string) => {
  DebugLogger("Getting font family");

  try {
    const request = await fetch(fontURL, {
      method: "GET",
    });

    const requestText = await request.text();
    const fontFamily = requestText.match(/font-family:\s*['"]?([^'";]+)['"]?/);

    if (fontFamily && fontFamily[1]) {
      return fontFamily[1];
    } else {
      return null;
    }
  } catch (error) {
    console.log("Failed to get font family:", error);
    return null;
  }
};
