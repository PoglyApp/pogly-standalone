using SpacetimeDB;

public partial class Module
{
    [Reducer]
    public static void IssueOverlayCommand(ReducerContext ctx, CommandType command)
    {
        string func = "IssueOverlayCommand";

        if (ctx.CallerAddress is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
            if (!IsGuestModerator(func, ctx)) return;
        
        try
        {
            ctx.Db.OverlayCommand.Insert(new OverlayCommand
            {
                Command = command,
                IssuedBy = ctx.CallerIdentity,
                Timestamp = ctx.Timestamp.ToUnixTimeSeconds(),
                Completed = false
            });
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Encountered an error issuing command ({command}) requested by {ctx.CallerIdentity}: " + e.Message);
        }
    }

    [Reducer]
    public static void CompleteOverlayCommand(ReducerContext ctx, uint commandId)
    {
        string func = "CompleteOverlayCommand";
        
        if (ctx.CallerAddress is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;

        try
        {
            var command = ctx.Db.OverlayCommand.Id.Find(commandId);
            if (command.HasValue)
            {
                var newCommand = command.Value;
                newCommand.Completed = true;
                ctx.Db.OverlayCommand.Id.Update(newCommand);
            }
            else
            {
                Log.Error($"[{func}] Encountered an error completing command ({command}) requested by {ctx.CallerIdentity} - couldn't find commandId!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Encountered an error completing command with Id#({commandId}) requested by {ctx.CallerIdentity}: " + e.Message);
        }
    }
}