using static SpacetimeDB.Runtime;

public partial class Module
{
    private static uint GetActiveLayout()
    {
        return Layouts.FilterByActive(true).First().Id;
    }
}