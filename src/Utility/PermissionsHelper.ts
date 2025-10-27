import { Identity } from "spacetimedb";
import { PermissionTypes } from "../Types/General/PermissionType";
import { SpacetimeContextType } from "../Types/General/SpacetimeContextType";

export function getPermissions(ctx: SpacetimeContextType, identity: Identity): PermissionTypes[] {
    const permissions: PermissionTypes[] = [];

    for (const row of ctx.Client.db.permissions.iter()) {
        if (row.identity.toHexString() === identity.toHexString()) {
            permissions.push(row.permissionType as PermissionTypes)
        }
    }

    return permissions;
}