import { useState } from "react";

export const ChooseInstanceContainer = () => {
  const [connectionType, setConnectionType] = useState("cloud");

  return (
    <div className="w-screen h-screen text-center content-center">
      <div className="bg-gray-900 text-gray-300 p-6 rounded-lg shadow-lg w-96 font-mono inline-block">
        <h2 className="text-lg font-bold mb-4">Connect to Pogly Standalone Instance</h2>
        <div className="flex space-x-4 mb-4">
          <div>
            {["Cloud", "Local", "Custom"].map((type) => (
              <label key={type} className="flex items-center cursor-pointer space-x-2">
                <input
                  type="radio"
                  name="connectionType"
                  value={type.toLowerCase()}
                  checked={connectionType === type.toLowerCase()}
                  onChange={() => setConnectionType(type.toLowerCase())}
                  className="hidden"
                />
                <span
                  className={`w-4 h-4 border-2 rounded-full flex items-center justify-center transition-colors ${
                    connectionType === type.toLowerCase() ? "border-blue-500 bg-blue-500" : "border-gray-500"
                  }`}
                ></span>
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>
        <input
          type="text"
          placeholder="Module name"
          className="w-full p-2 mb-3 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-blue-500 text-white"
        />
        <input
          type="password"
          placeholder="Authentication key"
          className="w-full p-2 mb-3 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-blue-500 text-white"
        />
        <label className="flex items-center space-x-2 text-sm mb-4">
          <input type="checkbox" className="form-checkbox text-blue-500" />
          <span>Remember connection</span>
        </label>
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded transition-colors">
          CONNECT
        </button>
      </div>
    </div>
  );
};
