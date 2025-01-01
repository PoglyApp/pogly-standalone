import { Bug, Certificate, DiscordLogo, GithubLogo, SignOut } from "@phosphor-icons/react";
import React from "react";
import { Button } from "../inputs/Button";

export const FooterLinks: React.FC = () => {
  return (
    <div className="ml-4 mb-3 absolute enablePointerEvents" style={{ color: "#7e828c", bottom: "0" }}>
      <div className="flex space-x-2">
        <Button icon={<Certificate className="2xl:w-24 xl:w-18 lg:w-14 md:w-10 sm:w-6 h-auto" />} border={true} tooltip="Changelog" onclick={() => {}} />
        <Button icon={<Bug className="2xl:w-24 xl:w-18 lg:w-14 md:w-10 sm:w-6 h-auto" />} border={true} tooltip="Report a bug" onclick={() => {}} />
        <Button icon={<GithubLogo className="2xl:w-24 xl:w-18 lg:w-14 md:w-10 sm:w-6 h-auto" />} border={true} tooltip="Pogly repository" onclick={() => {}} />
        <Button icon={<DiscordLogo className="2xl:w-24 xl:w-18 lg:w-14 md:w-10 sm:w-6 h-auto" />} border={true} tooltip="Pogly Discord" onclick={() => {}} />
        <Button icon={<SignOut className="2xl:w-24 xl:w-18 lg:w-14 md:w-10 sm:w-6 h-auto" />} border={true} tooltip="Sign out" onclick={() => {}} />
      </div>

      <span className="2xl:text-lg xl:text-lg lg:text-base md:text-sm sm:text-xs text-gray-500">ver 1.0.0</span>
    </div>
  );
};
