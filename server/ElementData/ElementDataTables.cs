using SpacetimeDB;

public partial class Module
{
    [SpacetimeDB.Table(Public = true)]
    public partial struct ElementData
    {
        [SpacetimeDB.Column(ColumnAttrs.PrimaryKeyAuto)]
        public uint Id;

        public string Name;
        public DataType DataType;
        public string Data;
        public byte[]? ByteArray;
        public int DataWidth;
        public int DataHeight;
        public string CreatedBy;
    }
}