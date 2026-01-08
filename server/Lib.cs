using SpacetimeDB;

static partial class Module
{
    // =============================
    // ===== REDUCER TEMPLATE ======
    // =============================
    /*
    [Reducer]
    public static void UpdateThing(ReducerContext ctx, string thing)
    {
        //Name for Logging
        string func = "UpdateThing";
    
        //Basic sanity checks
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
    
        //Permission level check
        if (!IsGuestOwner(func, ctx)) return;
    
        //Get existing thing (Using Config table as example)
        var oldThing = ctx.Db.Config.Version.Find(0);
    
        //Check if thing has a value
        if (oldThing.HasValue)
        {
            //Do stuff
            var newThing = oldThing.Value;
            newThing.EditorGuidelines = "New thing!";
            ctx.Db.Config.Version.Update(newThing);
            Log.Info($"[{func}] Thing stuff success!");
        }
        else
        {
            //Error - thing doesn't have value
            Log.Error($"[{func}] Error doing thing - old thing missing value");
        }
    }
    */
    
    [Reducer(ReducerKind.Init)]
    public static void Init(ReducerContext ctx)
    {
        try
        {
            Configure(ctx);
            Log.Info($"[Init] Server successfully started!");
            
        }
        catch (Exception e)
        {
            Log.Exception($"[Init] Sever encountered a fatal error on start! " + e.Message);
        }
    }

    [Reducer(ReducerKind.ClientConnected)]
    public static void GuestConnected(ReducerContext ctx)
    {
        Log.Info($"[GuestConnected] New guest connected {ctx.Sender} at {ctx.ConnectionId}!");
    }

    [Reducer]
    public static void Connect(ReducerContext ctx)
    {
        try
        {
            if (ctx.ConnectionId is null) throw new Exception("Guest with Null Address tried to Connect!");

            var random = new Random();
            var color = $"#{random.Next(0x1000000):X6}";

            var guest = ctx.Db.Guests.Insert(new Guests
            {
                Address = ctx.ConnectionId.Value,
                Identity = ctx.Sender,
                Nickname = "",
                Color = color,
                SelectedElementId = 0,
                SelectedLayoutId = GetActiveLayout(ctx),
                PositionX = -1,
                PositionY = -1,
                Authenticated = !ctx.Db.Config.Version.Find(0)!.Value.Authentication
            });

            // Auto-claim ownership for first OIDC user on self-hosted instances
            var config = ctx.Db.Config.Version.Find(0);
            var heartbeat = ctx.Db.Heartbeat.Id.Find(0);
            if (config.HasValue && heartbeat.HasValue)
            {
                // If OwnerIdentity matches server identity, ownership hasn't been claimed yet
                if (config.Value.OwnerIdentity == heartbeat.Value.ServerIdentity)
                {
                    // Verify user is authenticated via OIDC before granting ownership
                    try
                    {
                        VerifyClient(ctx);
                        
                        var newConfig = config.Value;
                        newConfig.OwnerIdentity = ctx.Sender;
                        ctx.Db.Config.Version.Update(newConfig);

                        SetPermission(ctx, ctx.Sender, PermissionTypes.Owner);
                        Log.Info($"[Connect] First authenticated user {ctx.Sender} auto-claimed ownership!");
                    }
                    catch (Exception e)
                    {
                        Log.Error($"[Connect] Failed to auto-claim ownership for {ctx.Sender}: {e.Message}");
                        throw new Exception($"Failed to claim ownership: {e.Message}");
                    }
                }
            }

            Log.Info($"[Connect] New guest {ctx.Sender} inserted into Guest table!");
            LogAudit(ctx,"GuestConnected",GetEmptyStruct(),GetChangeStructFromGuest(guest), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log.Info($"[GuestConnected] Error during connection with client {ctx.Sender}! " + e.Message);
        }
    }

    [Reducer(ReducerKind.ClientDisconnected)]
    public static void GuestDisconnected(ReducerContext ctx)
    {
        try
        {
            if (ctx.ConnectionId is null) throw new Exception($"Address missing for disconnecting Guest");
            var guest = ctx.Db.Guests.Address.Find(ctx.ConnectionId.Value);
            if (guest is null)
                throw new Exception("Identity did not have Guest entry");

            ctx.Db.Guests.Address.Delete(guest.Value.Address);
            
            Log.Info($"[GuestDisconnected] Guest {ctx.Sender} at {ctx.ConnectionId.Value} has disconnected.");
            LogAudit(ctx,"GuestDisconnected",GetChangeStructFromGuest(guest.Value),GetEmptyStruct(), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log.Error($"[GuestDisconnected] Error during disconnection with client {ctx.Sender}- they may not have been deleted from guests properly! " + e.Message);
        }
    }
    
    [Reducer]
    public static void KeepAlive(ReducerContext ctx, KeepAliveWorker arg)
    {
        try
        {
            var heartbeat = ctx.Db.Heartbeat.Id.Find(0);
            
            if (heartbeat is not null)
            {
                var newHeartbeat = heartbeat.Value;
                newHeartbeat.Tick = ctx.Timestamp.ToStd().Second;

                ctx.Db.Heartbeat.Id.Update(newHeartbeat);
            }
            else
            {
                Log.Error("[KeepAlive] Encountered an error updating heartbeat - could not find default heartbeat!");
            }
        }
        catch (Exception e)
        {
            Log.Error("Encountered error with heartbeat: " + e.Message);
        }
    }
    
    //dirty workaround until OverlayCommand is implemented
    [Reducer]
    public static void RefreshOverlay(ReducerContext ctx)
    {
        try
        {
            ctx.Db.Heartbeat.Insert(new Heartbeat
            {
                Id = (uint) ctx.Timestamp.ToStd().ToUnixTimeSeconds(),
                ServerIdentity = ctx.Sender,
                Tick = 1337
            });
        }
        catch (Exception e)
        {
            Log.Error("Encountered an error forcing an overlay Refresh: " + e.Message);
        }
    }
    
    [Reducer]
    public static void RefreshOverlayClearStorage(ReducerContext ctx)
    {
        try
        {
            ctx.Db.Heartbeat.Insert(new Heartbeat
            {
                Id = (uint) ctx.Timestamp.ToStd().ToUnixTimeSeconds(),
                ServerIdentity = ctx.Sender,
                Tick = 69420
            });
        }
        catch (Exception e)
        {
            Log.Error("Encountered an error forcing an overlay Refresh: " + e.Message);
        }
    }

    [Reducer]
    public static void ClearRefreshOverlayRequests(ReducerContext ctx)
    {
        try
        {
            foreach (var request in ctx.Db.Heartbeat.Iter())
            {
                if (request.Tick == 1337) ctx.Db.Heartbeat.Delete(request);
                if (request.Tick == 69420) ctx.Db.Heartbeat.Delete(request);
            }
        }
        catch (Exception e)
        {
            Log.Error("Encountered an error clearing overlay requests: " + e.Message);
        }
    }

    [Reducer]
    public static void PingHeartbeat(ReducerContext ctx)
    {
        //do nothing
    }
}
