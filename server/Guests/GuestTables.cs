using SpacetimeDB;
using static SpacetimeDB.Runtime;

public partial class Module
{
    [SpacetimeDB.Table(Public = true)]
    public partial struct Guests
    {
        [SpacetimeDB.Column(ColumnAttrs.PrimaryKey)]
        public Address Address;
        
        public Identity Identity;

        public string Nickname;
        public string Color;
        public uint SelectedElementId;
        public uint SelectedLayoutId;

        public int PositionX;
        public int PositionY;

        public bool Authenticated;
    }

    [SpacetimeDB.Table(Public = true)]
    public partial struct Permissions
    {
        [SpacetimeDB.Column(ColumnAttrs.PrimaryKey)]
        public Identity Identity;

        public PermissionLevel PermissionLevel;
    }
}