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

export const MarkdownEditor = ({ text, setText, style }: IProps) => {
  const mdParser = new MarkdownIt({
    typographer: false,
  });

  useEffect(() => {
    // Disabling unsupported buttons
    const imageButton = document.getElementsByClassName("rmel-icon-image");
    if (imageButton[0]) imageButton[0].parentElement?.remove();

    const unbderlineButton = document.getElementsByClassName("rmel-icon-underline");
    if (unbderlineButton[0]) unbderlineButton[0].parentElement?.remove();

    const quoteButton = document.getElementsByClassName("rmel-icon-quote");
    if (quoteButton[0]) quoteButton[0].parentElement?.remove();

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
    setText(text);
  };

  return (
    <EditorContainer style={style}>
      <StyledMdEditor
        renderHTML={(text: any) => mdParser.render(text)}
        onChange={handleTextChange}
        view={{ menu: true, md: true, html: false }}
        canView={{ menu: true, md: true, html: false, fullScreen: false, hideMenu: false, both: false }}
        defaultValue={text}
      />
    </EditorContainer>
  );
};

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 16px 16px 16px;

  height: 90%;
`;

const StyledMdEditor = styled(MdEditor)`
  border: none;
  background: transparent;
  font-size: 14px;

  height: 100% !important;

  .rc-md-navigation {
    background-color: #10121a65;
    border: 1px solid #14151b;
    padding: 0 8px;
    height: 32px;
    line-height: 32px;
  }

  .rc-md-navigation .button {
    display: inline-block;
    height: 32px;
    line-height: 32px;
    padding: 0 8px;
    margin: 0;
    vertical-align: middle;

    color: #e5e7eb !important;
    border-radius: 8px;
    border: 1px solid transparent;
    background: transparent;
    font-size: 12px;
  }

  .drop-wrap {
    background-color: #111827 !important;
    border-color: #1f2933 !important;
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.6);
    border-radius: 8px;
  }

  .rc-md-navigation .button:hover {
    border-radius: 4px;

    background-color: #82a5ff4d;
    border: solid 1px #82a5ff;
  }

  .section-container {
    background-color: #10121a !important;
    color: #e5e7eb !important;
    border: none !important;
    padding: 10px;
    overflow: auto !important;
  }

  .section {
    border: none !important;
  }
`;
