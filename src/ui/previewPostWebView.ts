import { Webview, Uri } from "vscode";
import { NewPost } from "../types/Blog";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";

export function previewPostWebView(
  webview: Webview,
  extensionUri: Uri,
  data: NewPost
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
      </head>
      <body>
      <header><h2>${data?.title}</h2></header>
        <section>
          <div>${data?.content}</div>
          <vscode-tag>${data?.tags}</vscode-tag>
        </section>
        <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
      </body>
    </html>
  `;
}
