using SpacetimeDB;
using static SpacetimeDB.Runtime;

public partial class Module
{
    
    [SpacetimeDB.Reducer]
    public static void UpdateGuest(ReducerContext ctx, string nickname, uint selectedElementId, int positionX, int positionY)
    {
        string func = "UpdateGuest";
        
        if (ctx.Address is null) return;
        if (!GetGuest(func, ctx.Address, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        try
        {
            var oldGuest = Guests.FindByAddress(ctx.Address);
            if (oldGuest is null) throw new Exception("Guest is null");
            var updatedGuest = oldGuest.Value;
            updatedGuest.Nickname = nickname;
            updatedGuest.SelectedElementId = selectedElementId;
            updatedGuest.PositionX = positionX;
            updatedGuest.PositionY = positionY;

            Guests.UpdateByAddress(ctx.Address, updatedGuest);
            
            LogAudit(ctx, func,GetChangeStructFromGuest(oldGuest.Value), GetChangeStructFromGuest(updatedGuest), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Encountered an error updating [{nickname},{selectedElementId}], requested by {ctx.Sender}. " + e.Message, LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void UpdateGuestNickname(ReducerContext ctx, string nickname)
    {
        string func = "UpdateGuestNickname";

        if (ctx.Address is null) return;
        if (!GetGuest(func, ctx.Address, out var guest)) return;
        
        try
        {
            var oldGuest = Guests.FindByAddress(ctx.Address);
            if (oldGuest is null) throw new Exception("Guest is null");
            var updatedGuest = oldGuest.Value;
            updatedGuest.Nickname = nickname;

            Guests.UpdateByAddress(ctx.Address, updatedGuest);
            
            LogAudit(ctx, func,GetChangeStructFromGuest(oldGuest.Value), GetChangeStructFromGuest(updatedGuest), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Encountered an error updating [{nickname}], requested by {ctx.Sender}. " + e.Message, LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void UpdateGuestSelectedElement(ReducerContext ctx, uint selectedElementId)
    {
        string func = "UpdateGuestSelectedElement";

        if (ctx.Address is null) return;
        if (!GetGuest(func, ctx.Address, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        UpdateElementZIndex(ctx, selectedElementId);
        
        try
        {
            var oldGuest = Guests.FindByAddress(ctx.Address);
            if (oldGuest is null) throw new Exception("Guest is null");
            var updatedGuest = oldGuest.Value;
            updatedGuest.SelectedElementId = selectedElementId;

            Guests.UpdateByAddress(ctx.Address, updatedGuest);
            
            LogAudit(ctx, func,GetChangeStructFromGuest(oldGuest.Value), GetChangeStructFromGuest(updatedGuest), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Encountered error updating [{selectedElementId}], requested by {ctx.Sender}. " + e.Message, LogLevel.Error);
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void UpdateGuestSelectedLayout(ReducerContext ctx, uint selectedLayoutId)
    {
        string func = "UpdateGuestSelectedLayout";

        if (ctx.Address is null) return;
        if (!GetGuest(func, ctx.Address, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        try
        {
            var oldGuest = Guests.FindByAddress(ctx.Address);
            if (oldGuest is null) throw new Exception("Guest is null");
            var updatedGuest = oldGuest.Value;
            updatedGuest.SelectedLayoutId = selectedLayoutId;

            Guests.UpdateByAddress(ctx.Address, updatedGuest);
            
            LogAudit(ctx, func,GetChangeStructFromGuest(oldGuest.Value), GetChangeStructFromGuest(updatedGuest), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Encountered error updating [{selectedLayoutId}], requested by {ctx.Sender}. " + e.Message, LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void UpdateGuestPosition(ReducerContext ctx, int positionX, int positionY)
    {
        string func = "UpdateGuestPosition";

        if (ctx.Address is null) return;
        if (!GetGuest(func, ctx.Address, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;

        try
        {
            var oldGuest = Guests.FindByAddress(ctx.Address);
            if (oldGuest is null) throw new Exception("Guest is null");
            var updatedGuest = oldGuest.Value;
            updatedGuest.PositionX = positionX;
            updatedGuest.PositionY = positionY;

            Guests.UpdateByAddress(ctx.Address, updatedGuest);

            LogAudit(ctx, func, GetChangeStructFromGuest(oldGuest.Value), GetChangeStructFromGuest(updatedGuest), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Encountered error updating position, requested by {ctx.Sender}. " + e.Message,
                LogLevel.Error);
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void KickGuest(ReducerContext ctx, Address address)
    {
        string func = "KickGuest";

        if (ctx.Address is null) return;
        if (!GetGuest(func, ctx.Address, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (!IsGuestOwner(func, ctx.Sender)) return;

        try
        {
            var g = Guests.FindByAddress(address);
            if (g is not null) Guests.DeleteByAddress(g.Value.Address);
        }
        catch (Exception e)
        {
            Log($"[{func}] Encountered error kicking Guest, requested by {ctx.Sender}. " + e.Message,
                LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void KickSelf(ReducerContext ctx)
    {
        string func = "KickSelf";

        if (ctx.Address is null) return;
        if (!GetGuest(func, ctx.Address, out var guest)) return;

        try
        {
            foreach (var s in Guests.FilterByIdentity(ctx.Sender))
            {
                Guests.DeleteByAddress(s.Address);
            }
            // var g = Guests.FindByAddress(guest.Address);
            // if (g is not null) Guests.DeleteByAddress(g.Value.Address);
        }
        catch (Exception e)
        {
            Log($"[{func}] Encountered error kicking Self, requested by {ctx.Sender}. " + e.Message,
                LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void SetIdentityPermission(ReducerContext ctx, Identity identity, PermissionLevel permissionLevel)
    {
        string func = "SetIdentityPermission";

        if (ctx.Address is null) return;
        if (!GetGuest(func, ctx.Address, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (!IsGuestOwner(func, ctx.Sender)) return;

        try
        {
            var perm = Permissions.FindByIdentity(identity);
            if (perm is null)
            {
                new Permissions
                {
                    Identity = identity,
                    PermissionLevel = permissionLevel
                }.Insert();
            } 
            else
            {
                var newPerm = perm.Value;
                newPerm.PermissionLevel = permissionLevel;
                Permissions.UpdateByIdentity(newPerm.Identity, newPerm);
            }
        }
        catch (Exception e)
        {
            Log($"[{func}] Encountered error updating permission, requested by {ctx.Sender}. " + e.Message,
                LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void ImportPermission(ReducerContext ctx, Identity identity, string permissionLevel)
    {
        string func = "ImportPermission";
        if (Config.FindByVersion(0)!.Value.ConfigInit) return;

        try
        {
            var perm = Permissions.FindByIdentity(identity);
            
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
                new Permissions
                {
                    Identity = identity,
                    PermissionLevel = perms
                }.Insert();
            } 
            else
            {
                var newPerm = perm.Value;
                newPerm.PermissionLevel = perms;
                Permissions.UpdateByIdentity(newPerm.Identity, newPerm);
            }
        }
        catch (Exception e)
        {
            Log($"[{func}] Encountered error importing permission, requested by {ctx.Sender}. " + e.Message,
                LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void SetIdentityPermissionModerator(ReducerContext ctx, Identity identity)
    {
        SetIdentityPermission(ctx, identity, PermissionLevel.Moderator);
    }

    [SpacetimeDB.Reducer]
    public static void SetIdentityPermissionEditor(ReducerContext ctx, Identity identity)
    {
        SetIdentityPermission(ctx, identity, PermissionLevel.Editor);
    }
    
    [SpacetimeDB.Reducer]
    public static void SetIdentityPermissionModeratorByName(ReducerContext ctx, string nickname)
    {
        var id = Guests.FilterByNickname(nickname).FirstOrDefault().Identity;
        Log($"{nickname} - {id.ToString()}");
        SetIdentityPermission(ctx, id, PermissionLevel.Moderator);
    }

    [SpacetimeDB.Reducer]
    public static void SetIdentityPermissionEditorByName(ReducerContext ctx, string nickname)
    {
        SetIdentityPermission(ctx, Guests.FilterByNickname(nickname).FirstOrDefault().Identity, PermissionLevel.Editor);
    }

    [SpacetimeDB.Reducer]
    public static void ClearIdentityPermission(ReducerContext ctx, Identity identity)
    {
        string func = "ClearIdentityPermission";

        if (ctx.Address is null) return;
        if (!GetGuest(func, ctx.Address, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (!IsGuestOwner(func, ctx.Sender)) return;

        try
        {
            var perm = Permissions.FindByIdentity(identity);
            if (perm is not null)
            {
                Permissions.DeleteByIdentity(identity);
            }
        }
        catch (Exception e)
        {
            Log($"[{func}] Encountered error deleting permission, requested by {ctx.Sender}. " + e.Message,
                LogLevel.Error);
        }
    }
}