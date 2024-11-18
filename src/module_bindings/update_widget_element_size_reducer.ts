// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

// @ts-ignore
import { __SPACETIMEDB__, AlgebraicType, ProductType, BuiltinType, ProductTypeElement, DatabaseTable, AlgebraicValue, ReducerArgsAdapter, SumTypeVariant, Serializer, Identity, Address, ReducerEvent, Reducer, SpacetimeDBClient } from "@clockworklabs/spacetimedb-sdk";

export class UpdateWidgetElementSizeReducer extends Reducer
{
	public static reducerName: string = "UpdateWidgetElementSize";
	public static call(_elementId: number, _width: number, _height: number) {
		this.getReducer().call(_elementId, _width, _height);
	}

	public call(_elementId: number, _width: number, _height: number) {
		const serializer = this.client.getSerializer();
		let _elementIdType = AlgebraicType.createPrimitiveType(BuiltinType.Type.U32);
		serializer.write(_elementIdType, _elementId);
		let _widthType = AlgebraicType.createPrimitiveType(BuiltinType.Type.I32);
		serializer.write(_widthType, _width);
		let _heightType = AlgebraicType.createPrimitiveType(BuiltinType.Type.I32);
		serializer.write(_heightType, _height);
		this.client.call("UpdateWidgetElementSize", serializer);
	}

	public static deserializeArgs(adapter: ReducerArgsAdapter): any[] {
		let elementIdType = AlgebraicType.createPrimitiveType(BuiltinType.Type.U32);
		let elementIdValue = AlgebraicValue.deserialize(elementIdType, adapter.next())
		let elementId = elementIdValue.asNumber();
		let widthType = AlgebraicType.createPrimitiveType(BuiltinType.Type.I32);
		let widthValue = AlgebraicValue.deserialize(widthType, adapter.next())
		let width = widthValue.asNumber();
		let heightType = AlgebraicType.createPrimitiveType(BuiltinType.Type.I32);
		let heightValue = AlgebraicValue.deserialize(heightType, adapter.next())
		let height = heightValue.asNumber();
		return [elementId, width, height];
	}

	public static on(callback: (reducerEvent: ReducerEvent, _elementId: number, _width: number, _height: number) => void) {
		this.getReducer().on(callback);
	}
	public on(callback: (reducerEvent: ReducerEvent, _elementId: number, _width: number, _height: number) => void)
	{
		this.client.on("reducer:UpdateWidgetElementSize", callback);
	}
}


export default UpdateWidgetElementSizeReducer