using SpacetimeDB;

public partial class Module
{
    [Reducer]
    public static void AddLayout(ReducerContext ctx, string name, bool active = false)
    {
        string func = "AddLayout";

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
            foreach (var i in ctx.Db.Layouts.Iter())
            {
                if (i.Id > maxId) maxId = i.Id;
            }

            var newLayout = new Layouts
            {
                Id = maxId + 1,
                Name = name,
                CreatedBy = guest.Nickname,
                Active = active
            };
            ctx.Db.Layouts.Insert(newLayout);
            
            //TODO: Add AuditLog() ChangeStruct types and methods for Layouts
            if(ctx.Db.Config.Version.Find(0)!.Value.DebugMode) 
                Log.Info($"[Layouts - {func}] {guest.Nickname} added layout {name}!");
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error adding new Layout, requested by {ctx.Sender}! " + e.Message);
        }
    }
    
    [Reducer]
    public static void AddLayoutWithId(ReducerContext ctx, uint id, string name, bool active = false)
    {
        string func = "AddLayoutWithId";

        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx)) return;
        }

        try
        {
            var newLayout = new Layouts
            {
                Id = id,
                Name = name,
                CreatedBy = guest.Nickname,
                Active = active
            };

            ctx.Db.Layouts.Insert(newLayout);
            
            //TODO: Add AuditLog() ChangeStruct types and methods for Layouts
            if(ctx.Db.Config.Version.Find(0)!.Value.DebugMode) 
                Log.Info($"[Layouts - {func}] {guest.Nickname} added layout {name}!");
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error adding new Layout, requested by {ctx.Sender}! " + e.Message);
        }
    }
    
    [Reducer]
    public static void DuplicateLayout(ReducerContext ctx, uint layoutId)
    {
        string func = "DuplicateLayout";

        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx)) return;
        }

        try
        {
            var layout = ctx.Db.Layouts.Id.Find(layoutId);

            if (layout.HasValue)
            {
                uint newLayoutId = 0;
                foreach (var i in ctx.Db.Layouts.Iter())
                {
                    if (i.Id > newLayoutId) newLayoutId = i.Id;
                }
            
                var newLayout = new Layouts
                {
                    Id = newLayoutId + 1,
                    Name = layout.Value.Name,
                    CreatedBy = guest.Nickname,
                    Active = false
                };

                ctx.Db.Layouts.Insert(newLayout);
            
                var elements = ctx.Db.Elements.Iter().Where(e => e.LayoutId == layoutId);
            
                uint maxElementId = 0;
                foreach (var i in ctx.Db.Elements.Iter())
                {
                    if (i.Id > maxElementId) maxElementId = i.Id;
                }

                uint newIndex = maxElementId + 1;

                foreach (Elements element in elements)
                {
                    var newElement = new Elements
                    {
                        Id = newIndex,
                        Element = element.Element,
                        Transparency = element.Transparency,
                        Transform = element.Transform,
                        Clip = element.Clip,
                        Locked = false,
                        LayoutId = newLayoutId + 1,
                        PlacedBy = guest.Nickname,
                        LastEditedBy = guest.Nickname,
                        ZIndex = element.ZIndex
                    };

                    ctx.Db.Elements.Insert(newElement);

                    newIndex++;
                }
            
                //TODO: Add AuditLog() ChangeStruct types and methods for Layouts
                if(ctx.Db.Config.Version.Find(0)!.Value.DebugMode) 
                    Log.Info($"[Layouts - {func}] {guest.Nickname} duplicated layout {layout.Value.Name}!");
            }
            else
            {
                Log.Error($"[{func}] Error duplicating Layout, requested by {ctx.Sender}! Couldn't find existing Layout!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error duplicating Layout, requested by {ctx.Sender}! " + e.Message);
        }
    }
    
    [Reducer]
    public static void ImportLayout(ReducerContext ctx, uint id, string name, string createdBy, bool active = false)
    {
        string func = "ImportLayout";

        if (ctx.Db.Config.Version.Find(0)!.Value.ConfigInit) return;

        try
        {
            var newLayout = new Layouts
            {
                Id = id,
                Name = name,
                CreatedBy = createdBy,
                Active = false
            };

            ctx.Db.Layouts.Insert(newLayout);
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error adding new Layout, requested by {ctx.Sender}! " + e.Message);
        }
    }

    [Reducer]
    public static void UpdateLayoutName(ReducerContext ctx, uint layoutId, string name)
    {
        string func = "UpdateLayoutName";

        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx)) return;
        }

        try
        {
            var oldLayout = ctx.Db.Layouts.Id.Find(layoutId);

            if (oldLayout.HasValue)
            {
                var newLayout = oldLayout.Value;
                newLayout.Name = name;
                ctx.Db.Layouts.Id.Update(newLayout);
            
                //TODO: Add AuditLog() ChangeStruct types and methods for Layouts
                if(ctx.Db.Config.Version.Find(0)!.Value.DebugMode) 
                    Log.Info($"[Layouts - {func}] {guest.Nickname} updated layoutId {layoutId} name to {name}!");
            }
            else
            {
                Log.Error($"[{func}] Error Updating layoutId {layoutId} name, with name {name}, requested by {ctx.Sender}! Couldn't find existing Layout!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error Updating layoutId {layoutId} name, with name {name}, requested by {ctx.Sender}! " + e.Message);
        }
    }

    [Reducer]
    public static void SetLayoutActive(ReducerContext ctx, uint layoutId)
    {
        string func = "SetLayoutActive";

        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx)) return;
        }
        
        try
        {
            foreach (var oldLayout in ctx.Db.Layouts.Iter())
            {
                var updatedLayout = oldLayout;
                updatedLayout.Active = oldLayout.Id == layoutId;
                ctx.Db.Layouts.Id.Update(updatedLayout);
            }
            
            //TODO: Add AuditLog() ChangeStruct types and methods for Layouts
            if(ctx.Db.Config.Version.Find(0)!.Value.DebugMode) 
                Log.Info($"[Layouts - {func}] {guest.Nickname} set layoutId {layoutId} active!");
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error setting active layoutId {layoutId}, requested by {ctx.Sender}! " + e.Message);
        }
    }

    [Reducer]
    public static void DeleteLayout(ReducerContext ctx, uint layoutId, bool preserveElements = false, uint preserveLayoutId = 1)
    {
        string func = "DeleteLayout";

        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx)) return;
        }
        
        try
        {
            if (layoutId == 1) return;

            var oldLayout = ctx.Db.Layouts.Id.Find(layoutId);

            if (oldLayout.HasValue)
            {
                if (oldLayout is {Name: "Default", CreatedBy: "Server"}) return;

                var activeLayout = GetActiveLayout(ctx);
            
                if(oldLayout.Value.Id == activeLayout) SetLayoutActive(ctx, 1);

                foreach (var e in ctx.Db.Elements.Iter().Where(x => x.LayoutId == layoutId))
                {
                    if (preserveElements)
                    {
                        var newE = e;
                        newE.LayoutId = preserveLayoutId;
                        ctx.Db.Elements.Id.Update(newE);
                    }
                    else
                    {
                        ctx.Db.Elements.Id.Delete(e.Id);
                    }
                }

                foreach (Guests g in ctx.Db.Guests.Iter().Where(x => x.SelectedLayoutId == layoutId))
                {
                    var newGuest = g;
                    newGuest.SelectedLayoutId = GetActiveLayout(ctx);
                    ctx.Db.Guests.Address.Update(newGuest);
                }

                ctx.Db.Layouts.Id.Delete(layoutId);
            
                //TODO: Add AuditLog() ChangeStruct types and methods for Layouts
                if(ctx.Db.Config.Version.Find(0)!.Value.DebugMode) 
                    Log.Info($"[Layouts - {func}] {guest.Nickname} deleted layoutId {layoutId}!");
            }
            else
            {
                Log.Error($"[{func}] Error deleting layoutId {layoutId}, requested by {ctx.Sender}! Couldn't find existing Layout!");
            }
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error deleting layoutId {layoutId}, requested by {ctx.Sender}! " + e.Message);
        }
    }
    
    [Reducer]
    public static void DeleteAllLayouts(ReducerContext ctx, bool preserveElements = false)
    {
        string func = "DeleteAllLayouts";

        if (ctx.ConnectionId is null) return;
        if (!GetGuest(func, ctx, out var guest)) return;
        if (!GuestAuthenticated(func, guest)) return;
        if (ctx.Db.Config.Version.Find(0)!.Value.StrictMode)
        {
            if (!IsGuestModerator(func, ctx)) return;
        }

        try
        {
            var activeLayout = GetActiveLayout(ctx);
            
            if(activeLayout != 1) SetLayoutActive(ctx, 1);

            foreach (var e in ctx.Db.Elements.Iter().Where(x => x.LayoutId != 1))
            {
                if (preserveElements)
                {
                    var newE = e;
                    newE.LayoutId = 1;
                    ctx.Db.Elements.Id.Update(newE);
                }
                else
                {
                    ctx.Db.Elements.Id.Delete(e.Id);
                }
            }

            foreach (var layout in ctx.Db.Layouts.Iter().Where(x => x.Id != 1))
            {
                if(layout is not {Name: "Default", CreatedBy: "Server"})
                    ctx.Db.Layouts.Id.Delete(layout.Id);
            }
            
            foreach (Guests g in ctx.Db.Guests.Iter())
            {
                var newGuest = g;
                newGuest.SelectedLayoutId = 1;
                ctx.Db.Guests.Address.Update(newGuest);
            }
            
            //TODO: Add AuditLog() ChangeStruct types and methods for Layouts
            if(ctx.Db.Config.Version.Find(0)!.Value.DebugMode) 
                Log.Info($"[Layouts - {func}] {guest.Nickname} deleted all layouts!");
        }
        catch (Exception e)
        {
            Log.Error($"[{func}] Error deleting all layouts, requested by {ctx.Sender}! " + e.Message);
        }
    }
}