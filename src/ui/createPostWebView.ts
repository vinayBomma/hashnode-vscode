import { Webview, Uri } from "vscode";
import { NewPost } from "../types/Blog";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";

export function createPostWebView(
  webview: Webview,
  extensionUri: Uri,
  blog: NewPost
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
      <body id="webview-body">
      <header><h2>Create New Post</h2></header>
        <section id="notes-form">
          <vscode-text-field id="title" value="" placeholder="Enter Blog Title">Title</vscode-text-field>
          <vscode-text-area id="content"value="${blog.content}" placeholder="Enter content in MarkDown" resize="vertical" rows=15>Content</vscode-text-area>
          <vscode-text-field id="tags" placeholder="Enter tags separated by comma">Tags</vscode-text-field>
          <vscode-button id="preview-blog">Preview</vscode-button>
          <vscode-button id="submit-button">Publish</vscode-button>
        </section>
        <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
      </body>
    </html>
  `;
}
