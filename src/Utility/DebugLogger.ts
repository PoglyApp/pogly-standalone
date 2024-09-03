export const DebugLogger = (log_string: string) => {
  const isLoggingOn = localStorage.getItem("debuglogger") ? JSON.parse(localStorage.getItem("debuglogger")!) : false;
  if (!isLoggingOn) return;

  console.log(log_string);
};
