import { Webview, Uri } from "vscode";
import { Note, Post } from "../types/Blog";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";

export function getWebviewContent(
  webview: Webview,
  extensionUri: Uri,
  note: Post
) {
  const webviewUri = getUri(webview, extensionUri, ["dist", "webview.js"]);
  const styleUri = getUri(webview, extensionUri, ["dist", "style.css"]);
  console.log(note, "heh");

  const nonce = getNonce();
  //   const formattedTags = note.tags ? note.tags.join(", ") : null;

  webview.onDidReceiveMessage((message) => {
    const command = message.command;
    switch (command) {
      case "requestNoteData":
        webview.postMessage({
          command: "receiveDataInWebview",
          payload: JSON.stringify(note),
        });
        break;
    }
  });

  return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" href="${styleUri}">
          <title>${note.title}</title>
      </head>
      <body id="webview-body">
        <header>
          <h1>${note.title}</h1>
          <div id="tags-container"></div>
        </header>
        <section id="notes-form">
          <!-- <vscode-text-field id="title" value="${note.title}" placeholder="Enter a name">Title</vscode-text-field> !-->
          <div id="content">${note?.content?.html}</div>
          <!--<vscode-button id="submit-button">Save</vscode-button> !-->
        </section>
        <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
      </body>
    </html>
  `;
}
