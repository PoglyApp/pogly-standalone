using SpacetimeDB;

public partial class Module
{
    [Table(Public = true, Name = "Elements")]
    public partial struct Elements
    {
        [PrimaryKey]
        [AutoInc]
        public uint Id;

        public ElementStruct Element;

        public int Transparency;
        public string Transform;
        public string Clip;
        public bool Locked;

        public uint LayoutId;

        public string PlacedBy;
        public string LastEditedBy;

        public int ZIndex;
    }
}