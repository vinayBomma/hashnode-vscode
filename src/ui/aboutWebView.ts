import { Webview, Uri } from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";

export function aboutWebView(webview: Webview, extensionUri: Uri) {
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
      <header><h1 id="header-title">Hashnode on VSCode</h1></header>  
        <section>
            <div>
                <p id="blog-content">Hashnode on VSCode is an extension that integrates the popular blogging platform Hashnode with Visual Studio Code, allowing you to seamlessly manage your Hashnode blog directly from within your favorite code editor.
                </p>
            </div>
            <div>
              <h2>Features</h2>
                <ul id="blog-content">
                  <li>Fetch Blog Posts: View a list of your blog posts directly in VSCode.</li>
                  <li>Create New Posts: Write and publish new blog posts without leaving your editor.</li>
                  <li>Edit or Delete Existing Posts: Make edits or delete your existing blog posts conveniently.</li>
                  <li>Support for Markdown: Use Markdown syntax to format your blog posts.</li>
                  <li>Preview Blog Posts: Preview your blog posts right in VSCode without leaving your editor.</li>
                  <li>Add Tags: Add tags to your blog posts.</li>
                </ul>
            </div>
            <div>
              <h2>Usage</h2>
            </div>
            <div>
              <h2>Requirements</h2>
                <ul id="blog-content">
                  <li>Visual Studio Code version 1.85.0 or newer</li>
                  <li><a href="https://hashnode.com/settings/developer" target="_blank">Hashnode Personal Access Token</a></li>
                </ul>
            </div>
            <div>
              <h2>Contributing</h2>
                <div id="blog-content">
                  <p>Contributions are welcome! Feel free to open an issue or submit a pull request on the <a href="https://github.com/vinayBomma/hashnode-vscode" target="_blank">GitHub repository</a> for this extension.</p>
                  <p>Additionally, you can reach out to me on my <a href="mailto:vbomma.it@gmail.com" target="_blank">email</a></p>
                </div>
            </div>
        </section>
        <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
      </body>
    </html>
  `;
}
