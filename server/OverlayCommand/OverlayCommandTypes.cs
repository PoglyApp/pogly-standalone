using SpacetimeDB;

public partial class Module
{
    [Type]
    public enum CommandType
    {
        Refresh,
        HardRefresh,
    }
}