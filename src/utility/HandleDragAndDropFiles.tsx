import { toast } from "react-toastify";
import { ImageUploadModal } from "../Components/Modals/ImageUploadModal";
import { DebugLogger } from "./DebugLogger";

export const HandleDragAndDropFiles = (acceptedFiles: any, setModals: Function) => {
  DebugLogger("Handling drag and drop files");
  const isImage =
    acceptedFiles[0].type === "image/png" ||
    acceptedFiles[0].type === "image/jpg" ||
    acceptedFiles[0].type === "image/jpeg" ||
    acceptedFiles[0].type === "image/webp" ||
    acceptedFiles[0].type === "image/gif";

  if (!isImage) {
    DebugLogger("Drag and drop file is not an image");
    return toast.error("Dragged file is not an image.", {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  }

  setModals((oldModals: any) => [
    ...oldModals,
    <ImageUploadModal key="imageUpload_modal" dragnAndDropFile={acceptedFiles[0]} />,
  ]);
};
