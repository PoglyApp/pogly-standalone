using SpacetimeDB;

public partial class Module
{
    
    [Reducer]
    public static void UpdateGuest(ReducerContext ctx, string nickname, uint selectedElementId, int positionX, int positionY)
    {
        string func = "UpdateGuest";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        try
        {
            var oldGuest = ctx.Db.Guests.Address.Find(ctx.ConnectionId.Value);

            if (oldGuest.HasValue)
            {
                var updatedGuest = oldGuest.Value;
                updatedGuest.Nickname = nickname;
                updatedGuest.SelectedElementId = selectedElementId;
                updatedGuest.PositionX = positionX;
                updatedGuest.PositionY = positionY;

                ctx.Db.Guests.Address.Update(updatedGuest);
            
                LogAudit(ctx, func,GetChangeStructFromGuest(oldGuest.Value), GetChangeStructFromGuest(updatedGuest), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Encountered an error updating [{nickname},{selectedElementId}], requested by {ctx.Sender}. Couldn't find existing Guest!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Encountered an error updating [{nickname},{selectedElementId}], requested by {ctx.Sender}. " + e.Message);
        }
    }

    [Reducer]
    public static void UpdateGuestNickname(ReducerContext ctx, string nickname)
    {
        string func = "UpdateGuestNickname";

        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        
        try
        {
            var oldGuest = ctx.Db.Guests.Address.Find(ctx.ConnectionId.Value);

            if (oldGuest.HasValue)
            {
                var updatedGuest = oldGuest.Value;
                updatedGuest.Nickname = nickname;

                ctx.Db.Guests.Address.Update(updatedGuest);
            
                LogAudit(ctx, func,GetChangeStructFromGuest(oldGuest.Value), GetChangeStructFromGuest(updatedGuest), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Encountered an error updating [{nickname}], requested by {ctx.Sender}. Couldn't find existing Guest!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Encountered an error updating [{nickname}], requested by {ctx.Sender}. " + e.Message);
        }
    }

    [Reducer]
    public static void UpdateGuestSelectedElement(ReducerContext ctx, uint selectedElementId)
    {
        string func = "UpdateGuestSelectedElement";

        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        UpdateElementZIndex(ctx, selectedElementId);
        
        try
        {
            var oldGuest = ctx.Db.Guests.Address.Find(ctx.ConnectionId.Value);

            if (oldGuest.HasValue)
            {
                var updatedGuest = oldGuest.Value;
                updatedGuest.SelectedElementId = selectedElementId;

                ctx.Db.Guests.Address.Update(updatedGuest);
            
                LogAudit(ctx, func,GetChangeStructFromGuest(oldGuest.Value), GetChangeStructFromGuest(updatedGuest), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Encountered error updating [{selectedElementId}], requested by {ctx.Sender}. Couldn't find existing Guest!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Encountered error updating [{selectedElementId}], requested by {ctx.Sender}. " + e.Message);
        }
    }
    
    [Reducer]
    public static void UpdateGuestSelectedLayout(ReducerContext ctx, uint selectedLayoutId)
    {
        string func = "UpdateGuestSelectedLayout";

        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        try
        {
            var oldGuest = ctx.Db.Guests.Address.Find(ctx.ConnectionId.Value);

            if (oldGuest.HasValue)
            {
                var updatedGuest = oldGuest.Value;
                updatedGuest.SelectedLayoutId = selectedLayoutId;

                ctx.Db.Guests.Address.Update(updatedGuest);
            
                LogAudit(ctx, func,GetChangeStructFromGuest(oldGuest.Value), GetChangeStructFromGuest(updatedGuest), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Encountered error updating [{selectedLayoutId}], requested by {ctx.Sender}. Couldn't find existing Guest!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Encountered error updating [{selectedLayoutId}], requested by {ctx.Sender}. " + e.Message);
        }
    }

    [Reducer]
    public static void UpdateGuestPosition(ReducerContext ctx, int positionX, int positionY)
    {
        string func = "UpdateGuestPosition";

        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;

        try
        {
            var oldGuest = ctx.Db.Guests.Address.Find(ctx.ConnectionId.Value);

            if (oldGuest.HasValue)
            {
                var updatedGuest = oldGuest.Value;
                updatedGuest.PositionX = positionX;
                updatedGuest.PositionY = positionY;

                ctx.Db.Guests.Address.Update(updatedGuest);

                LogAudit(ctx, func, GetChangeStructFromGuest(oldGuest.Value), GetChangeStructFromGuest(updatedGuest), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Encountered error updating position, requested by {ctx.Sender}. Couldn't find existing Guest!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Encountered error updating position, requested by {ctx.Sender}. " + e.Message);
        }
    }
    
    [Reducer]
    public static void KickGuest(ReducerContext ctx, ConnectionId address)
    {
        string func = "KickGuest";

        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (!IsGuestOwner(func, ctx)) return;

        try
        {
            var g = ctx.Db.Guests.Address.Find(address);
            if (g is not null) ctx.Db.Guests.Address.Delete(g.Value.Address);
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Encountered error kicking Guest, requested by {ctx.Sender}. " + e.Message);
        }
    }

    [Reducer]
    public static void KickSelf(ReducerContext ctx)
    {
        string func = "KickSelf";

        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;

        try
        {
            foreach (var s in ctx.Db.Guests.Iter().Where(i => i.Identity == ctx.Sender))
            {
                ctx.Db.Guests.Address.Delete(s.Address);
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Encountered error kicking Self, requested by {ctx.Sender}. " + e.Message);
        }
    }

    [Reducer]
    public static void SetIdentityPermission(ReducerContext ctx, Identity identity, PermissionLevel permissionLevel)
    {
        string func = "SetIdentityPermission";

        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (!IsGuestOwner(func, ctx)) return;

        try
        {
            var perm = ctx.Db.Permissions.Identity.Find(identity);
            if (perm is null)
            {
                ctx.Db.Permissions.Insert(new Permissions
                {
                    Identity = identity,
                    PermissionLevel = permissionLevel
                });
            } 
            else
            {
                var newPerm = perm.Value;
                newPerm.PermissionLevel = permissionLevel;
                ctx.Db.Permissions.Identity.Update(newPerm);
            }
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
        
        if (ctx.Db.Config.Version.Find(0)!.Value.ConfigInit) return;

        try
        {
            var perm = ctx.Db.Permissions.Identity.Find(identity);
            
            PermissionLevel perms = PermissionLevel.None;
            switch (permissionLevel)
            {
                case "None":
                    perms = PermissionLevel.None;
                    break;
                case "Editor":
                    perms = PermissionLevel.Editor;
                    break;
                case "Moderator":
                    perms = PermissionLevel.Moderator;
                    break;
                case "Owner":
                    perms = PermissionLevel.Owner;
                    break;
            }
            
            if (perm is null)
            {
                ctx.Db.Permissions.Insert(new Permissions
                {
                    Identity = identity,
                    PermissionLevel = perms
                });
            } 
            else
            {
                var newPerm = perm.Value;
                newPerm.PermissionLevel = perms;
                ctx.Db.Permissions.Identity.Update(newPerm);
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Encountered error importing permission, requested by {ctx.Sender}. " + e.Message);
        }
    }

    [Reducer]
    public static void SetIdentityPermissionModerator(ReducerContext ctx, Identity identity)
    {
        SetIdentityPermission(ctx, identity, PermissionLevel.Moderator);
    }

    [Reducer]
    public static void SetIdentityPermissionEditor(ReducerContext ctx, Identity identity)
    {
        SetIdentityPermission(ctx, identity, PermissionLevel.Editor);
    }
    
    [Reducer]
    public static void SetIdentityPermissionModeratorByName(ReducerContext ctx, string nickname)
    {
        var id = ctx.Db.Guests.Iter().FirstOrDefault(g => g.Nickname == nickname).Identity;
        Log.Info($"{nickname} - {id.ToString()}");
        SetIdentityPermission(ctx, id, PermissionLevel.Moderator);
    }

    [Reducer]
    public static void SetIdentityPermissionEditorByName(ReducerContext ctx, string nickname)
    {
        SetIdentityPermission(ctx, ctx.Db.Guests.Iter().FirstOrDefault(g => g.Nickname == nickname).Identity, PermissionLevel.Editor);
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
            var perm = ctx.Db.Permissions.Identity.Find(identity);
            if (perm is not null)
            {
                ctx.Db.Permissions.Identity.Delete(identity);
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Encountered error deleting permission, requested by {ctx.Sender}. " + e.Message);
        }
    }
}