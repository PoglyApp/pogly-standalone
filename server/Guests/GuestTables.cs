using SpacetimeDB;

public partial class Module
{
    [Table(Public = true, Name = "Guests")]
    public partial struct Guests
    {
        [PrimaryKey]
        public ConnectionId Address;
        
        [SpacetimeDB.Index.BTree(Name = "Identity")]
        public Identity Identity;

        public string Nickname;
        public string Color;
        public uint SelectedElementId;
        public uint SelectedLayoutId;

        public int PositionX;
        public int PositionY;

        public bool Authenticated;
    }

    [Table(Public = true, Name = "GuestNames")]
    public partial struct GuestNames
    {
        [PrimaryKey] public Identity Identity;
        public string Nickname;
        public StreamingPlatform StreamingPlatform;
        public string AvatarUrl;
    }
}