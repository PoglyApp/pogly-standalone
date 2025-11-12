import { useState } from "react";
import { Select } from "../NewUiComponents/Select";
import { TextInput } from "../NewUiComponents/TextInput";
import { Checkbox } from "../NewUiComponents/Checkbox";

export const OwnerSettings = () => {
  const [authRequired, setAuthRequired] = useState<boolean>(false);
  const [strictMode, setStrictMode] = useState<boolean>(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3 max-md:grid">
        <div>
          <p className="text-sm text-[#aeb4d4]">platform</p>
          <Select onChange={() => {}} className="w-[160px] h-[48px]">
            <option value="twitch">twitch</option>
            <option value="kick">kick</option>
            <option value="youtube">youtube</option>
          </Select>
        </div>

        <div>
          <p className="text-sm text-[#aeb4d4]">channel name</p>
          <TextInput placeholder="name" inputClassName="h-[44px] w-[200px]!" onChange={() => {}} />
        </div>

        <div>
          <p className="text-sm text-[#aeb4d4]">refresh rate</p>
          <TextInput placeholder="120hz" inputClassName="h-[44px] w-[200px]!" onChange={() => {}} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Checkbox label="authentication required" checked={authRequired} onChange={setAuthRequired} />
        <Checkbox label="strict mode" checked={strictMode} onChange={setStrictMode} />

        <div className="mt-2">
          <p className="text-sm text-[#aeb4d4]">module password</p>
          <TextInput
            placeholder="password"
            inputClassName="h-[44px] w-[200px]!"
            disabled={!authRequired}
            password
            onChange={() => {}}
          />
        </div>
      </div>
    </div>
  );
};
