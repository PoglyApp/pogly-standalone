import { Bug, Certificate, DiscordLogo, GithubLogo, SignOut } from "@phosphor-icons/react";
import React from "react";

export const FooterLinks: React.FC = () => {
  return (
    <div className="ml-4 mb-3 inline-block self-end" style={{ color: "#7e828c" }}>
      <div className="flex space-x-3">
        <button className="text-2xl">
          <Certificate size={30} />
        </button>

        <button className="text-2xl">
          <Bug size={30} />
        </button>

        <button className="text-2xl">
          <GithubLogo size={30} />
        </button>

        <button className="text-2xl">
          <DiscordLogo size={30} />
        </button>

        <button className="text-2xl">
          <SignOut size={30} />
        </button>
      </div>

      <span className="text-xs text-gray-500">ver 1.0.0</span>
    </div>
  );
};
