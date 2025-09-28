import { Container } from "@/Components/General/Container";
import { TextInput } from "@/Components/Inputs/TextInput";
import { ChevronLeft, ChevronRight, Trash } from "lucide-react";

export const Details = () => {
  return (
    <Container title="details" subTitle="kekw" className="absolute mr-10 right-0 top-[230px] w-[320px]">
      <div className="p-4 gap-4">
        <span className="mb-2 block">properties</span>
        <div className="flex gap-2 mb-2">
          <TextInput title="X" titleOnLeft placeholder="0" onChange={() => {}} />
          <TextInput title="Y" titleOnLeft placeholder="0" onChange={() => {}} />
        </div>

        <div className="flex gap-2 mb-2">
          <TextInput title="X" titleOnLeft placeholder="0" onChange={() => {}} />
          <TextInput title="Y" titleOnLeft placeholder="0" onChange={() => {}} />
        </div>

        <div className="flex content-center bg-[#10121A] w-full h-11 rounded-[4px]">
          <img
            src="https://i1.sndcdn.com/artworks-uIzReQNl52dZpffd-BZ3OxA-t500x500.jpg"
            className="w-[44px] h-[44px] p-2"
          />
          <span className="self-center">kekw</span>

          <div className="flex absolute items-center self-center right-0 mr-7 bg-[#1b1d23] rounded-[4px] w-fit h-[17px]">
            <button className="cursor-pointer">
              <ChevronLeft size={18} />
            </button>
            <span className="text-[10px]">100%</span>
            <button className="cursor-pointer">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid mt-4">
          <span className="text-[10px]">
            added by <span className="font-semibold">Dynny</span>
          </span>
          <span className="text-[10px]">
            last edited by <span className="font-semibold">Dynny</span>{" "}
            <span className="text-[#EDF1FF4D]"> • 10:37pm pst • 09/28/25</span>
          </span>
        </div>
      </div>
    </Container>
  );
};
