using SpacetimeDB;
using static SpacetimeDB.Runtime;

public partial class Module
{
    
    private static bool GetGuest(string reducerContext, Address ctx, out Guests guest)
    {
        var g = Guests.FindByAddress(ctx);
        if (g is null)
        {
            Log($"[{reducerContext}] Unable to GetGuest: {ctx} does not have Guest entry.",LogLevel.Warn);
            guest = new Guests();
            return false;
        }

        guest = g.Value;
        return true;
    }

    private static bool GuestAuthenticated(string reducerContext, Guests guest)
    {
        return guest.Authenticated;
    }

    private static bool GuestAuthenticated(string reducerContext, Address ctx)
    {
        var g = GetGuest(reducerContext, ctx, out var guest);
        
        return g && guest.Authenticated;
    }

    private static bool GetPermission(string reducerContext, Identity ctx, out Permissions permissions)
    {
        var p = Permissions.FindByIdentity(ctx);
        if (p is null)
        {
            Log($"[{reducerContext}] Unable to GetPermission: {ctx} does not have Permission entry.",LogLevel.Warn);
            permissions = new Permissions();
            return false;
        }

        permissions = p.Value;
        return true;
    }

    private static bool IsGuestOwner(string reducerContext, Identity ctx)
    {
        var p = GetPermission(reducerContext, ctx, out var permissions);

        return p && permissions.PermissionLevel is PermissionLevel.Owner;
    }

    private static bool IsGuestModerator(string reducerContext, Identity ctx)
    {
        var p = GetPermission(reducerContext, ctx, out var permissions);

        return p && permissions.PermissionLevel is PermissionLevel.Moderator or PermissionLevel.Owner;
    }
}