using SpacetimeDB.Module;
using static SpacetimeDB.Runtime;

public partial class Module
{
    [SpacetimeDB.Type]
    public partial struct ElementDataChange
    {
        public uint Id;
        public string Name;
        public DataType DataType;
        public string Data;
        public string CreatedBy;
    }

    [SpacetimeDB.Type]
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

    [SpacetimeDB.Type]
    public partial struct GuestChange
    {
        public Identity Identity;
        public string Nickname;
        public string Color;
        public uint SelectedElementId;
        public int PositionX;
        public int PositionY;
    }

    [SpacetimeDB.Type]
    public partial struct ChatMessage
    {
        public string Message;
    }
    
    [SpacetimeDB.Type]
    public partial struct EmptyChange
    {}

    [SpacetimeDB.Type]
    public partial record ChangeStruct : SpacetimeDB.TaggedEnum<(ElementDataChange ElementDataChange, ElementChange
        ElementChange, GuestChange GuestChange, EmptyChange EmptyChange, ChatMessage ChatMessage)> {}
}