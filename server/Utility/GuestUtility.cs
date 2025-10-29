using SpacetimeDB;

public partial class Module
{
    
    private static bool GetGuest(string reducerContext, ReducerContext ctx, out Guests guest)
    {
        if (ctx.ConnectionId.HasValue)
        {
            var g = ctx.Db.Guests.Address.Find(ctx.ConnectionId.Value);
            
            if (g is null)
            {
                Log.Warn($"[{reducerContext}] Unable to GetGuest: {ctx} does not have Guest entry.");
                guest = new Guests();
                return false;
            }

            guest = g.Value;
            return true;
        }
        else
        {
            Log.Error($"[{reducerContext}] Unable to GetGuest: Caller address is null!");
            guest = new Guests();
            return false;
        }
    }

    private static bool GuestAuthenticated(string reducerContext, Guests guest)
    {
        return guest.Authenticated;
    }

    private static bool GuestAuthenticated(string reducerContext, ReducerContext ctx)
    {
        var g = GetGuest(reducerContext, ctx, out var guest);
        
        return g && guest.Authenticated;
    }

    private static bool HasPermission(ReducerContext ctx, Identity identity, PermissionTypes type)
    {
        return ctx.Db.Permissions.UserPermissions.Filter((identity, (uint)type)).Any() == true;
    }
    
    private static bool HasAnyPermission(ReducerContext ctx, Identity identity, PermissionTypes[] types)
    {
        foreach (var type in types)
        {
            if (ctx.Db.Permissions.UserPermissions.Filter((identity, (uint)type))?.Any() == true)
                return true;
        }
        return false;
    }

    private static uint[] GetPermissionsAsUint(ReducerContext ctx, Identity identity)
    {
        return ctx.Db.Permissions.UserPermissions
            .Filter(identity)
            .Select(p => p.PermissionType)
            .ToArray();
    }
    
    private static PermissionTypes[] GetPermissionsAsType(ReducerContext ctx, Identity identity)
    {
        return ctx.Db.Permissions.UserPermissions
            .Filter(identity)
            .Select(p => (PermissionTypes)p.PermissionType)
            .ToArray();
    }

    private static void ClearPermissions(ReducerContext ctx, Identity identity)
    {
        foreach (var p in ctx.Db.Permissions.UserPermissions.Filter(identity))
        {
            ctx.Db.Permissions.Delete(p);
        }
    }

    private static void SetPermission(ReducerContext ctx, Identity identity, PermissionTypes permission)
    {
        ctx.Db.Permissions.Insert(new Permissions
        {
            Identity = identity,
            PermissionType = (uint)permission
        });
    }

    private static void SetPermissions(ReducerContext ctx, Identity identity, PermissionTypes[] types)
    {
        foreach (var p in types)
        {
            ctx.Db.Permissions.Insert(new Permissions
            {
                Identity = identity,
                PermissionType = (uint)p
            });
        }
    }
    
    private static void SetPermissions(ReducerContext ctx, Identity identity, uint[] types)
    {
        foreach (var p in types)
        {
            ctx.Db.Permissions.Insert(new Permissions
            {
                Identity = identity,
                PermissionType = p
            });
        }
    }

    private static uint[] SinglePermission(PermissionTypes type) => [(uint)type];

    private static bool IsGuestOwner(string reducerContext, ReducerContext ctx)
    {
        return HasPermission(ctx, ctx.Sender,PermissionTypes.Owner);
    }

    private static bool IsGuestModerator(string reducerContext, ReducerContext ctx)
    {
        return HasPermission(ctx, ctx.Sender, PermissionTypes.Moderator) || HasPermission(ctx, ctx.Sender, PermissionTypes.Owner);
    }
}