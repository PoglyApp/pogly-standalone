using System.Text.RegularExpressions;
using SpacetimeDB;

public partial class Module
{
    private const int ALWAYS_ON_TOP_MIN = 900001;
    private const int ALWAYS_ON_TOP_MAX = 999999;

    [Reducer]
    public static void AddElement(ReducerContext ctx, ElementStruct element, int transparency, string transform,
        string clip, uint? folderId = null)
    {
        string func = "AddElement";
        
        try
        {
            if (ctx.ConnectionId is null) return;
            if (!GetGuest(func, ctx, out var guest)) return;
            if (!GuestAuthenticated(func, guest)) return;

            if (element is ElementStruct.ImageElement {ImageElement_.ImageElementData: ImageElementData.RawData data})
            {
                if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
                    if (!Regex.Match(data.RawData_, SEVEN_TV_TENOR_REGEX, RegexOptions.IgnoreCase).Success) 
                        if (!IsGuestModerator(func, ctx)) return;
            }

            if (element is ElementStruct.TextElement text)
            {
                if (Regex.Match(text.TextElement_.Text, HTML_TAG_REGEX, RegexOptions.IgnoreCase).Success)
                    return;
            }
            
            uint maxId = 0;
            foreach (var i in ctx.Db.Elements.Iter())
            {
                if (i.Id > maxId) maxId = i.Id;
            }

            var newElement = new Elements
            {
                Id = maxId + 1,
                Element = element,
                Transparency = transparency,
                Transform = transform,
                Clip = clip,
                Locked = false,
                LayoutId = GetActiveLayout(ctx),
                FolderId = folderId,
                PlacedBy = guest.Nickname,
                LastEditedBy = guest.Nickname,
                ZIndex = ctx.Db.ZIndex.Version.Find(0)!.Value.Max + 1,
                AlwaysOnTop = false
            };
            ctx.Db.Elements.Insert(newElement);
            
            LogAudit(ctx,func,GetEmptyStruct(),GetChangeStructFromElement(newElement), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error adding new element, requested by {ctx.Sender}! " + e.Message);
        }
    }
    
    [Reducer]
    public static void AddElementToLayout(ReducerContext ctx, ElementStruct element, int transparency, string transform,
        string clip, uint layoutId, uint? folderId = null)
    {
        string func = "AddElementToLayout";
        
        try
        {
            if (ctx.ConnectionId is null) return;
            if (!GetGuest(func, ctx, out var guest)) return;
            if (!GuestAuthenticated(func, guest)) return;

            if (element is ElementStruct.ImageElement {ImageElement_.ImageElementData: ImageElementData.RawData data})
            {
                if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
                    if (!Regex.Match(data.RawData_, SEVEN_TV_TENOR_REGEX, RegexOptions.IgnoreCase).Success) 
                        if (!IsGuestModerator(func, ctx)) return;
            }

            if (element is ElementStruct.TextElement text)
            {
                if (Regex.Match(text.TextElement_.Text, HTML_TAG_REGEX, RegexOptions.IgnoreCase).Success)
                    return;
            }

            uint maxId = 0;
            foreach (var i in ctx.Db.Elements.Iter())
            {
                if (i.Id > maxId) maxId = i.Id;
            }
            
            var newElement = new Elements
            {
                Id = maxId + 1,
                Element = element,
                Transparency = transparency,
                Transform = transform,
                Clip = clip,
                Locked = false,
                LayoutId = layoutId,
                FolderId = folderId,
                PlacedBy = guest.Nickname,
                LastEditedBy = guest.Nickname,
                ZIndex = ctx.Db.ZIndex.Version.Find(0)!.Value.Max + 1,
                AlwaysOnTop = false
            };
            ctx.Db.Elements.Insert(newElement);
            
            LogAudit(ctx,func,GetEmptyStruct(),GetChangeStructFromElement(newElement), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error adding new element, requested by {ctx.Sender}! " + e.Message);
        }
    }
    
    [Reducer]
    public static void ImportElement(ReducerContext ctx, ElementStruct element, int transparency, string transform,
        string clip, uint layoutId, string placedBy, string lastEditedBy, int zindex, uint? folderId = null)
    {
        string func = "ImportElement";

        if (!IsGuestOwner(func, ctx))
        {
            if (ctx.Db.Config.Version.Find(0)!.Value.ConfigInit) return;
        }
        
        try
        {
            var newElement = new Elements
            {
                Element = element,
                Transparency = transparency,
                Transform = transform,
                Clip = clip,
                Locked = false,
                LayoutId = layoutId,
                FolderId = folderId,
                PlacedBy = placedBy,
                LastEditedBy = lastEditedBy,
                ZIndex = zindex,
                AlwaysOnTop = false
            };
            ctx.Db.Elements.Insert(newElement);
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error adding new element, requested by {ctx.Sender}! " + e.Message);
        }
    }

    [Reducer]
    public static void UpdateElement(ReducerContext ctx, uint elementId, ElementStruct element, int transparency, string transform,
        string clip, bool locked)
    {
        string func = "UpdateElement";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        try
        {
            if (element is ElementStruct.ImageElement {ImageElement_.ImageElementData: ImageElementData.RawData data})
            {
                if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
                    if (!Regex.Match(data.RawData_, SEVEN_TV_TENOR_REGEX, RegexOptions.IgnoreCase).Success) 
                        if (!IsGuestModerator(func, ctx)) return;
            }
            
            if (element is ElementStruct.TextElement text)
            {
                if (Regex.Match(text.TextElement_.Text, HTML_TAG_REGEX, RegexOptions.IgnoreCase).Success)
                    return;
            }

            var oldElement = ctx.Db.Elements.Id.Find(elementId);

            if (oldElement.HasValue)
            {
                var updatedElement = oldElement.Value;
                updatedElement.Element = element;
                updatedElement.Transparency = transparency;
                updatedElement.Transform = transform;
                updatedElement.Clip = clip;
                updatedElement.Locked = locked;
                updatedElement.LastEditedBy = guest.Nickname;

                if (oldElement.Value.AlwaysOnTop)
                {
                    // Preserve Always On Top range for AOT elements
                    updatedElement.ZIndex = oldElement.Value.ZIndex;
                }
                else
                {
                    updatedElement.ZIndex = ctx.Db.ZIndex.Version.Find(0)!.Value.Max + 1;
                }

                ctx.Db.Elements.Id.Update(updatedElement);
            
                LogAudit(ctx,func,GetChangeStructFromElement(oldElement.Value),GetChangeStructFromElement(updatedElement), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Error updating element with id {elementId}, requested by {ctx.Sender}! Can't find existing Element!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error updating element with id {elementId}, requested by {ctx.Sender}! " + e.Message);
        }
    }

    [Reducer]
    public static void UpdateElementStruct(ReducerContext ctx, uint elementId, ElementStruct elementStruct)
    {
        string func = "UpdateElementStruct";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        try
        {
            if (elementStruct is ElementStruct.ImageElement {ImageElement_.ImageElementData: ImageElementData.RawData data})
            {
                if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
                    if (!Regex.Match(data.RawData_, SEVEN_TV_TENOR_REGEX, RegexOptions.IgnoreCase).Success) 
                        if (!IsGuestModerator(func, ctx)) return;
            }
            
            if (elementStruct is ElementStruct.TextElement text)
            {
                if (Regex.Match(text.TextElement_.Text, HTML_TAG_REGEX, RegexOptions.IgnoreCase).Success)
                    return;
            }

            var oldElement = ctx.Db.Elements.Id.Find(elementId);

            if (oldElement.HasValue)
            {
                var updatedElement = oldElement.Value;
                updatedElement.Element = elementStruct;
                updatedElement.LastEditedBy = guest.Nickname;

                ctx.Db.Elements.Id.Update(updatedElement);
            
                LogAudit(ctx,func,GetChangeStructFromElement(oldElement.Value),GetChangeStructFromElement(updatedElement), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Error updating element struct with id {elementId}, requested by {ctx.Sender}! Can't find existing Element!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error updating element struct with id {elementId}, requested by {ctx.Sender}! " + e.Message);
        }
    }

    #region (UpdateStruct Reducers)

    [Reducer]
    public static void UpdateTextElementText(ReducerContext ctx, uint elementId, string text)
    {
        string func = "UpdateTextElementText";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        try
        {
            if (Regex.Match(text, HTML_TAG_REGEX, RegexOptions.IgnoreCase).Success)
                return;

            var oldElement = ctx.Db.Elements.Id.Find(elementId);

            if (oldElement.HasValue)
            {
                if (oldElement.Value.Element is not ElementStruct.TextElement textElement) return;
            
                var updatedElement = oldElement.Value;
                var updatedTextElement = textElement.TextElement_;
                updatedTextElement.Text = text;
                updatedElement.Element = new ElementStruct.TextElement(updatedTextElement);

                ctx.Db.Elements.Id.Update(updatedElement);
            
                LogAudit(ctx,func,GetChangeStructFromElement(oldElement.Value),GetChangeStructFromElement(updatedElement), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Error updating UpdateTextElementText with id {elementId} and text {text}, requested by {ctx.Sender}! Can't find existing Element!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error updating UpdateTextElementText with id {elementId} and text {text}, requested by {ctx.Sender}! " + e.Message);
        }
    }

    [Reducer]
    public static void UpdateTextElementSize(ReducerContext ctx, uint elementId, int size)
    {
        string func = "UpdateTextElementSize";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        try
        {
            var oldElement = ctx.Db.Elements.Id.Find(elementId);

            if (oldElement.HasValue)
            {
                if (oldElement.Value.Element is not ElementStruct.TextElement textElement) return;
            
                var updatedElement = oldElement.Value;
                var updatedTextElement = textElement.TextElement_;
                updatedTextElement.Size = size;
                updatedElement.Element = new ElementStruct.TextElement(updatedTextElement);

                ctx.Db.Elements.Id.Update(updatedElement);
            
                LogAudit(ctx,func,GetChangeStructFromElement(oldElement.Value),GetChangeStructFromElement(updatedElement), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Error updating UpdateTextElementSize with id {elementId} and size {size.ToString()}, requested by {ctx.Sender}! Couldn't find existing Element!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error updating UpdateTextElementSize with id {elementId} and size {size.ToString()}, requested by {ctx.Sender}! " + e.Message);
        }
    }

    [Reducer]
    public static void UpdateTextElementColor(ReducerContext ctx, uint elementId, string color)
    {
        string func = "UpdateTextElementColor";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        try
        {
            var oldElement = ctx.Db.Elements.Id.Find(elementId);

            if (oldElement.HasValue)
            {
                if (oldElement.Value.Element is not ElementStruct.TextElement textElement) return;
            
                var updatedElement = oldElement.Value;
                var updatedTextElement = textElement.TextElement_;
                updatedTextElement.Color = color;
                updatedElement.Element = new ElementStruct.TextElement(updatedTextElement);

                ctx.Db.Elements.Id.Update(updatedElement);
            
                LogAudit(ctx,func,GetChangeStructFromElement(oldElement.Value),GetChangeStructFromElement(updatedElement), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Error updating UpdateTextElementColor with id {elementId} and color {color}, requested by {ctx.Sender}! Couldn't find existing Element!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error updating UpdateTextElementColor with id {elementId} and color {color}, requested by {ctx.Sender}! " + e.Message);
        }
    }

    [Reducer]
    public static void UpdateTextElementFont(ReducerContext ctx, uint elementId, string font)
    {
        string func = "UpdateTextElementFont";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        try
        {
            var oldElement = ctx.Db.Elements.Id.Find(elementId);

            if (oldElement.HasValue)
            {
                if (oldElement.Value.Element is not ElementStruct.TextElement textElement) return;
            
                var updatedElement = oldElement.Value;
                var updatedTextElement = textElement.TextElement_;
                updatedTextElement.Font = font;
                updatedElement.Element = new ElementStruct.TextElement(updatedTextElement);

                ctx.Db.Elements.Id.Update(updatedElement);
            
                LogAudit(ctx,func,GetChangeStructFromElement(oldElement.Value),GetChangeStructFromElement(updatedElement), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Error updating UpdateTextElementFont with id {elementId} and font {font}, requested by {ctx.Sender}! Couldn't find existing Element!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error updating UpdateTextElementFont with id {elementId} and font {font}, requested by {ctx.Sender}! " + e.Message);
        }
    }
    
    [Reducer]
    public static void UpdateTextElementShadow(ReducerContext ctx, uint elementId, string css)
    {
        string func = "UpdateTextElementShadow";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        try
        {
            var oldElement = ctx.Db.Elements.Id.Find(elementId);

            if (oldElement.HasValue)
            {
                if (oldElement.Value.Element is not ElementStruct.TextElement textElement) return;
            
                var updatedElement = oldElement.Value;
                var updatedTextElement = textElement.TextElement_;
                updatedTextElement.Css = css;
                updatedElement.Element = new ElementStruct.TextElement(updatedTextElement);

                ctx.Db.Elements.Id.Update(updatedElement);
            
                LogAudit(ctx,func,GetChangeStructFromElement(oldElement.Value),GetChangeStructFromElement(updatedElement), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Error updating UpdateTextElementShadow with id {elementId} and font {css}, requested by {ctx.Sender}! Couldn't find existing Element!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error updating UpdateTextElementShadow with id {elementId} and font {css}, requested by {ctx.Sender}! " + e.Message);
        }
    }

    [Reducer]
    public static void UpdateImageElementDataStruct(ReducerContext ctx, uint elementId,
        ImageElementData imageElementData)
    {
        string func = "UpdateImageElementDataStruct";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx)) return;
        }
        
        try
        {
            var oldElement = ctx.Db.Elements.Id.Find(elementId);

            if (oldElement.HasValue)
            {
                if (oldElement.Value.Element is not ElementStruct.ImageElement imageElement) return;
            
                var updatedElement = oldElement.Value;
                var updatedImageElement = imageElement.ImageElement_;
                updatedImageElement.ImageElementData = imageElementData;
                updatedElement.Element = new ElementStruct.ImageElement(updatedImageElement);

                ctx.Db.Elements.Id.Update(updatedElement);
            
                LogAudit(ctx,func,GetChangeStructFromElement(oldElement.Value),GetChangeStructFromElement(updatedElement), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Error updating UpdateImageElementDataStruct with id {elementId}, requested by {ctx.Sender}! Couldn't find existing Element");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error updating UpdateImageElementDataStruct with id {elementId}, requested by {ctx.Sender}! " + e.Message);
        }
    }

    [Reducer]
    public static void UpdateImageElementSize(ReducerContext ctx, uint elementId, int width, int height)
    {
        string func = "UpdateImageElementSize";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        try
        {
            var oldElement = ctx.Db.Elements.Id.Find(elementId);

            if (oldElement.HasValue)
            {
                if (oldElement.Value.Element is not ElementStruct.ImageElement imageElement) return;
            
                var updatedElement = oldElement.Value;
                var updatedImageElement = imageElement.ImageElement_;
                updatedImageElement.Width = width;
                updatedImageElement.Height = height;
                updatedElement.Element = new ElementStruct.ImageElement(updatedImageElement);

                ctx.Db.Elements.Id.Update(updatedElement);
            
                LogAudit(ctx,func,GetChangeStructFromElement(oldElement.Value),GetChangeStructFromElement(updatedElement), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Error updating UpdateImageElementSize with id {elementId} with width {width} / height {height}, requested by {ctx.Sender}! Couldn't find existing Element!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error updating UpdateImageElementSize with id {elementId} with width {width} / height {height}, requested by {ctx.Sender}! " + e.Message);
        }
    }
    
    [Reducer]
    public static void UpdateImageElementWidth(ReducerContext ctx, uint elementId, int width)
    {
        string func = "UpdateImageElementWidth";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        try
        {
            var oldElement = ctx.Db.Elements.Id.Find(elementId);

            if (oldElement.HasValue)
            {
                if (oldElement.Value.Element is not ElementStruct.ImageElement imageElement) return;
            
                var updatedElement = oldElement.Value;
                var updatedImageElement = imageElement.ImageElement_;
                updatedImageElement.Width = width;
                updatedElement.Element = new ElementStruct.ImageElement(updatedImageElement);

                ctx.Db.Elements.Id.Update(updatedElement);
            
                LogAudit(ctx,func,GetChangeStructFromElement(oldElement.Value),GetChangeStructFromElement(updatedElement), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Error updating UpdateImageElementWidth with id {elementId} with width {width}, requested by {ctx.Sender}! Couldn't find existing Element!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error updating UpdateImageElementWidth with id {elementId} with width {width}, requested by {ctx.Sender}! " + e.Message);
        }
    }
    
    [Reducer]
    public static void UpdateImageElementHeight(ReducerContext ctx, uint elementId, int height)
    {
        string func = "UpdateImageElementHeight";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        try
        {
            var oldElement = ctx.Db.Elements.Id.Find(elementId);

            if (oldElement.HasValue)
            {
                if (oldElement.Value.Element is not ElementStruct.ImageElement imageElement) return;
            
                var updatedElement = oldElement.Value;
                var updatedImageElement = imageElement.ImageElement_;
                updatedImageElement.Height = height;
                updatedElement.Element = new ElementStruct.ImageElement(updatedImageElement);

                ctx.Db.Elements.Id.Update(updatedElement);
            
                LogAudit(ctx,func,GetChangeStructFromElement(oldElement.Value),GetChangeStructFromElement(updatedElement), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Error updating UpdateImageElementHeight with id {elementId} with height {height}, requested by {ctx.Sender}! Couldn't find existing Element!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error updating UpdateImageElementHeight with id {elementId} with height {height}, requested by {ctx.Sender}! " + e.Message);
        }
    }

    [Reducer]
    public static void UpdateWidgetElementDataId(ReducerContext ctx, uint elementId, uint elementDataId)
    {
        string func = "UpdateWidgetElementDataId";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        try
        {
            var oldElement = ctx.Db.Elements.Id.Find(elementId);

            if (oldElement.HasValue)
            {
                if (oldElement.Value.Element is not ElementStruct.WidgetElement widgetElement) return;
            
                var updatedElement = oldElement.Value;
                var updatedWidgetElement = widgetElement.WidgetElement_;
                updatedWidgetElement.ElementDataId = elementDataId;
                updatedElement.Element = new ElementStruct.WidgetElement(updatedWidgetElement);

                ctx.Db.Elements.Id.Update(updatedElement);
            
                LogAudit(ctx,func,GetChangeStructFromElement(oldElement.Value),GetChangeStructFromElement(updatedElement), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Error updating UpdateWidgetElementDataId with id {elementId} with dataId {elementDataId}, requested by {ctx.Sender}! Couldn't find existing Element!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error updating UpdateWidgetElementDataId with id {elementId} with dataId {elementDataId}, requested by {ctx.Sender}! " + e.Message);
        }
    }

    [Reducer]
    public static void UpdateWidgetElementSize(ReducerContext ctx, uint elementId, int width, int height)
    {
        string func = "UpdateWidgetElementSize";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        try
        {
            var oldElement = ctx.Db.Elements.Id.Find(elementId);

            if (oldElement.HasValue)
            {
                if (oldElement.Value.Element is not ElementStruct.WidgetElement widgetElement) return;
            
                var updatedElement = oldElement.Value;
                var updatedWidgetElement = widgetElement.WidgetElement_;
                updatedWidgetElement.Width = width;
                updatedWidgetElement.Height = height;
                updatedElement.Element = new ElementStruct.WidgetElement(updatedWidgetElement);

                ctx.Db.Elements.Id.Update(updatedElement);
            
                LogAudit(ctx,func,GetChangeStructFromElement(oldElement.Value),GetChangeStructFromElement(updatedElement), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Error updating UpdateWidgetElementSize with id {elementId} with width {width} / height {height}, requested by {ctx.Sender}! Couldn't find existing Element!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error updating UpdateWidgetElementSize with id {elementId} with width {width} / height {height}, requested by {ctx.Sender}! " + e.Message);
        }
    }
    
    [Reducer]
    public static void UpdateWidgetElementWidth(ReducerContext ctx, uint elementId, int width)
    {
        string func = "UpdateWidgetElementWidth";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        try
        {
            var oldElement = ctx.Db.Elements.Id.Find(elementId);

            if (oldElement.HasValue)
            {
                if (oldElement.Value.Element is not ElementStruct.WidgetElement widgetElement) return;
            
                var updatedElement = oldElement.Value;
                var updatedWidgetElement = widgetElement.WidgetElement_;
                updatedWidgetElement.Width = width;
                updatedElement.Element = new ElementStruct.WidgetElement(updatedWidgetElement);

                ctx.Db.Elements.Id.Update(updatedElement);
            
                LogAudit(ctx,func,GetChangeStructFromElement(oldElement.Value),GetChangeStructFromElement(updatedElement), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Error updating UpdateWidgetElementWidth with id {elementId} with width {width}, requested by {ctx.Sender}! Couldn't find existing Element!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error updating UpdateWidgetElementWidth with id {elementId} with width {width}, requested by {ctx.Sender}! " + e.Message);
        }
    }
    
    [Reducer]
    public static void UpdateWidgetElementHeight(ReducerContext ctx, uint elementId, int height)
    {
        string func = "UpdateWidgetElementHeight";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        try
        {
            var oldElement = ctx.Db.Elements.Id.Find(elementId);

            if (oldElement.HasValue)
            {
                if (oldElement.Value.Element is not ElementStruct.WidgetElement widgetElement) return;
            
                var updatedElement = oldElement.Value;
                var updatedWidgetElement = widgetElement.WidgetElement_;
                updatedWidgetElement.Height = height;
                updatedElement.Element = new ElementStruct.WidgetElement(updatedWidgetElement);

                ctx.Db.Elements.Id.Update(updatedElement);
            
                LogAudit(ctx,func,GetChangeStructFromElement(oldElement.Value),GetChangeStructFromElement(updatedElement), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error(
                    $"[{func}] Error updating UpdateWidgetElementHeight with id {elementId} with height {height}, requested by {ctx.Sender}! Couldn't find existing Element!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error updating UpdateWidgetElementHeight with id {elementId} with height {height}, requested by {ctx.Sender}! " + e.Message);
        }
    }

    [Reducer]
    public static void UpdateWidgetElementRawData(ReducerContext ctx, uint elementId, string rawData)
    {
        string func = "UpdateWidgetElementRawData";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx)) return;
        }
        
        try
        {
            var oldElement = ctx.Db.Elements.Id.Find(elementId);

            if (oldElement.HasValue)
            {
                if (oldElement.Value.Element is not ElementStruct.WidgetElement widgetElement) return;
            
                var updatedElement = oldElement.Value;
                var updatedWidgetElement = widgetElement.WidgetElement_;
                updatedWidgetElement.RawData = rawData;
                updatedElement.Element = new ElementStruct.WidgetElement(updatedWidgetElement);

                ctx.Db.Elements.Id.Update(updatedElement);
            
                LogAudit(ctx,func,GetChangeStructFromElement(oldElement.Value),GetChangeStructFromElement(updatedElement), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Error updating UpdateWidgetElementRawData with id {elementId}, requested by {ctx.Sender}! Couldn't find existing Element!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error updating UpdateWidgetElementRawData with id {elementId}, requested by {ctx.Sender}! " + e.Message);
        }
    }

    #endregion

    [Reducer]
    public static void UpdateElementTransparency(ReducerContext ctx, uint elementId, int transparency)
    {
        string func = "UpdateElementTransparency";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        try
        {
            var oldElement = ctx.Db.Elements.Id.Find(elementId);

            if (oldElement.HasValue)
            {
                var updatedElement = oldElement.Value;
                updatedElement.Transparency = transparency;
                updatedElement.LastEditedBy = guest.Nickname;

                ctx.Db.Elements.Id.Update(updatedElement);
            
                LogAudit(ctx,func,GetChangeStructFromElement(oldElement.Value),GetChangeStructFromElement(updatedElement), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Error updating element transparency with id {elementId}, requested by {ctx.Sender}! Couldn't find existing Element!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error updating element transparency with id {elementId}, requested by {ctx.Sender}! " + e.Message);
        }
    }

    [Reducer]
    public static void UpdateElementTransform(ReducerContext ctx, uint elementId, string transform)
    {
        string func = "UpdateElementTransform";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        try
        {
            var oldElement = ctx.Db.Elements.Id.Find(elementId);

            if (oldElement.HasValue)
            {
                var updatedElement = oldElement.Value;
                updatedElement.Transform = transform;
                updatedElement.LastEditedBy = guest.Nickname;

                ctx.Db.Elements.Id.Update(updatedElement);
            
                LogAudit(ctx,func,GetChangeStructFromElement(oldElement.Value),GetChangeStructFromElement(updatedElement), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Error updating element transform with id {elementId}, requested by {ctx.Sender}! Couldn't find existing Element!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error updating element transform with id {elementId}, requested by {ctx.Sender}! " + e.Message);
        }
    }
    
    [Reducer]
    public static void UpdateElementClip(ReducerContext ctx, uint elementId, string clip)
    {
        string func = "UpdateElementClip";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        try
        {
            var oldElement = ctx.Db.Elements.Id.Find(elementId);

            if (oldElement.HasValue)
            {
                var updatedElement = oldElement.Value;
                updatedElement.Clip = clip;
                updatedElement.LastEditedBy = guest.Nickname;

                ctx.Db.Elements.Id.Update(updatedElement);
            
                LogAudit(ctx,func,GetChangeStructFromElement(oldElement.Value),GetChangeStructFromElement(updatedElement), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Error updating elements clipping with id {elementId}, requested by {ctx.Sender}! Can't find existing Element!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error updating elements clipping with id {elementId}, requested by {ctx.Sender}! " + e.Message);
        }
    }

    [Reducer]
    public static void UpdateElementLocked(ReducerContext ctx, uint elementId, bool locked)
    {
        string func = "UpdateElementLocked";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        try
        {
            var oldElement = ctx.Db.Elements.Id.Find(elementId);

            if (oldElement.HasValue)
            {
                var updatedElement = oldElement.Value;
                updatedElement.Locked = locked;
                updatedElement.LastEditedBy = guest.Nickname;

                ctx.Db.Elements.Id.Update(updatedElement);
            
                LogAudit(ctx, func, GetChangeStructFromElement(oldElement.Value),GetChangeStructFromElement(updatedElement), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Error updating elements locked with id {elementId}, requested by {ctx.Sender}! Can't find existing Element!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error updating elements locked with id {elementId}, requested by {ctx.Sender}! " + e.Message);
        }
    }

    [Reducer]
    public static void UpdateElementLayout(ReducerContext ctx, uint elementId, uint layoutId)
    {
        string func = "UpdateElementLayout";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx)) return;
        }

        try
        {
            var oldElement = ctx.Db.Elements.Id.Find(elementId);

            if (oldElement.HasValue)
            {
                var updatedElement = oldElement.Value;
                updatedElement.LayoutId = layoutId;
                updatedElement.LastEditedBy = guest.Nickname;

                ctx.Db.Elements.Id.Update(updatedElement);
            
                //TODO: Update AuditLog Elements ChangeStruct to include Layout Column
                if(ctx.Db.Config.Version.Find(0)!.Value.DebugMode) 
                    Log.Info($"[Elements - {func}] {guest.Nickname} updated elementId {elementId} to layout {layoutId}!");
            }
            else
            {
                Log.Error($"[{func}] Error updating elements layout with id {elementId} and layoutId {layoutId}, requested by {ctx.Sender}! Couldn't find existing Element!");
            }
        }
        catch(Exception e)
        {
            Log.Error($"[{func}] Error updating elements layout with id {elementId} and layoutId {layoutId}, requested by {ctx.Sender}! " + e.Message);
        }
    }
    
    [Reducer]
    public static void UpdateElementFolder(ReducerContext ctx, uint elementId, uint? folderId)
    {
        string func = "UpdateElementFolder";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx)) return;
        }
        
        try
        {
            var oldElement = ctx.Db.Elements.Id.Find(elementId);

            if (oldElement.HasValue)
            {
                var updatedElement = oldElement.Value;
                updatedElement.FolderId = folderId;
                updatedElement.LastEditedBy = guest.Nickname;

                ctx.Db.Elements.Id.Update(updatedElement);
            
                //TODO: Update AuditLog Elements ChangeStruct to include Layout Column
                if(ctx.Db.Config.Version.Find(0)!.Value.DebugMode) 
                    Log.Info($"[Elements - {func}] {guest.Nickname} updated elementId {elementId} to folder {folderId}!");
            }
            else
            {
                Log.Error($"[{func}] Error updating elements layout with id {elementId} and folderId {folderId}, requested by {ctx.Sender}! Couldn't find existing Element!");
            }
        }
        catch(Exception e)
        {
            Log.Error($"[{func}] Error updating elements layout with id {elementId} and folderId {folderId}, requested by {ctx.Sender}! " + e.Message);
        }
    }
    
    private static void UpdateElementZIndex(ReducerContext ctx, uint elementId)
    {
        if (elementId == 0) return;
        string func = "UpdateElementZIndex";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        try
        {
            var targetElement = ctx.Db.Elements.Id.Find(elementId);

            if (!targetElement.HasValue)
            {
                Log.Error($"[{func}] Error updating elements zIndex with id {elementId}, requested by {ctx.Sender}! Couldn't find existing Element!");
                return;
            }

            bool isAlwaysOnTop = targetElement.Value.AlwaysOnTop;
            var allElements = ctx.Db.Elements.Iter().ToList();

            if (isAlwaysOnTop)
            {
                // Handle Always On Top range (ALWAYS_ON_TOP_MIN to ALWAYS_ON_TOP_MAX)
                List<int> aotZIndexes = allElements
                    .Where(e => e.AlwaysOnTop && e.Id != elementId)
                    .Select(e => e.ZIndex)
                    .ToList();

                int newZIndex;
                if (aotZIndexes.Count == 0)
                {
                    newZIndex = ALWAYS_ON_TOP_MIN;
                }
                else
                {
                    int aotMax = aotZIndexes.Max();
                    if (aotMax >= ALWAYS_ON_TOP_MAX)
                    {
                        // Compress AOT range: reassign all non-target AOT elements starting from ALWAYS_ON_TOP_MIN
                        var aotElements = allElements
                            .Where(e => e.AlwaysOnTop && e.Id != elementId)
                            .OrderBy(e => e.ZIndex)
                            .ToList();
                        int counter = ALWAYS_ON_TOP_MIN;
                        foreach (var ae in aotElements)
                        {
                            var updated = ae;
                            updated.ZIndex = counter++;
                            ctx.Db.Elements.Id.Update(updated);
                        }
                        newZIndex = counter;
                    }
                    else
                    {
                        newZIndex = aotMax + 1;
                    }
                }

                var updatedElement = targetElement.Value;
                updatedElement.ZIndex = newZIndex;
                updatedElement.LastEditedBy = guest.Nickname;
                ctx.Db.Elements.Id.Update(updatedElement);
                LogAudit(ctx, func, GetChangeStructFromElement(targetElement.Value), GetChangeStructFromElement(updatedElement), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                // Handle normal range, excluding Always On Top elements from min/max tracking
                List<int> zIndexes = allElements
                    .Where(e => !e.AlwaysOnTop)
                    .Select(e => e.ZIndex)
                    .ToList();

                if (zIndexes.Count == 0) return;

                var updateZIndex = ctx.Db.ZIndex.Version.Find(0)!.Value;
                updateZIndex.Min = zIndexes.Min();
                updateZIndex.Max = zIndexes.Max();

                if (updateZIndex.Min > updateZIndex.Ceiling && updateZIndex.Max > updateZIndex.Ceiling)
                {
                    updateZIndex.Min -= updateZIndex.Ceiling;
                    updateZIndex.Max -= updateZIndex.Ceiling;
                }

                ctx.Db.ZIndex.Version.Update(updateZIndex);

                var updatedElement = targetElement.Value;
                updatedElement.ZIndex = updateZIndex.Max + 1;
                updatedElement.LastEditedBy = guest.Nickname;
                ctx.Db.Elements.Id.Update(updatedElement);
                LogAudit(ctx, func, GetChangeStructFromElement(targetElement.Value), GetChangeStructFromElement(updatedElement), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error updating elements zIndex with id {elementId}, requested by {ctx.Sender}! " + e.Message);
        }
    }

    [Reducer]
    public static void UpdateElementAlwaysOnTop(ReducerContext ctx, uint elementId, bool alwaysOnTop)
    {
        string func = "UpdateElementAlwaysOnTop";

        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;

        try
        {
            var oldElement = ctx.Db.Elements.Id.Find(elementId);

            if (!oldElement.HasValue)
            {
                Log.Error($"[{func}] Error updating AlwaysOnTop for element with id {elementId}, requested by {ctx.Sender}! Couldn't find existing Element!");
                return;
            }

            var updatedElement = oldElement.Value;
            updatedElement.AlwaysOnTop = alwaysOnTop;

            if (alwaysOnTop)
            {
                // Find max ZIndex in Always On Top range across all other AOT elements
                var allElements = ctx.Db.Elements.Iter().ToList();
                List<int> aotZIndexes = allElements
                    .Where(e => e.AlwaysOnTop && e.Id != elementId)
                    .Select(e => e.ZIndex)
                    .ToList();

                int newZIndex;
                if (aotZIndexes.Count == 0)
                {
                    newZIndex = ALWAYS_ON_TOP_MIN;
                }
                else
                {
                    int aotMax = aotZIndexes.Max();
                    if (aotMax >= ALWAYS_ON_TOP_MAX)
                    {
                        // Compress AOT range: reassign all other AOT elements starting from ALWAYS_ON_TOP_MIN
                        var aotElements = allElements
                            .Where(e => e.AlwaysOnTop && e.Id != elementId)
                            .OrderBy(e => e.ZIndex)
                            .ToList();
                        int counter = ALWAYS_ON_TOP_MIN;
                        foreach (var ae in aotElements)
                        {
                            var updated = ae;
                            updated.ZIndex = counter++;
                            ctx.Db.Elements.Id.Update(updated);
                        }
                        newZIndex = counter;
                    }
                    else
                    {
                        newZIndex = aotMax + 1;
                    }
                }

                updatedElement.ZIndex = newZIndex;
            }
            else
            {
                // Return element to the normal range, placing it above all current normal elements
                var zIndexTable = ctx.Db.ZIndex.Version.Find(0)!.Value;
                int newZIndex = zIndexTable.Max + 1;
                updatedElement.ZIndex = newZIndex;
                zIndexTable.Max = newZIndex;
                ctx.Db.ZIndex.Version.Update(zIndexTable);
            }

            updatedElement.LastEditedBy = guest.Nickname;
            ctx.Db.Elements.Id.Update(updatedElement);

            LogAudit(ctx, func, GetChangeStructFromElement(oldElement.Value), GetChangeStructFromElement(updatedElement), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error updating AlwaysOnTop for element with id {elementId}, requested by {ctx.Sender}! " + e.Message);
        }
    }

    [Reducer]
    public static void DeleteElement(ReducerContext ctx, uint elementId)
    {
        string func = "DeleteElement";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx)) return;
        }
        
        try
        {
            var oldElement = ctx.Db.Elements.Id.Find(elementId);

            if (oldElement.HasValue)
            {
                ctx.Db.Elements.Id.Delete(oldElement.Value.Id);
            
                LogAudit(ctx,func,GetChangeStructFromElement(oldElement.Value),GetEmptyStruct(), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Error deleting element with id {elementId}, requested by {ctx.Sender}! Couldn't find existing Element!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error deleting element with id {elementId}, requested by {ctx.Sender}! " + e.Message);
        }
    }

    [Reducer]
    public static void DeleteAllElements(ReducerContext ctx)
    {
        string func = "DeleteAllElements";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx)) return;
        }
        
        try
        {
            foreach (var e in ctx.Db.Elements.Iter())
            {
                ctx.Db.Elements.Id.Delete(e.Id);
                LogAudit(ctx,func,GetChangeStructFromElement(e),GetEmptyStruct(), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error deleting all elements, requested by {ctx.Sender}! " + e.Message);
        }
    }
}