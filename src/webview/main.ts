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
  const renderButton = document.getElementById("renderPost") as Button;
  renderButton.addEventListener("click", () => {
    vscode.postMessage({
      command: "renderMarkdown",
      data: "test",
    });
  });
}
