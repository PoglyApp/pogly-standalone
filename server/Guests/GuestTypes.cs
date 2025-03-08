using SpacetimeDB;

public partial class Module
{
    [Type]
    public enum PermissionLevel
    {
        None,
        Editor,
        Moderator,
        Owner
    }
    
}