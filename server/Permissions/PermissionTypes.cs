using SpacetimeDB;

public partial class Module
{
    public enum PermissionTypes : uint
    {
        None = 0,
        Editor = 9997,
        Moderator = 9998,
        Owner = 9999,
    }
}