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
import { postBlog, removeBlog, updateBlog } from "./api/mutations";
import { previewPostWebView } from "./ui/previewPostWebView";
import { marked } from "marked";

export function activate(context: vscode.ExtensionContext) {
  let blogs: Post[] = [];

  const getWelcomeContent = async (token: string) => {
    if (token) {
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
  getWelcomeContent(hashnodeToken as string);

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

  const previewPost = (message: any) => {
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
  };

  const savePost = async (
    data: any,
    panel: vscode.WebviewPanel | undefined,
    isUpdate: boolean
  ) => {
    if (
      data.title !== "" &&
      data.content !== "" &&
      data.tags !== "" &&
      data.id !== "" &&
      data.title.length > 6
    ) {
      const publicationId = readData(context, "publicationId");
      const tags = data.tags.split(",");
      const tagsArray: { name: string; slug: string }[] = [];
      let postInput: any = {};
      let response: any;

      tags.map((tag: string) => {
        tagsArray.push({
          name: tag,
          slug: tag,
        });
      });
      if (isUpdate) {
        postInput = {
          id: data.id,
          title: data.title,
          contentMarkdown: data.content,
          publicationId: publicationId as string,
          tags: tagsArray,
          coAuthors: [],
        };
      } else {
        postInput = {
          title: data.title,
          contentMarkdown: data.content,
          publicationId: publicationId as string,
          tags: tagsArray,
          coAuthors: [],
        };
      }

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
        if (isUpdate) {
          response = await updateBlog(postInput, hashnodeToken as string);
        } else {
          response = await postBlog(postInput, hashnodeToken as string);
        }

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
        vscode.window.showInformationMessage("Post Published Successfully");
        panel?.dispose();
      } else {
        vscode.window.showErrorMessage("Post Not Published");
      }
    } else {
      vscode.window.showErrorMessage("Please fill all the fields");
    }
  };
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
        newPost,
        false
      );

      createPostPanel.webview.onDidReceiveMessage(async (message) => {
        console.log("message: ", message);
        const command = message.command;
        const data = message.data;
        switch (command) {
          case "preview-blog":
            previewPost(message);
            break;
          case "save-blog":
            savePost(data, createPostPanel, false);
            break;
        }
      });
    }
  );

  const editBlog = vscode.commands.registerCommand(
    "hashnode-on-vscode.editPost",
    (node) => {
      if (node) {
        const updatePost = {
          id: node?.id,
          title: node?.label,
          content: node?.command?.arguments[0],
        };

        let updatePostPanel: vscode.WebviewPanel | undefined =
          vscode.window.createWebviewPanel(
            "createPostView",
            updatePost.title,
            vscode.ViewColumn.One,
            {
              enableScripts: true,
              localResourceRoots: [
                vscode.Uri.joinPath(context.extensionUri, "dist"),
              ],
            }
          );

        updatePostPanel.webview.html = createPostWebView(
          updatePostPanel.webview,
          context.extensionUri,
          updatePost,
          true
        );

        updatePostPanel.webview.onDidReceiveMessage(async (message) => {
          console.log("message: ", message);
          const command = message.command;
          const data = message.data;
          switch (command) {
            case "preview-blog":
              previewPost(message);
              break;
            case "save-blog":
              savePost(data, updatePostPanel, true);
              break;
          }
        });
      }
    }
  );

  const deleteBlog = vscode.commands.registerCommand(
    "hashnode-on-vscode.deletePost",
    async (node) => {
      if (node) {
        const confirmation = await vscode.window.showInputBox({
          prompt: "Are you sure you want to delete this post?",
          title: "Enter DELETE to remove Post",
          validateInput: (input) => {
            if (!input) {
              return "Please enter a value.";
            }

            return null;
          },
        });
        if (confirmation === "DELETE") {
          const response = await removeBlog(
            { id: node?.id },
            hashnodeToken as string
          );
          if (response?.id) {
            blogs = blogs.filter((blog) => blog?.id !== node?.id);
            blogDataProvider.refresh(blogs);
            vscode.window.showInformationMessage("Post Deleted Successfully");
          }
        } else {
          vscode.window.showErrorMessage("Post couldn't be deleted");
        }
      }
    }
  );

  context.subscriptions.push(addToken);
  context.subscriptions.push(fetchBlog);
  context.subscriptions.push(createBlog);
  context.subscriptions.push(openBlog);
  context.subscriptions.push(editBlog);
  context.subscriptions.push(deleteBlog);
}

export function deactivate() {}
