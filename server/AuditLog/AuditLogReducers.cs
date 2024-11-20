using SpacetimeDB;

public partial class Module
{
    [Reducer]
    public static void SendMessage(ReducerContext ctx, string chatMessage)
    {
        string func = "SendMessage";
        
        if (ctx.CallerAddress is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        try
        {
            LogAudit(ctx,func,GetEmptyStruct(),GetChangeStructFromChatMessage(chatMessage), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error sending message {chatMessage}, requested by {ctx.CallerIdentity}. " + e.Message);
        }
    }
}