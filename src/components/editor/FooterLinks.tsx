import { Bug, Certificate, DiscordLogo, GithubLogo, SignOut } from "@phosphor-icons/react";
import React from "react";
import { Button } from "../inputs/Button";

export const FooterLinks: React.FC = () => {
  return (
    <div className="ml-4 mb-3 inline-block self-end" style={{ color: "#7e828c" }}>
      <div className="flex space-x-2">
        <Button icon={<Certificate size={30} />} border={true} tooltip="Changelog" onclick={() => {}} />
        <Button icon={<Bug size={30} />} border={true} tooltip="Report a bug" onclick={() => {}} />
        <Button icon={<GithubLogo size={30} />} border={true} tooltip="Pogly repository" onclick={() => {}} />
        <Button icon={<DiscordLogo size={30} />} border={true} tooltip="Pogly Discord" onclick={() => {}} />
        <Button icon={<SignOut size={30} />} border={true} tooltip="Sign out" onclick={() => {}} />
      </div>

      <span className="text-xs text-gray-500">ver 1.0.0</span>
    </div>
  );
};
