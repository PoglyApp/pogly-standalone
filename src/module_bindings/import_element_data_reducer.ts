// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN YOUR MODULE SOURCE CODE INSTEAD.

/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
import {
  AlgebraicType,
  AlgebraicValue,
  BinaryReader,
  BinaryWriter,
  CallReducerFlags,
  ConnectionId,
  DbConnectionBuilder,
  DbConnectionImpl,
  DbContext,
  ErrorContextInterface,
  Event,
  EventContextInterface,
  Identity,
  ProductType,
  ProductTypeElement,
  ReducerEventContextInterface,
  SubscriptionBuilderImpl,
  SubscriptionEventContextInterface,
  SumType,
  SumTypeVariant,
  TableCache,
  TimeDuration,
  Timestamp,
  deepEqual,
} from "@clockworklabs/spacetimedb-sdk";

import { DataType as __DataType } from "./data_type_type";

export type ImportElementData = {
  id: number,
  name: string,
  type: __DataType,
  data: string,
  width: number,
  height: number,
  createdBy: string,
};

/**
 * A namespace for generated helper functions.
 */
export namespace ImportElementData {
  /**
  * A function which returns this type represented as an AlgebraicType.
  * This function is derived from the AlgebraicType used to generate this type.
  */
  export function getTypeScriptAlgebraicType(): AlgebraicType {
    return AlgebraicType.createProductType([
      new ProductTypeElement("id", AlgebraicType.createU32Type()),
      new ProductTypeElement("name", AlgebraicType.createStringType()),
      new ProductTypeElement("type", __DataType.getTypeScriptAlgebraicType()),
      new ProductTypeElement("data", AlgebraicType.createStringType()),
      new ProductTypeElement("width", AlgebraicType.createI32Type()),
      new ProductTypeElement("height", AlgebraicType.createI32Type()),
      new ProductTypeElement("createdBy", AlgebraicType.createStringType()),
    ]);
  }

  export function serialize(writer: BinaryWriter, value: ImportElementData): void {
    ImportElementData.getTypeScriptAlgebraicType().serialize(writer, value);
  }

  export function deserialize(reader: BinaryReader): ImportElementData {
    return ImportElementData.getTypeScriptAlgebraicType().deserialize(reader);
  }

}

