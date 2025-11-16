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

                UpdateNickname(updatedGuest.Nickname, ctx);
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

                UpdateNickname(updatedGuest.Nickname, ctx);
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
        
        if (!HasPermission(ctx, ctx.Sender, PermissionTypes.KickGuest)) return;

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
}