// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

// @ts-ignore
import { __SPACETIMEDB__, AlgebraicType, ProductType, BuiltinType, ProductTypeElement, DatabaseTable, AlgebraicValue, ReducerArgsAdapter, SumTypeVariant, Serializer, Identity, Address, ReducerEvent, Reducer, SpacetimeDBClient } from "@clockworklabs/spacetimedb-sdk";
// @ts-ignore
import { DataType } from "./data_type";

export class AddElementDataArrayReducer extends Reducer
{
	public static reducerName: string = "AddElementDataArray";
	public static call(_name: string, _type: DataType, _data: string, _array: Uint8Array, _width: number, _height: number) {
		this.getReducer().call(_name, _type, _data, _array, _width, _height);
	}

	public call(_name: string, _type: DataType, _data: string, _array: Uint8Array, _width: number, _height: number) {
		const serializer = this.client.getSerializer();
		let _nameType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		serializer.write(_nameType, _name);
		let _typeType = DataType.getAlgebraicType();
		serializer.write(_typeType, _type);
		let _dataType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		serializer.write(_dataType, _data);
		let _arrayType = AlgebraicType.createArrayType(AlgebraicType.createPrimitiveType(BuiltinType.Type.U8));
		serializer.write(_arrayType, _array);
		let _widthType = AlgebraicType.createPrimitiveType(BuiltinType.Type.I32);
		serializer.write(_widthType, _width);
		let _heightType = AlgebraicType.createPrimitiveType(BuiltinType.Type.I32);
		serializer.write(_heightType, _height);
		this.client.call("AddElementDataArray", serializer);
	}

	public static deserializeArgs(adapter: ReducerArgsAdapter): any[] {
		let nameType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let nameValue = AlgebraicValue.deserialize(nameType, adapter.next())
		let name = nameValue.asString();
		let typeType = DataType.getAlgebraicType();
		let typeValue = AlgebraicValue.deserialize(typeType, adapter.next())
		let type = DataType.fromValue(typeValue);
		let dataType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let dataValue = AlgebraicValue.deserialize(dataType, adapter.next())
		let data = dataValue.asString();
		let arrayType = AlgebraicType.createArrayType(AlgebraicType.createPrimitiveType(BuiltinType.Type.U8));
		let arrayValue = AlgebraicValue.deserialize(arrayType, adapter.next())
		let array = arrayValue.asBytes();
		let widthType = AlgebraicType.createPrimitiveType(BuiltinType.Type.I32);
		let widthValue = AlgebraicValue.deserialize(widthType, adapter.next())
		let width = widthValue.asNumber();
		let heightType = AlgebraicType.createPrimitiveType(BuiltinType.Type.I32);
		let heightValue = AlgebraicValue.deserialize(heightType, adapter.next())
		let height = heightValue.asNumber();
		return [name, type, data, array, width, height];
	}

	public static on(callback: (reducerEvent: ReducerEvent, _name: string, _type: DataType, _data: string, _array: Uint8Array, _width: number, _height: number) => void) {
		this.getReducer().on(callback);
	}
	public on(callback: (reducerEvent: ReducerEvent, _name: string, _type: DataType, _data: string, _array: Uint8Array, _width: number, _height: number) => void)
	{
		this.client.on("reducer:AddElementDataArray", callback);
	}
}


export default AddElementDataArrayReducer