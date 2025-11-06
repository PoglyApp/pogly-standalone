using SpacetimeDB;
using Index = SpacetimeDB.Index;

public partial class Module
{
    [Table(Public = true, Name = "Permissions")]
    [Index.BTree(Name = "UserPermissions", Columns = [nameof(Identity), nameof(PermissionType)])]
    public partial struct Permissions
    {
        public Identity Identity;
        public uint PermissionType;
    }

    [Table(Public = true, Name = "Whitelist")]
    public partial struct Whitelist
    {
        public StreamingPlatform Platform;
        [Index.BTree(Name = "Username")] public string Username;
    }
}

