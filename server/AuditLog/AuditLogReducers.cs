using SpacetimeDB;
using static SpacetimeDB.Runtime;

public partial class Module
{
    [SpacetimeDB.Reducer]
    public static void SendMessage(ReducerContext ctx, string chatMessage)
    {
        string func = "SendMessage";
        
        if (ctx.Address is null) return;
        if (!GetGuest(func, ctx.Address, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        try
        {
            LogAudit(ctx,func,GetEmptyStruct(),GetChangeStructFromChatMessage(chatMessage), Config.FindByVersion(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log($"[{func}] Error sending message {chatMessage}, requested by {ctx.Sender}. " + e.Message, LogLevel.Error);
        }
    }
}