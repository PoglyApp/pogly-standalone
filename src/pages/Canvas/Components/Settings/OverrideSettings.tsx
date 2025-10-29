import { Select } from "@/Components/Inputs/Select";
import { TextInput } from "@/Components/Inputs/TextInput";

export const OverrideSettings = () => {
  return (
    <div>
      <p className="text-md  mb-2">7TV/BTTV emotes</p>
      <div className="flex gap-3 max-md:grid">
        <div>
          <p className="text-sm text-[#aeb4d4]">channel name</p>
          <TextInput placeholder="name" inputClassName="h-[44px] w-[200px]!" onChange={() => {}} />
        </div>
        <div>
          <p className="text-sm text-[#aeb4d4]">platform</p>
          <Select onChange={() => {}} className="w-[160px] h-[48px]">
            <option value="twitch">twitch</option>
            <option value="kick">kick</option>
            <option value="youtube">youtube</option>
          </Select>
        </div>
      </div>

      <p className="text-md  mb-2 mt-4">stream container</p>
      <div className="flex flex-col">
        <p className="text-sm text-[#aeb4d4]">direct stream url</p>
        <TextInput placeholder="url" inputClassName="h-[44px]" onChange={() => {}} />
      </div>
    </div>
  );
};
