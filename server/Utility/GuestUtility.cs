using SpacetimeDB;

public partial class Module
{
    
    private static bool GetGuest(string reducerContext, ReducerContext ctx, out Guests guest)
    {
        if (ctx.CallerAddress.HasValue)
        {
            var g = ctx.Db.Guests.Address.Find(ctx.CallerAddress.Value);
            
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

    private static bool GetPermission(string reducerContext, ReducerContext ctx, out Permissions permissions)
    {
        var p = ctx.Db.Permissions.Identity.Find(ctx.CallerIdentity);
        
        if (p is null)
        {
            Log.Warn($"[{reducerContext}] Unable to GetPermission: {ctx} does not have Permission entry.");
            permissions = new Permissions();
            return false;
        }

        permissions = p.Value;
        return true;
    }

    private static bool IsGuestOwner(string reducerContext, ReducerContext ctx)
    {
        var p = GetPermission(reducerContext, ctx, out var permissions);

        return p && permissions.PermissionLevel is PermissionLevel.Owner;
    }

    private static bool IsGuestModerator(string reducerContext, ReducerContext ctx)
    {
        var p = GetPermission(reducerContext, ctx, out var permissions);

        return p && permissions.PermissionLevel is PermissionLevel.Moderator or PermissionLevel.Owner;
    }
}