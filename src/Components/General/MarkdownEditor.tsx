import styled from "styled-components";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import { useEffect } from "react";

interface IProps {
  text: string;
  setText: any;
}

export const MarkdownEditor = (props: IProps) => {
  const mdParser = new MarkdownIt();

  useEffect(() => {
    // This is here to make sure no one can sneak in an image
    const imageButton = document.getElementsByClassName("rmel-icon-image");
    if (imageButton[0]) imageButton[0].parentElement?.remove();

    const linkButton = document.getElementsByClassName("rmel-icon-link");
    if (linkButton[0]) linkButton[0].parentElement?.remove();
  }, []);

  const handleTextChange = async ({ html, text }: any) => {
    props.setText(text);
  };

  return (
    <EditorContainer>
      <StyledMdEditor
        style={{ height: "300px" }}
        renderHTML={(text: any) => mdParser.render(text)}
        onChange={handleTextChange}
        view={{ menu: true, md: true, html: false }}
        canView={{ menu: true, md: true, html: false, fullScreen: false, hideMenu: false, both: false }}
        onImageUpload={() => console.log("test")}
        defaultValue={props.text}
      />
    </EditorContainer>
  );
};

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #001529;
  padding: 5px;
`;

const StyledMdEditor = styled(MdEditor)`
  border: none;
  background: #0a2944;

  .rc-md-navigation {
    background-color: #001529;
    border: none;
  }

  .button {
    color: #ffffffa6 !important;
  }

  .section-container {
    background-color: #0a2944 !important;
    color: #ffffffa6 !important;
    border: none;
    background: #0a2944;
    overflow: auto !important;
  }

  .rc-md-editor {
    border: none !important;
    background: red !important;
  }

  .section {
    border: none !important;
  }
`;
