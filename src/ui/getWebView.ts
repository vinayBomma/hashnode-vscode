import { Webview, Uri } from "vscode";
import { Post } from "../types/Blog";
import { getUri } from "../utilities/getUri";

export function getWebviewContent(
  webview: Webview,
  extensionUri: Uri,
  note: Post
) {
  const webviewUri = getUri(webview, extensionUri, ["dist", "webview.js"]);
  const styleUri = getUri(webview, extensionUri, ["dist", "style.css"]);

  return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="${styleUri}">
          <title>${note.title}</title>
      </head>
      <body id="webview-body">
        <header>
          <h1>${note.title}</h1>
        </header>
        <div><img src=${note.coverImage.url} /></div>
        <section >
          <div id="blog-content">${note?.content?.html}</div>
        </section>
      
      </body>
    </html>
  `;
}
