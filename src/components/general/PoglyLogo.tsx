export const PoglyLogo: React.FC = () => {
  return (
    <div
      className="flex space-x-2 ml-5 mt-5 mb-1 font-geist-mono justify-center items-end"
      style={{ marginTop: "6vh" }}
    >
      <span className="font-semibold text-5xl">
        Pogly <span style={{ color: "#82a5ff" }}>Standalone</span>
      </span>

      <span
        className="text-xs font-semibold py-0.2 px-1.5 rounded-md"
        style={{ backgroundColor: "#82a5ff", color: "#10121a", marginBottom: "3px" }}
      >
        v{import.meta.env.VITE_APP_VERSION}
      </span>
    </div>
  );
};
