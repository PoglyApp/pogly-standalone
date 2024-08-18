export const ApplyCustomFont = async (fontJson: any, component: any) => {
  try {
    const doesFontAlreadyExist = document.documentElement.innerHTML.includes(fontJson.fontUrl);

    if (!doesFontAlreadyExist) {
      const style = document.createElement("style");

      style.innerHTML = `
            @import url('${fontJson.fontUrl}');
          `;

      document.head.appendChild(style);
    }

    component.style.fontFamily = fontJson.fontFamily;
  } catch (error) {
    console.log("Failed to add font to document:", error);
  }
};
