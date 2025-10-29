import { TextInput } from "@/Components/Inputs/TextInput";

export const APIKeysSettings = () => {
  return (
    <div className="flex flex-col">
      <div className="flex">
        <p className="text-sm text-[#aeb4d4]">tenor</p>
        <a
          href="https://developers.google.com/tenor/guides/quickstart#setup"
          target="_blank"
          rel="noreferrer"
          className="text-[10px] self-center ml-1 text-[#82a5ff]"
        >
          (get key)
        </a>
      </div>
      <TextInput placeholder="API Key" inputClassName="w-[300px]!" onChange={() => {}} />
    </div>
  );
};
