import { Webview, Uri } from "vscode";
import { Post } from "../types/Blog";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";

export function createPostWebView(
  webview: Webview,
  extensionUri: Uri,
  note: Post
) {
  const webviewUri = getUri(webview, extensionUri, ["dist", "webview.js"]);
  const styleUri = getUri(webview, extensionUri, ["dist", "style.css"]);

  const nonce = getNonce();

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
        </header>
        <section id="notes-form">
          <vscode-text-field id="title" value="${note.title}" placeholder="Enter a name">Title</vscode-text-field>
          <vscode-text-area id="content"value="${note.content.markdown}" placeholder="Enter content in MarkDown!" resize="vertical" rows=15></vscode-text-area>
          <vscode-button id="renderPost">Save</vscode-button>
        </section>
        <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
      </body>
    </html>
  `;
}
