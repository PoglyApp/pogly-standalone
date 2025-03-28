// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

// @ts-ignore
import { __SPACETIMEDB__, AlgebraicType, ProductType, BuiltinType, ProductTypeElement, DatabaseTable, AlgebraicValue, ReducerArgsAdapter, SumTypeVariant, Serializer, Identity, Address, ReducerEvent, Reducer, SpacetimeDBClient } from "@clockworklabs/spacetimedb-sdk";
// @ts-ignore
import { ElementStruct } from "./element_struct";

export class AddElementToLayoutReducer extends Reducer
{
	public static reducerName: string = "AddElementToLayout";
	public static call(_element: ElementStruct, _transparency: number, _transform: string, _clip: string, _layoutId: number, _folderId: number | null) {
		this.getReducer().call(_element, _transparency, _transform, _clip, _layoutId, _folderId);
	}

	public call(_element: ElementStruct, _transparency: number, _transform: string, _clip: string, _layoutId: number, _folderId: number | null) {
		const serializer = this.client.getSerializer();
		let _elementType = ElementStruct.getAlgebraicType();
		serializer.write(_elementType, _element);
		let _transparencyType = AlgebraicType.createPrimitiveType(BuiltinType.Type.I32);
		serializer.write(_transparencyType, _transparency);
		let _transformType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		serializer.write(_transformType, _transform);
		let _clipType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		serializer.write(_clipType, _clip);
		let _layoutIdType = AlgebraicType.createPrimitiveType(BuiltinType.Type.U32);
		serializer.write(_layoutIdType, _layoutId);
		let _folderIdType = AlgebraicType.createSumType([
			new SumTypeVariant("some", AlgebraicType.createPrimitiveType(BuiltinType.Type.U32)),
			new SumTypeVariant("none", AlgebraicType.createProductType([
		])),
		]);
		serializer.write(_folderIdType, _folderId);
		this.client.call("AddElementToLayout", serializer);
	}

	public static deserializeArgs(adapter: ReducerArgsAdapter): any[] {
		let elementType = ElementStruct.getAlgebraicType();
		let elementValue = AlgebraicValue.deserialize(elementType, adapter.next())
		let element = ElementStruct.fromValue(elementValue);
		let transparencyType = AlgebraicType.createPrimitiveType(BuiltinType.Type.I32);
		let transparencyValue = AlgebraicValue.deserialize(transparencyType, adapter.next())
		let transparency = transparencyValue.asNumber();
		let transformType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let transformValue = AlgebraicValue.deserialize(transformType, adapter.next())
		let transform = transformValue.asString();
		let clipType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let clipValue = AlgebraicValue.deserialize(clipType, adapter.next())
		let clip = clipValue.asString();
		let layoutIdType = AlgebraicType.createPrimitiveType(BuiltinType.Type.U32);
		let layoutIdValue = AlgebraicValue.deserialize(layoutIdType, adapter.next())
		let layoutId = layoutIdValue.asNumber();
		let folderIdType = AlgebraicType.createSumType([
			new SumTypeVariant("some", AlgebraicType.createPrimitiveType(BuiltinType.Type.U32)),
			new SumTypeVariant("none", AlgebraicType.createProductType([
		])),
		]);
		let folderIdValue = AlgebraicValue.deserialize(folderIdType, adapter.next())
		let folderId = folderIdValue.asSumValue().tag == 1 ? null : folderIdValue.asSumValue().value.asNumber();
		return [element, transparency, transform, clip, layoutId, folderId];
	}

	public static on(callback: (reducerEvent: ReducerEvent, _element: ElementStruct, _transparency: number, _transform: string, _clip: string, _layoutId: number, _folderId: number | null) => void) {
		this.getReducer().on(callback);
	}
	public on(callback: (reducerEvent: ReducerEvent, _element: ElementStruct, _transparency: number, _transform: string, _clip: string, _layoutId: number, _folderId: number | null) => void)
	{
		this.client.on("reducer:AddElementToLayout", callback);
	}
}


export default AddElementToLayoutReducer
