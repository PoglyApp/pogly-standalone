import { toast } from "react-toastify";
import { ImageUploadModal } from "../Components/Modals/ImageUploadModal";

export const HandleDragAndDropFiles = (acceptedFiles: any, setModals: Function, isCanvas: boolean) => {
  const isImage =
    acceptedFiles[0].type === "image/png" ||
    acceptedFiles[0].type === "image/jpg" ||
    acceptedFiles[0].type === "image/jpeg" ||
    acceptedFiles[0].type === "image/webp" ||
    acceptedFiles[0].type === "image/gif";

  if (!isImage) {
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

  if (!isCanvas) {
    return setModals((oldModals: any) => [
      ...oldModals,
      <ImageUploadModal key="imageUpload_modal" dragnAndDropFile={acceptedFiles[0]} />,
    ]);
  }

  console.log("dragging");
};
