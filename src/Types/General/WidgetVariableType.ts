export type WidgetVariableType = {
  variableName: string;
  variableType: VariableValueType;
  variableValue: string;
};

export enum VariableValueType {
  string = 1,
  boolean = 2,
  toggle = 3,
  color = 4,
  image = 5,
}
