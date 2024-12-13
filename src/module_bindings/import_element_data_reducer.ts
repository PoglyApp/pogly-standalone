// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

// @ts-ignore
import { __SPACETIMEDB__, AlgebraicType, ProductType, BuiltinType, ProductTypeElement, DatabaseTable, AlgebraicValue, ReducerArgsAdapter, SumTypeVariant, Serializer, Identity, Address, ReducerEvent, Reducer, SpacetimeDBClient } from "@clockworklabs/spacetimedb-sdk";
// @ts-ignore
import { DataType } from "./data_type";

export class ImportElementDataReducer extends Reducer
{
	public static reducerName: string = "ImportElementData";
	public static call(_id: number, _name: string, _type: DataType, _data: string, _width: number, _height: number, _createdBy: string) {
		this.getReducer().call(_id, _name, _type, _data, _width, _height, _createdBy);
	}

	public call(_id: number, _name: string, _type: DataType, _data: string, _width: number, _height: number, _createdBy: string) {
		const serializer = this.client.getSerializer();
		let _idType = AlgebraicType.createPrimitiveType(BuiltinType.Type.U32);
		serializer.write(_idType, _id);
		let _nameType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		serializer.write(_nameType, _name);
		let _typeType = DataType.getAlgebraicType();
		serializer.write(_typeType, _type);
		let _dataType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		serializer.write(_dataType, _data);
		let _widthType = AlgebraicType.createPrimitiveType(BuiltinType.Type.I32);
		serializer.write(_widthType, _width);
		let _heightType = AlgebraicType.createPrimitiveType(BuiltinType.Type.I32);
		serializer.write(_heightType, _height);
		let _createdByType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		serializer.write(_createdByType, _createdBy);
		this.client.call("ImportElementData", serializer);
	}

	public static deserializeArgs(adapter: ReducerArgsAdapter): any[] {
		let idType = AlgebraicType.createPrimitiveType(BuiltinType.Type.U32);
		let idValue = AlgebraicValue.deserialize(idType, adapter.next())
		let id = idValue.asNumber();
		let nameType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let nameValue = AlgebraicValue.deserialize(nameType, adapter.next())
		let name = nameValue.asString();
		let typeType = DataType.getAlgebraicType();
		let typeValue = AlgebraicValue.deserialize(typeType, adapter.next())
		let type = DataType.fromValue(typeValue);
		let dataType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let dataValue = AlgebraicValue.deserialize(dataType, adapter.next())
		let data = dataValue.asString();
		let widthType = AlgebraicType.createPrimitiveType(BuiltinType.Type.I32);
		let widthValue = AlgebraicValue.deserialize(widthType, adapter.next())
		let width = widthValue.asNumber();
		let heightType = AlgebraicType.createPrimitiveType(BuiltinType.Type.I32);
		let heightValue = AlgebraicValue.deserialize(heightType, adapter.next())
		let height = heightValue.asNumber();
		let createdByType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let createdByValue = AlgebraicValue.deserialize(createdByType, adapter.next())
		let createdBy = createdByValue.asString();
		return [id, name, type, data, width, height, createdBy];
	}

	public static on(callback: (reducerEvent: ReducerEvent, _id: number, _name: string, _type: DataType, _data: string, _width: number, _height: number, _createdBy: string) => void) {
		this.getReducer().on(callback);
	}
	public on(callback: (reducerEvent: ReducerEvent, _id: number, _name: string, _type: DataType, _data: string, _width: number, _height: number, _createdBy: string) => void)
	{
		this.client.on("reducer:ImportElementData", callback);
	}
}


export default ImportElementDataReducer