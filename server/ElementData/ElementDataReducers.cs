using SpacetimeDB;

public partial class Module
{
    [Reducer]
    public static void AddElementData(ReducerContext ctx, string name, DataType type, string data, int width, int height)
    {
        const string func = "AddElementData";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx)) return;
        }
        
        try
        {
            uint maxId = 0;
            foreach (var i in ctx.Db.ElementData.Iter())
            {
                if (i.Id > maxId) maxId = i.Id;
            }
            
            var elementData = new ElementData
            {
                Id = maxId + 1,
                Name = name,
                DataType = type,
                Data = data,
                DataWidth = width,
                DataHeight = height,
                CreatedBy = guest.Nickname
            };
            ctx.Db.ElementData.Insert(elementData);
            
            LogAudit(ctx,func,GetEmptyStruct(),GetChangeStructFromElementData(elementData), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error adding element data with name {name}, requested by {ctx.Sender}. " + e.Message);
        }
    }
    
    [Reducer]
    public static void AddElementDataWithId(ReducerContext ctx, uint id, string name, DataType type, string data, int width, int height)
    {
        string func = "AddElementDataWithId";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx)) return;
        }
        
        try
        {
            var elementData = new ElementData
            {
                Id = id,
                Name = name,
                DataType = type,
                Data = data,
                DataWidth = width,
                DataHeight = height,
                CreatedBy = guest.Nickname
            };
            ctx.Db.ElementData.Insert(elementData);
            
            LogAudit(ctx,func,GetEmptyStruct(),GetChangeStructFromElementData(elementData), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error adding element data with name {name}, requested by {ctx.Sender}. " + e.Message);
        }
    }
    
    [Reducer]
    public static void AddElementDataArray(ReducerContext ctx, string name, DataType type, string data, byte[] array, int width, int height)
    {
        string func = "AddElementDataArray";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx)) return;
        }
        
        try
        {
            uint maxId = 0;
            foreach (var i in ctx.Db.ElementData.Iter())
            {
                if (i.Id > maxId) maxId = i.Id;
            }
            
            var elementData = new ElementData
            {
                Id = maxId + 1,
                Name = name,
                DataType = type,
                Data = data,
                ByteArray = array,
                DataWidth = width,
                DataHeight = height,
                CreatedBy = guest.Nickname
            };
            ctx.Db.ElementData.Insert(elementData);
            
            LogAudit(ctx,func,GetEmptyStruct(),GetChangeStructFromElementData(elementData), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error adding element data with name {name}, requested by {ctx.Sender}. " + e.Message);
        }
    }
    
    [Reducer]
    public static void AddElementDataArrayWithId(ReducerContext ctx, uint id, string name, DataType type, string data, byte[] array, int width, int height)
    {
        string func = "AddElementDataArrayWithId";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx)) return;
        }
        
        try
        {
            var elementData = new ElementData
            {
                Id = id,
                Name = name,
                DataType = type,
                Data = data,
                ByteArray = array,
                DataWidth = width,
                DataHeight = height,
                CreatedBy = guest.Nickname
            };
            ctx.Db.ElementData.Insert(elementData);
            
            LogAudit(ctx,func,GetEmptyStruct(),GetChangeStructFromElementData(elementData), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error adding element data with name {name}, requested by {ctx.Sender}. " + e.Message);
        }
    }
    
    [Reducer]
    public static void ImportElementData(ReducerContext ctx, uint id, string name, DataType type, string data, int width, int height, string createdBy)
    {
        string func = "ImportElementDataArrayWithId";
        
        if (ctx.Db.Config.Version.Find(0)!.Value.ConfigInit) return;
        
        try
        {
            var elementData = new ElementData
            {
                Id = id,
                Name = name,
                DataType = type,
                Data = data,
                ByteArray = null,
                DataWidth = width,
                DataHeight = height,
                CreatedBy = createdBy
            };
            ctx.Db.ElementData.Insert(elementData);
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error adding element data with name {name}, requested by {ctx.Sender}. " + e.Message);
        }
    }

    [Reducer]
    public static void UpdateElementData(ReducerContext ctx, uint dataId, string name, string data, int width, int height)
    {
        string func = "UpdateElementData";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx)) return;
        }
        
        try
        {
            var oldData = ctx.Db.ElementData.Id.Find(dataId);

            if (oldData.HasValue)
            {
                var updatedData = oldData.Value;
                updatedData.Name = name;
                updatedData.Data = data;
                updatedData.DataWidth = width;
                updatedData.DataHeight = height;

                ctx.Db.ElementData.Id.Update(updatedData);
            
                LogAudit(ctx,func,GetChangeStructFromElementData(oldData.Value),GetChangeStructFromElementData(updatedData), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Error updating element data with id {dataId}, requested by {ctx.Sender}. Couldn't find existing ElementData!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error updating element data with id {dataId}, requested by {ctx.Sender}. " + e.Message);
        }
    }

    [Reducer]
    public static void UpdateElementDataSize(ReducerContext ctx, uint dataId, int width, int height)
    {
        string func = "UpdateElementDataSize";

        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;

        try
        {
            var oldData = ctx.Db.ElementData.Id.Find(dataId);

            if (oldData.HasValue)
            {
                var updatedData = oldData.Value;
                updatedData.DataWidth = width;
                updatedData.DataHeight = height;

                ctx.Db.ElementData.Id.Update(updatedData);
            
                LogAudit(ctx, func, GetChangeStructFromElementData(oldData.Value), GetChangeStructFromElementData(updatedData), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Error updating element data size with id {dataId}, requested by {ctx.Sender}. Couldn't find existing ElementData!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error updating element data size with id {dataId}, requested by {ctx.Sender}. " + e.Message);
        }
    }
    
    [Reducer]
    public static void UpdateElementDataName(ReducerContext ctx, uint dataId, string name)
    {
        string func = "UpdateElementDataName";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        
        try
        {
            var oldData = ctx.Db.ElementData.Id.Find(dataId);

            if (oldData.HasValue)
            {
                var updatedData = oldData.Value;
                updatedData.Name = name;

                ctx.Db.ElementData.Id.Update(updatedData);
            
                LogAudit(ctx,func,GetChangeStructFromElementData(oldData.Value),GetChangeStructFromElementData(updatedData), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Error updating element data name with id {dataId}, requested by {ctx.Sender}. Couldn't find existing ElementData!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error updating element data name with id {dataId}, requested by {ctx.Sender}. " + e.Message);
        }
    }
    
    [Reducer]
    public static void UpdateElementDataData(ReducerContext ctx, uint dataId, string data)
    {
        string func = "UpdateElementDataData";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx)) return;
        }
        
        try
        {
            var oldData = ctx.Db.ElementData.Id.Find(dataId);

            if (oldData.HasValue)
            {
                var updatedData = oldData.Value;
                updatedData.Data = data;

                ctx.Db.ElementData.Id.Update(updatedData);
            
                LogAudit(ctx,func,GetChangeStructFromElementData(oldData.Value),GetChangeStructFromElementData(updatedData), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Error updating element data name with id {dataId}, requested by {ctx.Sender}. Couldn't find existing ElementData!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error updating element data name with id {dataId}, requested by {ctx.Sender}. " + e.Message);
        }
    }

    [Reducer]
    public static void DeleteElementDataById(ReducerContext ctx, uint id)
    {
        string func = "DeleteElementDataById";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx)) return;
        }
        
        try
        {
            var oldData = ctx.Db.ElementData.Id.Find(id);

            if (oldData.HasValue)
            {
                foreach (var e in ctx.Db.Elements.Iter())
                {
                    switch (e.Element)
                    {
                        case ElementStruct.ImageElement imageElement:
                            if(imageElement.ImageElement_.ImageElementData is ImageElementData.ElementDataId imageElementData)
                                if (imageElementData.ElementDataId_ == id)
                                    ctx.Db.Elements.Id.Delete(e.Id);
                            break;
                        case ElementStruct.WidgetElement widgetElement:
                            if (widgetElement.WidgetElement_.ElementDataId == id)
                                ctx.Db.Elements.Id.Delete(e.Id);
                            break;
                    }
                }

                ctx.Db.ElementData.Id.Delete(oldData.Value.Id);
            
                LogAudit(ctx,func,GetChangeStructFromElementData(oldData.Value),GetEmptyStruct(), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
            else
            {
                Log.Error($"[{func}] Error deleting element data by id {id}, requested by {ctx.Sender}. Couldn't find existing ElementData!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error deleting element data by id {id}, requested by {ctx.Sender} " + e.Message);
        }
    }
    
    [Reducer]
    public static void DeleteElementDataByName(ReducerContext ctx, string name)
    {
        string func = "DeleteElementDataByName";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx)) return;
        }
        
        try
        {
            var oldData = ctx.Db.ElementData.Name.Filter(name).First();
            
            foreach (var e in ctx.Db.Elements.Iter())
            {
                switch (e.Element)
                {
                    case ElementStruct.ImageElement imageElement:
                        if(imageElement.ImageElement_.ImageElementData is ImageElementData.ElementDataId imageElementData)
                            if (imageElementData.ElementDataId_ == oldData.Id)
                                ctx.Db.Elements.Id.Delete(imageElementData.ElementDataId_);
                        break;
                    case ElementStruct.WidgetElement widgetElement:
                        if (widgetElement.WidgetElement_.ElementDataId == oldData.Id)
                            ctx.Db.Elements.Id.Delete(widgetElement.WidgetElement_.ElementDataId);
                        break;
                }
            }

            ctx.Db.ElementData.Id.Delete(oldData.Id);
                
            LogAudit(ctx,func,GetChangeStructFromElementData(oldData),GetEmptyStruct(), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error deleting element data by name {name}, requested by {ctx.Sender}. " + e.Message);
        }
    }

    [Reducer]
    public static void DeleteAllElementData(ReducerContext ctx)
    {
        string func = "DeleteAllElementData";
        
        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx)) return;
        }
        
        try
        {
            foreach (var data in ctx.Db.ElementData.Iter())
            {
                foreach (var e in ctx.Db.Elements.Iter())
                {
                    switch (e.Element)
                    {
                        case ElementStruct.ImageElement imageElement:
                            if(imageElement.ImageElement_.ImageElementData is ImageElementData.ElementDataId imageElementData)
                                if (imageElementData.ElementDataId_ == data.Id)
                                    ctx.Db.Elements.Id.Delete(imageElementData.ElementDataId_);
                            break;
                        case ElementStruct.WidgetElement widgetElement:
                            if (widgetElement.WidgetElement_.ElementDataId == data.Id)
                                ctx.Db.Elements.Id.Delete(widgetElement.WidgetElement_.ElementDataId);
                            break;
                    }
                }
                
                ctx.Db.ElementData.Id.Delete(data.Id);
                
                LogAudit(ctx,func,GetChangeStructFromElementData(data),GetEmptyStruct(), ctx.Db.Config.Version.Find(0)!.Value.DebugMode);
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error deleting all element data, requested by {ctx.Sender} " + e.Message);
        }
    }
}