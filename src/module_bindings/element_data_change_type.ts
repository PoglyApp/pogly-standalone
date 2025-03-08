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

export type ElementDataChange = {
  id: number,
  name: string,
  dataType: __DataType,
  data: string,
  createdBy: string,
};

/**
 * A namespace for generated helper functions.
 */
export namespace ElementDataChange {
  /**
  * A function which returns this type represented as an AlgebraicType.
  * This function is derived from the AlgebraicType used to generate this type.
  */
  export function getTypeScriptAlgebraicType(): AlgebraicType {
    return AlgebraicType.createProductType([
      new ProductTypeElement("id", AlgebraicType.createU32Type()),
      new ProductTypeElement("name", AlgebraicType.createStringType()),
      new ProductTypeElement("dataType", __DataType.getTypeScriptAlgebraicType()),
      new ProductTypeElement("data", AlgebraicType.createStringType()),
      new ProductTypeElement("createdBy", AlgebraicType.createStringType()),
    ]);
  }

  export function serialize(writer: BinaryWriter, value: ElementDataChange): void {
    ElementDataChange.getTypeScriptAlgebraicType().serialize(writer, value);
  }

  export function deserialize(reader: BinaryReader): ElementDataChange {
    return ElementDataChange.getTypeScriptAlgebraicType().deserialize(reader);
  }

}


