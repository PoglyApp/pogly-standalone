using SpacetimeDB;


public partial class Module
{
    [Table(Public = true, Name = "ElementData")]
    public partial struct ElementData
    {
        [PrimaryKey]
        [AutoInc]
        public uint Id;

        [SpacetimeDB.Index.BTree(Name = "Name")]
        public string Name;
        public DataType DataType;
        public string Data;
        public byte[]? ByteArray;
        public int DataWidth;
        public int DataHeight;
        public uint FolderId;
        public string CreatedBy;
    }
}