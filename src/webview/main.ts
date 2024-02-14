import {
  provideVSCodeDesignSystem,
  Button,
  Tag,
  TextArea,
  TextField,
  vsCodeButton,
  vsCodeTag,
  vsCodeTextArea,
  vsCodeTextField,
} from "@vscode/webview-ui-toolkit";

provideVSCodeDesignSystem().register(
  vsCodeButton(),
  vsCodeTag(),
  vsCodeTextArea(),
  vsCodeTextField()
);

const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

function main() {
  previewPost();
  savePost();
}

function previewPost() {
  const renderButton = document.getElementById("preview-blog") as Button;
  const markdownText = document.getElementById("content") as TextArea;
  renderButton.addEventListener("click", () => {
    vscode.postMessage({
      command: "preview-blog",
      data: markdownText?.value,
    });
  });
}

function savePost() {
  const submitButton = document.getElementById("submit-button") as Button;
  const content = document.getElementById("content") as TextArea;
  const title = document.getElementById("title") as TextField;
  const tags = document.getElementById("tags") as TextField;
  submitButton.addEventListener("click", () => {
    vscode.postMessage({
      command: "save-blog",
      data: {
        title: title?.value,
        content: content?.value,
        tags: tags?.value,
      },
    });
  });
}
