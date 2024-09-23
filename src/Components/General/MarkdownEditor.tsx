import styled from "styled-components";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import { useEffect } from "react";

interface IProps {
  text: string;
  setText: any;
  style?: any;
}

export const MarkdownEditor = (props: IProps) => {
  const mdParser = new MarkdownIt({
    typographer: false,
  });

  useEffect(() => {
    // Disabling unsupported buttons
    const imageButton = document.getElementsByClassName("rmel-icon-image");
    if (imageButton[0]) imageButton[0].parentElement?.remove();

    const linkButton = document.getElementsByClassName("rmel-icon-link");
    if (linkButton[0]) linkButton[0].parentElement?.remove();

    const codeButton = document.getElementsByClassName("rmel-icon-code");
    if (codeButton[0]) codeButton[0].parentElement?.remove();

    const codeBlockButton = document.getElementsByClassName("rmel-icon-code-block");
    if (codeBlockButton[0]) codeBlockButton[0].parentElement?.remove();

    const gridButton = document.getElementsByClassName("rmel-icon-grid");
    if (gridButton[0]) gridButton[0].parentElement?.remove();
  }, []);

  const handleTextChange = async ({ html, text }: any) => {
    props.setText(text);
  };

  return (
    <EditorContainer style={props.style}>
      <StyledMdEditor
        style={{ height: "300px" }}
        renderHTML={(text: any) => mdParser.render(text)}
        onChange={handleTextChange}
        view={{ menu: true, md: true, html: false }}
        canView={{ menu: true, md: true, html: false, fullScreen: false, hideMenu: false, both: false }}
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

  .header-list {
    background-color: #0a2a47 !important;

    :hover {
      background-color: #001529 !important;
    }
  }

  .drop-wrap {
    background-color: #0a2a47 !important;
    border-color: #06101a;
  }
`;
