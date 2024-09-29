using SpacetimeDB;

public partial class Module
{
    [SpacetimeDB.Table(Public = true)]
    public partial struct Elements
    {
        [SpacetimeDB.Column(ColumnAttrs.PrimaryKeyAuto)]
        public uint Id;

        public ElementStruct Element;

        public int Transparency;
        public string Transform;
        public string Clip;
        public bool Locked;

        public uint? FolderId;
        public uint LayoutId;

        public string PlacedBy;
        public string LastEditedBy;

        public int ZIndex;
    }
}