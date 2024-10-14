using SpacetimeDB;
using static SpacetimeDB.Runtime;

public partial class Module
{
    [SpacetimeDB.Reducer]
    public static void AddFolder(ReducerContext ctx, string name, string icon)
    {
        string func = "AddFolder";

        if (ctx.Address is null) return;

        try
        {
            if (!GetGuest(func, ctx.Address, out var guest))
                return;
            if (!GuestAuthenticated(func, guest)) return;
            if (Config.FindByVersion(0)!.Value.StrictMode)
            {
                if (!IsGuestModerator(func, ctx.Sender)) return;
            }

            uint maxId = 0;
            foreach (var i in Folders.Iter())
            {
                if (i.Id > maxId) maxId = i.Id;
            }
            
            var newFolder = new Folders
            {
                Id = maxId + 1,
                Icon = icon,
                Name = name,
                CreatedBy = guest.Nickname
            };
            newFolder.Insert();
            
            //TODO: Add AutitLog() ChangeStruct types and methods for Folders
            if(Config.FindByVersion(0)!.Value.DebugMode) 
                Log($"[Folders - {func}] {guest.Nickname} added folder {name}!");
        }
        catch (Exception e)
        {
            Log($"[{func}] Error adding new Folder, requested by {ctx.Sender}! " + e.Message, LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void UpdateFolderName(ReducerContext ctx, uint folderId, string name)
    {
        string func = "UpdateFolderName";

        if (ctx.Address is null) return;

        try
        {
            if (!GetGuest(func, ctx.Address, out var guest))
                return;
            if (!GuestAuthenticated(func, guest)) return;
            if (Config.FindByVersion(0)!.Value.StrictMode)
            {
                if (!IsGuestModerator(func, ctx.Sender)) return;
            }

            var oldFolder = Folders.FilterById(folderId).First();
            var newFolder = oldFolder;
            newFolder.Name = name;
            Folders.UpdateById(folderId, newFolder);
            
            //TODO: Add AutitLog() ChangeStruct types and methods for Layouts
            if(Config.FindByVersion(0)!.Value.DebugMode) 
                Log($"[Folders - {func}] {guest.Nickname} updated folderId {folderId} name to {name}!");
        }
        catch (Exception e)
        {
            Log($"[{func}] Error updating folderId {folderId} name, with name {name}, requested by {ctx.Sender}! " + e.Message, LogLevel.Error);
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void UpdateFolderIcon(ReducerContext ctx, uint folderId, string icon)
    {
        string func = "UpdateFolderIcon";

        if (ctx.Address is null) return;

        try
        {
            if (!GetGuest(func, ctx.Address, out var guest))
                return;
            if (!GuestAuthenticated(func, guest)) return;
            if (Config.FindByVersion(0)!.Value.StrictMode)
            {
                if (!IsGuestModerator(func, ctx.Sender)) return;
            }

            var oldFolder = Folders.FilterById(folderId).First();
            var newFolder = oldFolder;
            newFolder.Icon = icon;
            Folders.UpdateById(folderId, newFolder);
            
            //TODO: Add AutitLog() ChangeStruct types and methods for Layouts
            if(Config.FindByVersion(0)!.Value.DebugMode) 
                Log($"[Folders - {func}] {guest.Nickname} updated folderId {folderId} icon to {icon}!");
        }
        catch (Exception e)
        {
            Log($"[{func}] Error updating folderId {folderId} icon, with icon {icon}, requested by {ctx.Sender}! " + e.Message, LogLevel.Error);
        }
    }

    [SpacetimeDB.Reducer]
    public static void DeleteFolder(ReducerContext ctx, uint folderId, bool preserveElements = true)
    {
        string func = "DeleteFolder";

        if (ctx.Address is null) return;

        try
        {
            if (!GetGuest(func, ctx.Address, out var guest))
                return;
            if (!GuestAuthenticated(func, guest)) return;
            if (Config.FindByVersion(0)!.Value.StrictMode)
            {
                if (!IsGuestModerator(func, ctx.Sender)) return;
            }

            foreach (var e in Elements.Query(x => x.FolderId == folderId))
            {
                if (preserveElements)
                {
                    var newE = e;
                    newE.FolderId = null;
                    Elements.UpdateById(e.Id, newE);
                }
                else
                {
                    Elements.DeleteById(e.Id);
                }
            }

            Folders.DeleteById(folderId);
            
            //TODO: Add AutitLog() ChangeStruct types and methods for Layouts
            if(Config.FindByVersion(0)!.Value.DebugMode) 
                Log($"[Folders - {func}] {guest.Nickname} deleted folderId {folderId}!");
        }
        catch (Exception e)
        {
            Log($"[{func}] Error deleting folderId {folderId}, requested by {ctx.Sender}! " + e.Message, LogLevel.Error);
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void DeleteAllFolders(ReducerContext ctx, bool preserveElements = true)
    {
        string func = "DeleteAllFolders";

        if (ctx.Address is null) return;

        try
        {
            if (!GetGuest(func, ctx.Address, out var guest))
                return;
            if (!GuestAuthenticated(func, guest)) return;
            if (Config.FindByVersion(0)!.Value.StrictMode)
            {
                if (!IsGuestModerator(func, ctx.Sender)) return;
            }

            foreach (var e in Elements.Iter())
            {
                if (preserveElements)
                {
                    var newE = e;
                    newE.FolderId = null;
                    Elements.UpdateById(e.Id, newE);
                }
                else
                {
                    Elements.DeleteById(e.Id);
                }
            }

            foreach (var folder in Folders.Iter())
            {
                Folders.DeleteById(folder.Id);
            }   
            
            //TODO: Add AutitLog() ChangeStruct types and methods for Layouts
            if(Config.FindByVersion(0)!.Value.DebugMode) 
                Log($"[Folders - {func}] {guest.Nickname} deleted all folders!");
        }
        catch (Exception e)
        {
            Log($"[{func}] Error deleting all folders, requested by {ctx.Sender}! " + e.Message, LogLevel.Error);
        }
    }
}