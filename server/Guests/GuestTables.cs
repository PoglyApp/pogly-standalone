﻿using SpacetimeDB;

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

    [Table(Public = true, Name = "Permissions")]
    public partial struct Permissions
    {
        [PrimaryKey]
        public Identity Identity;

        public string Nickname;
        public PermissionLevel PermissionLevel;
    }
}