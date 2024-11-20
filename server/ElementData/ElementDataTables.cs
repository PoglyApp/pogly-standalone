using SpacetimeDB;

public partial class Module
{
    [Table(Public = true, Name = "ElementData")]
    [Index(Name = "Name", BTree = ["Name"])]
    public partial struct ElementData
    {
        [PrimaryKey]
        [AutoInc]
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