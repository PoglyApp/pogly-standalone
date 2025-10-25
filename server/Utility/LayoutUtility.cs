using SpacetimeDB;

public partial class Module
{
    private static uint GetActiveLayout(ReducerContext ctx)
    {
        return ctx.Db.Layouts.ActiveLayout.Filter(true).First().Id;
    }
}