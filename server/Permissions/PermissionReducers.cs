using SpacetimeDB;

public partial class Module
{
    [Reducer]
    public static void SetIdentityPermission(ReducerContext ctx, Identity identity, uint[] permissionTypes)
    {
        string func = "SetIdentityPermission";

        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (!IsGuestOwner(func, ctx)) return;

        try
        {
            var permissions = GetPermissionsAsType(ctx, identity);
            if (permissions.Any()) ClearPermissions(ctx, identity);
            SetPermissions(ctx, identity, permissionTypes);
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Encountered error updating permission, requested by {ctx.Sender}. " + e.Message);
        }
    }

    [Reducer]
    public static void ImportPermission(ReducerContext ctx, Identity identity, string permissionLevel)
    {
        string func = "ImportPermission";

        if (!IsGuestOwner(func, ctx))
        {
            if (ctx.Db.Config.Version.Find(0)!.Value.ConfigInit) return;
        }

        try
        {
            var permissions = GetPermissionsAsType(ctx, identity);
            PermissionTypes perms = PermissionTypes.None;
            
            switch (permissionLevel)
            {
                case "None":
                    perms = PermissionTypes.None;
                    break;
                case "Editor":
                    perms = PermissionTypes.Editor;
                    break;
                case "Moderator":
                    perms = PermissionTypes.Moderator;
                    break;
                case "Owner":
                    perms = PermissionTypes.Owner;
                    break;
            }
            
            if (permissions.Any()) ClearPermissions(ctx, identity);
            SetPermission(ctx, identity, perms);
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Encountered error importing permission, requested by {ctx.Sender}. " + e.Message);
        }
    }

    [Reducer]
    public static void SetIdentityPermissionModerator(ReducerContext ctx, Identity identity)
    {
        SetIdentityPermission(ctx, identity, SinglePermission(PermissionTypes.Moderator));
    }

    [Reducer]
    public static void SetIdentityPermissionEditor(ReducerContext ctx, Identity identity)
    {
        SetIdentityPermission(ctx, identity, SinglePermission(PermissionTypes.Editor));
    }
    
    [Reducer]
    public static void SetIdentityPermissionModeratorByName(ReducerContext ctx, string nickname)
    {
        SetIdentityPermission(ctx, ctx.Db.Guests.Iter().FirstOrDefault(g => g.Nickname == nickname).Identity, SinglePermission(PermissionTypes.Moderator));
    }

    [Reducer]
    public static void SetIdentityPermissionEditorByName(ReducerContext ctx, string nickname)
    {
        SetIdentityPermission(ctx, ctx.Db.Guests.Iter().FirstOrDefault(g => g.Nickname == nickname).Identity, SinglePermission(PermissionTypes.Editor));
    }

    [Reducer]
    public static void ClearIdentityPermission(ReducerContext ctx, Identity identity)
    {
        string func = "ClearIdentityPermission";

        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (!IsGuestOwner(func, ctx)) return;

        try
        {
            var permissions = GetPermissionsAsType(ctx, identity);
            if (permissions.Any()) ClearPermissions(ctx, identity);
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Encountered error deleting permission, requested by {ctx.Sender}. " + e.Message);
        }
    }

    [Reducer]
    public static void WhitelistUser(ReducerContext ctx, StreamingPlatform platform, string username)
    {
        string func = "WhitelistUser";

        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (!IsGuestOwner(func, ctx)) return;

        try
        {
            ctx.Db.Whitelist.Insert(new Whitelist
            {
                Platform = platform,
                Username = username.ToLower()
            });
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Encountered an error adding user to guest!" + e.Message);
        }
    }

    [Reducer]
    public static void DeleteWhitelistUser(ReducerContext ctx, string username)
    {
        string func = "DeleteWhitelistUser";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (!IsGuestOwner(func, ctx)) return;

        try
        {
            ctx.Db.Whitelist.Username.Delete(username.ToLower());
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Encountered an error deleting whitelisted user!" + e.Message);
        }
    }
    
    [Reducer]
    public static void DeleteWhitelistUserPlatform(ReducerContext ctx, StreamingPlatform platform, string username)
    {
        string func = "DeleteWhitelistUserPlatform";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (!IsGuestOwner(func, ctx)) return;

        try
        {
            foreach (var user in ctx.Db.Whitelist.Username.Filter(username.ToLower()))
            {
                if(user.Platform == platform) ctx.Db.Whitelist.Delete(user);
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Encountered an error deleting whitelisted user with platform!" + e.Message);
        }
    }
}