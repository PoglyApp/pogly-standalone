using SpacetimeDB;

public partial class Module
{
    [Type]
    public enum StreamingPlatform
    {
        Twitch,
        Youtube,
        Kick,
        Unhandled,
    }
    public enum PermissionTypes : uint
    {
        None = 0,
        Whitelisted = 1,
        SendMessage = 2, 
        UpdateConfig = 3,
        UpdateAuthenticationKey = 4,
        UpdateEditorGuidelines = 5,
        AddElementData = 6,
        UpdateElementData = 7,
        DeleteElementData = 8,
        AddElement = 9,
        UpdateElement = 10,
        DeleteElement = 11,
        AddFolder = 12,
        UpdateFolder = 13,
        DeleteFolder = 14,
        KickGuest = 15,
        AddLayout = 16,
        UpdateLayout = 17,
        SetLayoutActive = 18,
        DeleteLayout = 19,
        IssueOverlayCommand = 20,
        ModifyPermissions = 21,
        ModifyWhitelist = 22,
        Editor = 9997,
        Moderator = 9998,
        Owner = 9999,
    }

    public static uint[] DefaultPermissionSet = [1, 2, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19];
}