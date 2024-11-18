// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

// @ts-ignore
import { __SPACETIMEDB__, AlgebraicType, ProductType, BuiltinType, ProductTypeElement, DatabaseTable, AlgebraicValue, ReducerArgsAdapter, SumTypeVariant, Serializer, Identity, Address, ReducerEvent, Reducer, SpacetimeDBClient } from "@clockworklabs/spacetimedb-sdk";

export class UpdateWidgetElementHeightReducer extends Reducer
{
	public static reducerName: string = "UpdateWidgetElementHeight";
	public static call(_elementId: number, _height: number) {
		this.getReducer().call(_elementId, _height);
	}

	public call(_elementId: number, _height: number) {
		const serializer = this.client.getSerializer();
		let _elementIdType = AlgebraicType.createPrimitiveType(BuiltinType.Type.U32);
		serializer.write(_elementIdType, _elementId);
		let _heightType = AlgebraicType.createPrimitiveType(BuiltinType.Type.I32);
		serializer.write(_heightType, _height);
		this.client.call("UpdateWidgetElementHeight", serializer);
	}

	public static deserializeArgs(adapter: ReducerArgsAdapter): any[] {
		let elementIdType = AlgebraicType.createPrimitiveType(BuiltinType.Type.U32);
		let elementIdValue = AlgebraicValue.deserialize(elementIdType, adapter.next())
		let elementId = elementIdValue.asNumber();
		let heightType = AlgebraicType.createPrimitiveType(BuiltinType.Type.I32);
		let heightValue = AlgebraicValue.deserialize(heightType, adapter.next())
		let height = heightValue.asNumber();
		return [elementId, height];
	}

	public static on(callback: (reducerEvent: ReducerEvent, _elementId: number, _height: number) => void) {
		this.getReducer().on(callback);
	}
	public on(callback: (reducerEvent: ReducerEvent, _elementId: number, _height: number) => void)
	{
		this.client.on("reducer:UpdateWidgetElementHeight", callback);
	}
}


export default UpdateWidgetElementHeightReducer