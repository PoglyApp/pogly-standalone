using SpacetimeDB;

public partial class Module
{
    private static void IncrementFolder(ReducerContext ctx, string func)
    {
        try
        {
            var autoInc = ctx.Db.AutoInc.Version.Find(0)!.Value;
            autoInc.FolderIncrement++;
            ctx.Db.AutoInc.Version.Update(autoInc);
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error incrementing AutoInc for Folders, requested by {ctx.Sender}. " + e.Message);
        }
    }

    private static void IncrementElements(ReducerContext ctx, string func)
    {
        try
        {
            var autoInc = ctx.Db.AutoInc.Version.Find(0)!.Value;
            autoInc.ElementsIncrement++;
            ctx.Db.AutoInc.Version.Update(autoInc);
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error incrementing AutoInc for Elements, requested by {ctx.Sender}. " + e.Message);
        }
    }
    
    private static void IncrementElementData(ReducerContext ctx, string func)
    {
        try
        {
            var autoInc = ctx.Db.AutoInc.Version.Find(0)!.Value;
            autoInc.ElementDataIncrement++;
            ctx.Db.AutoInc.Version.Update(autoInc);
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error incrementing AutoInc for ElementData, requested by {ctx.Sender}. " + e.Message);
        }
    }
    
    private static void IncrementLayouts(ReducerContext ctx, string func)
    {
        try
        {
            var autoInc = ctx.Db.AutoInc.Version.Find(0)!.Value;
            autoInc.LayoutsIncrement++;
            ctx.Db.AutoInc.Version.Update(autoInc);
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error incrementing AutoInc for Layouts, requested by {ctx.Sender}. " + e.Message);
        }
    }

    private static AutoInc MigrateAutoInc(ReducerContext ctx, string func)
    {
        ctx.Db.AutoInc.Insert(new AutoInc
        {
            Version = 0,
            FolderIncrement = 0,
            ElementsIncrement = 0,
            ElementDataIncrement = 0,
            LayoutsIncrement = 0
        });
        InternalAutoIncSync(ctx, func);
        var autoInc = ctx.Db.AutoInc.Version.Find(0);
        if (autoInc is null) throw new Exception($"[{func}] Failed to migrate AutoInc!");
        return autoInc.Value;
    }
}