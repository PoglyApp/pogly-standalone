export const parseCustomCss = (customCss: string) => {
  return customCss.split(";").reduce((acc: any, cssRule: any) => {
    const [property, value] = cssRule.split(":");
    if (property && value) {
      const camelCasedProperty = property.trim().replace(/-([a-z])/g, (g: any) => g[1].toUpperCase());
      acc[camelCasedProperty] = value.trim();
    }
    return acc;
  }, {});
};
