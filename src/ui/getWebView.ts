import { Webview, Uri } from "vscode";
import { Post } from "../types/Blog";
import { getUri } from "../utilities/getUri";

export function getWebviewContent(
  webview: Webview,
  extensionUri: Uri,
  post: Post
) {
  const styleUri = getUri(webview, extensionUri, ["dist", "style.css"]);

  return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="${styleUri}">
          <title>${post.title}</title>
      </head>
      <body id="webview-body">
        <header>
          <h1>${post.title}</h1>
        </header>
        <div>${
          post?.coverImage?.url ? `<img src="${post.coverImage.url}" />` : ""
        }</div>
        <section>
        <div id="blog-info">
        <p>Views: ${post?.views}</p>
        <p id="read-time">Read Time: ${post?.readTimeInMinutes} mins</p> 
        </div>
        <div id="divider">
        <vscode-divider role="presentation"></vscode-divider>
        </div>
        <div id="blog-content">${post?.content?.html}</div>
        </section>
      </body>
    </html>
  `;
}
