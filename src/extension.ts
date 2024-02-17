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
import { postBlog } from "./api/mutations";
import { previewPostWebView } from "./ui/previewPostWebView";
import { marked } from "marked";

export function activate(context: vscode.ExtensionContext) {
  let blogs: Post[] = [];

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
            id: node?.id,
            title: node?.title,
            content: {
              html: node?.content?.html,
              markdown: node?.content?.markdown,
            },
            coverImage: {
              url: node?.coverImage?.url ?? "",
            },
            publication: {
              id: node?.publication?.id,
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
      const blogPost = blogs.find(
        (post) => post.id === selectedTreeViewItem.id
      );
      if (!blogPost) {
        vscode.window.showErrorMessage("No matching post found");
        return;
      }

      let blogViewPanel: vscode.WebviewPanel | undefined =
        vscode.window.createWebviewPanel(
          "blogView",
          blogPost.title,
          vscode.ViewColumn.One,
          {
            enableScripts: true,
            localResourceRoots: [
              vscode.Uri.joinPath(context.extensionUri, "dist"),
            ],
          }
        );

      blogViewPanel.title = blogPost.title;
      blogViewPanel.webview.html = getWebviewContent(
        blogViewPanel.webview,
        context.extensionUri,
        blogPost
      );

      blogViewPanel.onDidDispose(
        () => {
          blogViewPanel = undefined;
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
              id: node?.id,
              title: node?.title,
              content: {
                html: node?.content?.html,
                markdown: node?.content?.markdown,
              },
              coverImage: {
                url: node?.coverImage?.url ?? "",
              },
              publication: {
                id: node?.publication?.id,
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

      let createPostPanel: vscode.WebviewPanel | undefined =
        vscode.window.createWebviewPanel(
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

      createPostPanel.webview.html = createPostWebView(
        createPostPanel.webview,
        context.extensionUri,
        newPost
      );

      createPostPanel.webview.onDidReceiveMessage(async (message) => {
        console.log("message: ", message);
        const command = message.command;
        const data = message.data;
        switch (command) {
          case "preview-blog":
            let previewPostPanel: vscode.WebviewPanel | undefined = undefined;

            previewPostPanel = vscode.window.createWebviewPanel(
              "Preview",
              "Preview",
              vscode.ViewColumn.Two,
              {
                enableScripts: true,
              }
            );
            let markdownText = marked(message?.data?.content)?.toString();
            message.data.content = markdownText;
            previewPostPanel.webview.html = previewPostWebView(
              previewPostPanel.webview,
              context.extensionUri,
              message.data
            );
            break;
          case "save-blog":
            if (
              data.title !== "" &&
              data.content !== "" &&
              data.tags !== "" &&
              data.title.length > 6
            ) {
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

              const confirmation = await vscode.window.showInputBox({
                prompt: "Are you sure you want to publish post to Hashnode?",
                title: "Enter YES to Publish Post",
                validateInput: (input) => {
                  if (!input) {
                    return "Please enter a value.";
                  }

                  return null;
                },
              });
              if (confirmation === "YES") {
                const response = await postBlog(
                  postInput,
                  hashnodeToken as string
                );
                if (response) {
                  const newPost: Post = {
                    id: response?.id,
                    title: response?.title,
                    content: {
                      html: response?.content.html,
                      markdown: response?.content.markdown,
                    },
                    coverImage: {
                      url: response?.coverImage?.url ?? "",
                    },
                    publication: {
                      id: response?.publication?.id,
                    },
                  };
                  blogs.unshift(newPost);
                  blogDataProvider.refresh(blogs);
                }
                vscode.window.showInformationMessage(
                  "Post Published Successfully"
                );
                createPostPanel?.dispose();
              } else {
                vscode.window.showErrorMessage("Post Not Published");
              }
            } else {
              vscode.window.showErrorMessage("Please fill all the fields");
            }
            break;
        }
      });

      createPostPanel.onDidDispose(
        () => {
          createPostPanel = undefined;
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
