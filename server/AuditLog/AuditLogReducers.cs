using SpacetimeDB;

public partial class Module
{
    [Reducer]
    public static void SendMessage(ReducerContext ctx, string chatMessage)
    {
        string func = "SendMessage";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        if (!HasPermission(ctx, ctx.Sender, PermissionTypes.SendMessage)) return;
        
        try
        {
            LogAudit(ctx,func,GetEmptyStruct(),GetChangeStructFromChatMessage(chatMessage), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error sending message {chatMessage}, requested by {ctx.Sender}. " + e.Message);
        }
    }
}