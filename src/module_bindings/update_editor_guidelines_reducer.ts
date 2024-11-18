// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

// @ts-ignore
import { __SPACETIMEDB__, AlgebraicType, ProductType, BuiltinType, ProductTypeElement, DatabaseTable, AlgebraicValue, ReducerArgsAdapter, SumTypeVariant, Serializer, Identity, Address, ReducerEvent, Reducer, SpacetimeDBClient } from "@clockworklabs/spacetimedb-sdk";

export class UpdateEditorGuidelinesReducer extends Reducer
{
	public static reducerName: string = "UpdateEditorGuidelines";
	public static call(_guidelines: string) {
		this.getReducer().call(_guidelines);
	}

	public call(_guidelines: string) {
		const serializer = this.client.getSerializer();
		let _guidelinesType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		serializer.write(_guidelinesType, _guidelines);
		this.client.call("UpdateEditorGuidelines", serializer);
	}

	public static deserializeArgs(adapter: ReducerArgsAdapter): any[] {
		let guidelinesType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let guidelinesValue = AlgebraicValue.deserialize(guidelinesType, adapter.next())
		let guidelines = guidelinesValue.asString();
		return [guidelines];
	}

	public static on(callback: (reducerEvent: ReducerEvent, _guidelines: string) => void) {
		this.getReducer().on(callback);
	}
	public on(callback: (reducerEvent: ReducerEvent, _guidelines: string) => void)
	{
		this.client.on("reducer:UpdateEditorGuidelines", callback);
	}
}


export default UpdateEditorGuidelinesReducer