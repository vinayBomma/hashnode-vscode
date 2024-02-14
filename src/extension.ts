// The module 'vscode' contains the VS Code extensibility API

// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getAuthUser } from "./api/queries";
import { BlogsDataProvider } from "./providers/BlogDataProvider";
import { NewPost, Post } from "./types/Blog";
import { readData, saveData } from "./utilities/globalState";
import { getWebviewContent } from "./ui/getWebView";
import ObjectID from "bson-objectid";
import { createPostWebView } from "./ui/createPostWebView";
import { marked } from "marked";
import { postBlog } from "./api/mutations";

export function activate(context: vscode.ExtensionContext) {
  let blogs: Post[] = [];
  let panel: vscode.WebviewPanel | undefined = undefined;

  const getWelcomeContent = async (token: any) => {
    if (token) {
      console.log("token: ", token);
      const response = await getAuthUser(context, token);
      if (response?.nodes) {
        vscode.commands.executeCommand(
          "setContext",
          "hashnode-on-vscode.getWelcomeContent",
          token
        );

        response?.nodes.forEach((node) => {
          const newBlog: Post = {
            id: node.id,
            title: node.title,
            content: {
              html: node.content.html,
              markdown: node.content.markdown,
            },
            coverImage: {
              url: node.coverImage.url,
            },
            publication: {
              id: node.publication.id,
            },
          };
          blogs.push(newBlog);
        });
      } else {
        vscode.commands.executeCommand(
          "setContext",
          "hashnode-on-vscode.getWelcomeContent",
          false
        );
      }
    } else {
      vscode.commands.executeCommand(
        "setContext",
        "hashnode-on-vscode.getWelcomeContent",
        false
      );
    }
  };

  const hashnodeToken = readData(context, "accessToken");
  getWelcomeContent(hashnodeToken);

  const blogDataProvider = new BlogsDataProvider(blogs);

  // Create a tree view to contain the list of notepad notes
  const treeView = vscode.window.createTreeView(
    "hashnode-on-vscode.blogsList",
    {
      treeDataProvider: blogDataProvider,
      showCollapseAll: false,
    }
  );

  const openBlog = vscode.commands.registerCommand(
    "hashnode-on-vscode.showPost",
    () => {
      const selectedTreeViewItem = treeView.selection[0];
      const matchingNote = blogs.find(
        (note) => note.id === selectedTreeViewItem.id
      );
      if (!matchingNote) {
        vscode.window.showErrorMessage("No matching post found");
        return;
      }

      // If no panel is open, create a new one and update the HTML
      if (!panel) {
        panel = vscode.window.createWebviewPanel(
          "blogView",
          matchingNote.title,
          vscode.ViewColumn.One,
          {
            enableScripts: true,
            localResourceRoots: [
              vscode.Uri.joinPath(context.extensionUri, "dist"),
            ],
          }
        );
      }

      // If a panel is open, update the HTML with the selected item's content
      panel.title = matchingNote.title;
      panel.webview.html = getWebviewContent(
        panel.webview,
        context.extensionUri,
        matchingNote
      );

      panel.onDidDispose(
        () => {
          panel = undefined;
        },
        null,
        context.subscriptions
      );
    }
  );

  const addToken = vscode.commands.registerCommand(
    "hashnode-on-vscode.addToken",
    async () => {
      const accessToken = await vscode.window.showInputBox({
        prompt: "Please Enter Hashnode Access Token",
        title: "Add Hashnode Access Token",
        validateInput: (token) => {
          if (!token) {
            return "Please enter an access token.";
          }

          if (token.length !== 36) {
            return "Access Token must be 36 characters long.";
          }

          return null;
        },
      });

      if (accessToken) {
        const response = await getAuthUser(context, accessToken);
        if (response?.nodes) {
          saveData(context, "accessToken", accessToken);
          vscode.window.showInformationMessage("Access Token stored securely!");

          vscode.commands.executeCommand(
            "setContext",
            "hashnode-on-vscode.getWelcomeContent",
            accessToken
          );

          response?.nodes.forEach((node) => {
            const newBlog: Post = {
              id: node.id,
              title: node.title,
              content: {
                html: node.content.html,
                markdown: node.content.markdown,
              },
              coverImage: {
                url: node.coverImage.url,
              },
              publication: {
                id: node.publication.id,
              },
            };
            blogs.push(newBlog);
          });
        } else {
          vscode.window.showErrorMessage(
            "Access Token Invalid. Please verify your token and try again."
          );
        }
      }
    }
  );

  const fetchBlog = vscode.commands.registerCommand(
    "hashnode-on-vscode.fetchBlog",
    () => {
      blogDataProvider.refresh(blogs);
    }
  );

  const createBlog = vscode.commands.registerCommand(
    "hashnode-on-vscode.createPost",
    () => {
      let postID = ObjectID().toHexString();
      const newPost: NewPost = {
        id: postID,
        title: "New Blog",
        content: "",
      };

      if (!panel) {
        panel = vscode.window.createWebviewPanel(
          "createPostView",
          newPost.title,
          vscode.ViewColumn.One,
          {
            enableScripts: true,
            localResourceRoots: [
              vscode.Uri.joinPath(context.extensionUri, "dist"),
            ],
          }
        );
      }

      panel.title = newPost.title;
      panel.webview.html = createPostWebView(
        panel.webview,
        context.extensionUri,
        newPost
      );

      panel.webview.onDidReceiveMessage((message) => {
        console.log("message: ", message);
        const command = message.command;
        const data = message.data;
        switch (command) {
          case "preview-blog":
            panel = vscode.window.createWebviewPanel(
              "Preview",
              "Preview",
              vscode.ViewColumn.Two,
              {
                enableScripts: true,
              }
            );
            const htmlText: string = marked(data).toString();
            panel.webview.html = htmlText;
            break;
          case "save-blog":
            if (data.title !== "" && data.content !== "" && data.tags !== "") {
              const publicationId = readData(context, "publicationId");
              const tags = data.tags.split(",");
              const tagsArray: { name: string; slug: string }[] = [];
              tags.map((tag: string) => {
                tagsArray.push({
                  name: tag,
                  slug: tag,
                });
              });
              const postInput = {
                title: data.title,
                contentMarkdown: data.content,
                publicationId: publicationId as string,
                tags: tagsArray,
                coAuthors: [],
              };
              console.log("post: ", postInput);
              const response = postBlog(postInput, hashnodeToken as string);
            } else {
              vscode.window.showErrorMessage("Please fill all the fields");
            }
            break;
        }
      });

      panel.onDidDispose(
        () => {
          panel = undefined;
        },
        null,
        context.subscriptions
      );
    }
  );

  context.subscriptions.push(addToken);
  context.subscriptions.push(fetchBlog);
  context.subscriptions.push(createBlog);
  context.subscriptions.push(openBlog);
}

export function deactivate() {}
