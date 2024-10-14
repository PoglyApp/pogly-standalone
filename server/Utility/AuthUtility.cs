using SpacetimeDB;
using static SpacetimeDB.Runtime;

public partial class Module
{
    // private static void StartAuthWorker()
    // {
    //     new AuthenticationWorker
    //     {
    //         ScheduledId = 0,
    //         ScheduledAt = TimeSpan.FromMilliseconds(100)
    //     }.Insert();
    // }
    //
    // private static void StopAuthWorker()
    // {
    //     foreach (var worker in AuthenticationWorker.Iter())
    //     {
    //         AuthenticationWorker.DeleteByScheduledId(worker.ScheduledId);
    //     }
    // }
    //
    // private static bool IsAuthWorking()
    // {
    //     return AuthenticationWorker.Iter().Count() > 0;
    // }
}