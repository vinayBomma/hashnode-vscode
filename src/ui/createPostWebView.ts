import { Webview, Uri } from "vscode";
import { NewPost } from "../types/Blog";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";

export function createPostWebView(
  webview: Webview,
  extensionUri: Uri,
  blog: NewPost,
  isUpdate: boolean
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
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${
            webview.cspSource
          }; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" href="${styleUri}">
      </head>
      <body id="webview-body">
      <input type="hidden" id="blog-id" value="${blog.id}" />
      <header><h2 id="header-title">${
        isUpdate ? "Update Post" : "New Post"
      }</h2></header>
        <section id="notes-form">
          <vscode-text-field id="title" value="${
            isUpdate ? blog.title : ""
          }" placeholder="Enter title more than 6 characters">Title</vscode-text-field>
          <vscode-text-area id="content"value="${
            blog.content
          }" placeholder="Enter content in Markdown" resize="vertical" rows=25>Content</vscode-text-area>
          <vscode-text-field id="tags" placeholder="Enter tags separated by comma">Tags</vscode-text-field>
          <div id="buttons">
          <vscode-button id="preview-blog">Preview Post</vscode-button>
          <vscode-button id="submit-button">${
            isUpdate ? "Update Post" : "Publish Post"
          }</vscode-button>
          </div>
        </section>
        <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
      </body>
    </html>
  `;
}
