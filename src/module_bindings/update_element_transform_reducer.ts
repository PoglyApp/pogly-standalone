// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

// @ts-ignore
import { __SPACETIMEDB__, AlgebraicType, ProductType, BuiltinType, ProductTypeElement, DatabaseTable, AlgebraicValue, ReducerArgsAdapter, SumTypeVariant, Serializer, Identity, Address, ReducerEvent, Reducer, SpacetimeDBClient } from "@clockworklabs/spacetimedb-sdk";

export class UpdateElementTransformReducer extends Reducer
{
	public static reducerName: string = "UpdateElementTransform";
	public static call(_elementId: number, _transform: string) {
		this.getReducer().call(_elementId, _transform);
	}

	public call(_elementId: number, _transform: string) {
		const serializer = this.client.getSerializer();
		let _elementIdType = AlgebraicType.createPrimitiveType(BuiltinType.Type.U32);
		serializer.write(_elementIdType, _elementId);
		let _transformType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		serializer.write(_transformType, _transform);
		this.client.call("UpdateElementTransform", serializer);
	}

	public static deserializeArgs(adapter: ReducerArgsAdapter): any[] {
		let elementIdType = AlgebraicType.createPrimitiveType(BuiltinType.Type.U32);
		let elementIdValue = AlgebraicValue.deserialize(elementIdType, adapter.next())
		let elementId = elementIdValue.asNumber();
		let transformType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let transformValue = AlgebraicValue.deserialize(transformType, adapter.next())
		let transform = transformValue.asString();
		return [elementId, transform];
	}

	public static on(callback: (reducerEvent: ReducerEvent, _elementId: number, _transform: string) => void) {
		this.getReducer().on(callback);
	}
	public on(callback: (reducerEvent: ReducerEvent, _elementId: number, _transform: string) => void)
	{
		this.client.on("reducer:UpdateElementTransform", callback);
	}
}


export default UpdateElementTransformReducer