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
        
        if (!HasPermission(ctx, ctx.Sender, PermissionTypes.ModifyPermissions)) return;

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
    public static void AddPermissionSet(ReducerContext ctx, string name, uint[] permissions)
    {
        string func = "AddPermissionSet";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;

        if (!HasPermission(ctx, ctx.Sender, PermissionTypes.ModifyPermissions)) return;

        try
        {
            ctx.Db.PermissionSets.Insert(new PermissionSets
            {
                Name = name,
                Permissions = permissions
            });
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Encountered error adding permission set, requested by {ctx.Sender}. " + e.Message);
        }
    }
    
    [Reducer]
    public static void UpdatePermissionSet(ReducerContext ctx, uint id, uint[] permissions)
    {
        string func = "UpdatePermissionSet";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;

        if (!HasPermission(ctx, ctx.Sender, PermissionTypes.ModifyPermissions)) return;

        try
        {
            var existingSet = ctx.Db.PermissionSets.Id.Find(id);
            if (existingSet is null)
            {
                Log.Error($"[{func}] Tried to update permission set that doesn't exist, requested by {ctx.Sender}.");
                return;
            }

            var updatedSet = existingSet.Value;
            updatedSet.Permissions = permissions;
            ctx.Db.PermissionSets.Id.Update(updatedSet);
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Encountered error updating permission set, requested by {ctx.Sender}. " + e.Message);
        }
    }
    
    [Reducer]
    public static void DeletePermissionSet(ReducerContext ctx, uint id)
    {
        string func = "UpdatePermissionSet";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;

        if (!HasPermission(ctx, ctx.Sender, PermissionTypes.ModifyPermissions)) return;

        try
        {
            var existingSet = ctx.Db.PermissionSets.Id.Find(id);
            if (existingSet is null || existingSet.Value.Id == 0)
            {
                Log.Error($"[{func}] Tried to delete permission set that doesn't exist, or tried to delete the default set, requested by {ctx.Sender}.");
                return;
            }

            ctx.Db.PermissionSets.Id.Delete(id);
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Encountered error updating permission set, requested by {ctx.Sender}. " + e.Message);
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
        
        if (!HasPermission(ctx, ctx.Sender, PermissionTypes.ModifyPermissions)) return;

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
        
        if (!HasPermission(ctx, ctx.Sender, PermissionTypes.ModifyWhitelist)) return;

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
        
        if (!HasPermission(ctx, ctx.Sender, PermissionTypes.ModifyWhitelist)) return;

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
        
        if (!HasPermission(ctx, ctx.Sender, PermissionTypes.ModifyWhitelist)) return;

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