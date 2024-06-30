import DataType from "../../module_bindings/data_type";

export type ElementDataType = {
  Id?: number;
  Name: string;
  DataType: DataType;
  Data: string;
  DataWidth?: number;
  DataHeight?: number;
  DataFileSize?: number;
  CreatedBy: string;
};