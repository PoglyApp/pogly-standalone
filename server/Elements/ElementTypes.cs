using SpacetimeDB;

public partial class Module
{
    [Type]
    public partial struct TextElement
    {
        public string Text;
        public int Size;
        public string Color;
        public string Font;
        public string Css;
    }

    [Type]
    public partial struct ImageElement
    {
        public ImageElementData ImageElementData;
        public int Width;
        public int Height;
    }

    [Type]
    public partial struct WidgetElement
    {
        public uint ElementDataId;
        public int Width;
        public int Height;
        public string RawData;
    }

    [Type]
    public partial record ElementStruct : SpacetimeDB.TaggedEnum<(TextElement TextElement, ImageElement ImageElement, WidgetElement WidgetElement)> {}
    
    [Type]
    public partial record ImageElementData: SpacetimeDB.TaggedEnum<(uint ElementDataId, string RawData)> {}
}