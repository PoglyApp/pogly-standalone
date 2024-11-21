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
        if (ctx.CallerAddress is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
    
        //Permission level check
        if (!IsGuestOwner(func, ctx)) return;
    
        //Get existing thing (Using Config table as example)
        var oldThing = ctx.Db.Config.Version.Find(0);
    
        //Check if thing is has value
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
            //Error - thing doesnt have value
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
        Log.Info($"[GuestConnected] New guest connected {ctx.CallerIdentity} at {ctx.CallerAddress!.Value}!");
    }

    [Reducer]
    public static void Connect(ReducerContext ctx)
    {
        try
        {
            if (ctx.CallerAddress is null) throw new Exception("Guest with Null Address tried to Connect!");
            
            var random = new Random();
            var color = $"#{random.Next(0x1000000):X6}";

            var guest = ctx.Db.Guests.Insert(new Guests
            {
                Address = ctx.CallerAddress.Value,
                Identity = ctx.CallerIdentity,
                Nickname = "",
                Color = color,
                SelectedElementId = 0,
                SelectedLayoutId = GetActiveLayout(ctx),
                PositionX = -1,
                PositionY = -1,
                Authenticated = !ctx.Db.Config.Version.Find(0)!.Value.Authentication
            });
            
            Log.Info($"[Connect] New guest {ctx.CallerIdentity} inserted into Guest table!");
            LogAudit(ctx,"GuestConnected",GetEmptyStruct(),GetChangeStructFromGuest(guest), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log.Info($"[GuestConnected] Error during connection with client {ctx.CallerIdentity}! " + e.Message);
        }
    }

    [Reducer(ReducerKind.ClientDisconnected)]
    public static void GuestDisconnected(ReducerContext ctx)
    {
        try
        {
            if (ctx.CallerAddress is null) throw new Exception($"Address missing for disconnecting Guest");
            var guest = ctx.Db.Guests.Address.Find(ctx.CallerAddress.Value);
            if (guest is null)
                throw new Exception("Identity did not have Guest entry");

            ctx.Db.Guests.Address.Delete(guest.Value.Address);
            
            Log.Info($"[GuestDisconnected] Guest {ctx.CallerIdentity} at {ctx.CallerAddress.Value} has disconnected.");
            LogAudit(ctx,"GuestDisconnected",GetChangeStructFromGuest(guest.Value),GetEmptyStruct(), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log.Error($"[GuestDisconnected] Error during disconnection with client {ctx.CallerIdentity}- they may not have been deleted from guests properly! " + e.Message);
        }
    }
    
    [Reducer]
    public static void KeepAlive(ReducerContext ctx, KeepAliveWorker arg)
    {
        try
        {
            var heartbeat = ctx.Db.Heartbeat.Id.Find(0);

            if (heartbeat.HasValue)
            {
                var newHeartbeat = heartbeat.Value;
                newHeartbeat.Tick = ctx.Timestamp.Second;

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
}
