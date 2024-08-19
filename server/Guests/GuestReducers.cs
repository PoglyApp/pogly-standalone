using SpacetimeDB;
using static SpacetimeDB.Runtime;

public partial class Module
{
    
    [SpacetimeDB.Reducer]
    public static void UpdateGuest(ReducerContext ctx, string nickname, uint selectedElementId, int positionX, int positionY)
    {
        string func = "UpdateGuest";
        
        if (!GetGuest(func, ctx.Sender, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        try
        {
            var oldGuest = Guests.FilterByIdentity(ctx.Sender).First();
            var updatedGuest = oldGuest;
            updatedGuest.Nickname = nickname;
            updatedGuest.SelectedElementId = selectedElementId;
            updatedGuest.PositionX = positionX;
            updatedGuest.PositionY = positionY;

            Guests.UpdateByIdentity(ctx.Sender, updatedGuest);
            
            LogAudit(ctx, func,GetChangeStructFromGuest(oldGuest), GetChangeStructFromGuest(updatedGuest), Config.FindByVersion(0)!.Value.DebugMode);
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
        
        if (!GetGuest(func, ctx.Sender, out var guest)) return;
        
        try
        {
            var oldGuest = Guests.FilterByIdentity(ctx.Sender).First();
            var updatedGuest = oldGuest;
            updatedGuest.Nickname = nickname;

            Guests.UpdateByIdentity(ctx.Sender, updatedGuest);
            
            LogAudit(ctx, func,GetChangeStructFromGuest(oldGuest), GetChangeStructFromGuest(updatedGuest), Config.FindByVersion(0)!.Value.DebugMode);
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
        
        if (!GetGuest(func, ctx.Sender, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        UpdateElementZIndex(ctx, selectedElementId);
        
        try
        {
            var oldGuest = Guests.FilterByIdentity(ctx.Sender).First();
            var updatedGuest = oldGuest;
            updatedGuest.SelectedElementId = selectedElementId;

            Guests.UpdateByIdentity(ctx.Sender, updatedGuest);
            
            LogAudit(ctx, func,GetChangeStructFromGuest(oldGuest), GetChangeStructFromGuest(updatedGuest), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Encountered error updating [{selectedElementId}], requested by {ctx.Sender}. " + e.Message, LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void UpdateGuestPosition(ReducerContext ctx, int positionX, int positionY)
    {
        string func = "UpdateGuestPosition";
        
        if (!GetGuest(func, ctx.Sender, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;

        try
        {
            var oldGuest = Guests.FilterByIdentity(ctx.Sender).First();
            var updatedGuest = oldGuest;
            updatedGuest.PositionX = positionX;
            updatedGuest.PositionY = positionY;

            Guests.UpdateByIdentity(ctx.Sender, updatedGuest);

            LogAudit(ctx, func, GetChangeStructFromGuest(oldGuest), GetChangeStructFromGuest(updatedGuest), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Encountered error updating position, requested by {ctx.Sender}. " + e.Message,
                LogLevel.Error);
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void KickGuest(ReducerContext ctx, Identity identity)
    {
        string func = "KickGuest";
        
        if (!GetGuest(func, ctx.Sender, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (!IsGuestOwner(func, ctx.Sender)) return;

        try
        {
            var g = Guests.FindByIdentity(identity);
            if (g is not null) Guests.DeleteByIdentity(g.Value.Identity);
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

        if (!GetGuest(func, ctx.Sender, out var guest)) return;

        try
        {
            var g = Guests.FindByIdentity(guest.Identity);
            if (g is not null) Guests.DeleteByIdentity(g.Value.Identity);
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
        
        if (!GetGuest(func, ctx.Sender, out var guest)) return;
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
        
        if (!GetGuest(func, ctx.Sender, out var guest)) return;
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