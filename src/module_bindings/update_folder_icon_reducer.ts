// THIS FILE IS AUTOMATICALLY GENERATED BY SPACETIMEDB. EDITS TO THIS FILE
// WILL NOT BE SAVED. MODIFY TABLES IN RUST INSTEAD.

// @ts-ignore
import { __SPACETIMEDB__, AlgebraicType, ProductType, BuiltinType, ProductTypeElement, DatabaseTable, AlgebraicValue, ReducerArgsAdapter, SumTypeVariant, Serializer, Identity, Address, ReducerEvent, Reducer, SpacetimeDBClient } from "@clockworklabs/spacetimedb-sdk";

export class UpdateFolderIconReducer extends Reducer
{
	public static reducerName: string = "UpdateFolderIcon";
	public static call(_folderId: number, _icon: string) {
		this.getReducer().call(_folderId, _icon);
	}

	public call(_folderId: number, _icon: string) {
		const serializer = this.client.getSerializer();
		let _folderIdType = AlgebraicType.createPrimitiveType(BuiltinType.Type.U32);
		serializer.write(_folderIdType, _folderId);
		let _iconType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		serializer.write(_iconType, _icon);
		this.client.call("UpdateFolderIcon", serializer);
	}

	public static deserializeArgs(adapter: ReducerArgsAdapter): any[] {
		let folderIdType = AlgebraicType.createPrimitiveType(BuiltinType.Type.U32);
		let folderIdValue = AlgebraicValue.deserialize(folderIdType, adapter.next())
		let folderId = folderIdValue.asNumber();
		let iconType = AlgebraicType.createPrimitiveType(BuiltinType.Type.String);
		let iconValue = AlgebraicValue.deserialize(iconType, adapter.next())
		let icon = iconValue.asString();
		return [folderId, icon];
	}

	public static on(callback: (reducerEvent: ReducerEvent, _folderId: number, _icon: string) => void) {
		this.getReducer().on(callback);
	}
	public on(callback: (reducerEvent: ReducerEvent, _folderId: number, _icon: string) => void)
	{
		this.client.on("reducer:UpdateFolderIcon", callback);
	}
}


export default UpdateFolderIconReducer