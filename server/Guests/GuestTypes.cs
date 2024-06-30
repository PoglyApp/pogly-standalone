using SpacetimeDB.Module;

public partial class Module
{
    [SpacetimeDB.Type]
    public enum PermissionLevel
    {
        None,
        Editor,
        Moderator,
        Owner
    }
    
}