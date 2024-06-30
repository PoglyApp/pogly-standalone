interface TransformValue {
  transformFunction: string;
  transformValue: string;
}

export const getTransformValues = (transform: string) => {
  const regex =
    /(?<transformFunction>\w+)\((?<transformValue>[^)]+)\)|matrix3d\((?<matrix3dValue>[^)]+)\)/g;
  const values: TransformValue[] = [];

  for (const match of transform.matchAll(regex)) {
    const { transformFunction, transformValue, matrix3dValue } =
      match.groups as {
        transformFunction?: string;
        transformValue?: string;
        matrix3dValue?: string;
      };
    values.push({
      transformFunction: transformFunction || "matrix3d",
      transformValue: transformValue || matrix3dValue || "",
    });
  }

  return values;
};
