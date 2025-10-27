using SpacetimeDB;

public partial class Module
{
    // [Table(Public = true, Name = "Permissions")]
    // public partial struct Permissions
    // {
    //     [PrimaryKey]
    //     public Identity Identity;
    //
    //     public string Nickname;
    //     public PermissionLevel PermissionLevel;
    // }

    [Table(Public = true, Name = "Permissions")]
    [SpacetimeDB.Index.BTree(Name = "UserPermissions", Columns = [nameof(Identity), nameof(PermissionType)])]
    public partial struct Permissions
    {
        public Identity Identity;
        public uint PermissionType;
    }
}

