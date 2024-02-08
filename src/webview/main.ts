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
  const renderButton = document.getElementById("renderMarkdown") as Button;
  const markdownText = document.getElementById("content") as TextArea;
  renderButton.addEventListener("click", () => {
    vscode.postMessage({
      command: "renderMarkdown",
      data: markdownText?.value,
    });
  });
}
