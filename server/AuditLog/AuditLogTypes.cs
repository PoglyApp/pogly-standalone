using SpacetimeDB;

public partial class Module
{
    [Type]
    public partial struct ElementDataChange
    {
        public uint Id;
        public string Name;
        public DataType DataType;
        public string Data;
        public string CreatedBy;
    }

    [Type]
    public partial struct ElementChange
    {
        public uint Id;
        public ElementStruct Element;
        public int Transparency;
        public string Transform;
        public string Clip;
        public string PlacedBy;
        public string LastEditedBy;
        public int ZIndex;
    }

    [Type]
    public partial struct GuestChange
    {
        public Identity Identity;
        public string Nickname;
        public string Color;
        public uint SelectedElementId;
        public int PositionX;
        public int PositionY;
    }

    [Type]
    public partial struct ChatMessage
    {
        public string Message;
    }
    
    [Type]
    public partial struct EmptyChange
    {}

    [Type]
    public partial record ChangeStruct : SpacetimeDB.TaggedEnum<(ElementDataChange ElementDataChange, ElementChange
        ElementChange, GuestChange GuestChange, EmptyChange EmptyChange, ChatMessage ChatMessage)> {}
}