using SpacetimeDB;
using static SpacetimeDB.Runtime;

static partial class Module
{
    [SpacetimeDB.Reducer(ReducerKind.Init)]
    public static void Init(ReducerContext ctx)
    {
        Configure(ctx);
        
        try
        {
            if (Config.FindByVersion(0)!.Value.Authentication) StartAuthWorker();
            
            Log($"[Init] Server successfully started!",LogLevel.Info);
        }
        catch (Exception e)
        {
            Log($"[Init] Sever encountered a fatal error on start! " + e.Message,LogLevel.Panic);
        }
    }

    [SpacetimeDB.Reducer(ReducerKind.Connect)]
    public static void OnConnect(ReducerContext ctx)
    {
        if (Config.FindByVersion(0)!.Value.Authentication && !IsAuthWorking()) StartAuthWorker(); 
        
        try
        {
            var random = new Random();
            var color = $"#{random.Next(0x1000000):X6}";

            var guest = new Guests
            {
                Identity = ctx.Sender,
                Nickname = "",
                Color = color,
                SelectedElementId = 0,
                PositionX = -1,
                PositionY = -1,
                Authenticated = !Config.FindByVersion(0)!.Value.Authentication
            };
            guest.Insert();
            
            Log($"[OnConnect] New guest connected {ctx.Sender} at {ctx.Address}!", LogLevel.Info);
            LogAudit(ctx,"OnConnect",GetEmptyStruct(),GetChangeStructFromGuest(guest), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[OnConnect] Error during connection with client {ctx.Sender}! " + e.Message,LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer(ReducerKind.Disconnect)]
    public static void OnDisconnect(ReducerContext ctx)
    {
        try
        {
            var guest = Guests.FindByIdentity(ctx.Sender);
            if (guest is null)
                throw new Exception("Identity did not have Guest entry");
            
            Guests.DeleteByIdentity(guest.Value.Identity);
            
            Log($"[OnDisconnect] Guest {ctx.Sender} at {ctx.Address} has disconnected.", LogLevel.Info);
            LogAudit(ctx,"OnDisconnect",GetChangeStructFromGuest(guest.Value),GetEmptyStruct(), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[OnDisconnect] Error during disconnection with client {ctx.Sender}- they may not have been deleted from guests properly! " + e.Message,LogLevel.Error);
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void KeepAlive(ReducerContext ctx, KeepAliveWorker arg)
    {
        try
        {
            var heartbeat = Heartbeat.FilterById(0).First();
            heartbeat.Tick = ctx.Time.Second;

            Heartbeat.UpdateById(0, heartbeat);
        }
        catch (Exception e)
        {
            Log("Encountered error with heartbeat: " + e.Message, LogLevel.Error);
        }
    }
}
