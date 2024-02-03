// The module 'vscode' contains the VS Code extensibility API

// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getAuthUser } from "./api/queries";
import { NotepadDataProvider } from "./providers/BlogDataProvider";
import { Note, Post } from "./types/Blog";
import { readData, saveData } from "./utilities/globalState";
import { getWebviewContent } from "./ui/getWebView";
import { marked } from "marked";

export function activate(context: vscode.ExtensionContext) {
  let notes: Post[] = [];
  let blogs: Post[] = [];
  let panel: vscode.WebviewPanel | undefined = undefined;
  // const secrets = context["secrets"];

  const getWelcomeContent = async (token: any) => {
    if (token) {
      vscode.commands.executeCommand(
        "setContext",
        "hashnode-on-vscode.getWelcomeContent",
        token
      );
      const response = await getAuthUser(token);

      // console.log("response: ", response?.nodes);
      response?.nodes.forEach((node) => {
        const html = marked.parse(node.content.markdown);
        console.log(html);
        const newBlog: Post = {
          id: node.id,
          title: node.title,
          content: {
            html: html,
            markdown: node.content.markdown,
          },
        };
        blogs.push(newBlog);
      });
      console.log(blogs);
    } else {
      vscode.commands.executeCommand(
        "setContext",
        "hashnode-on-vscode.getWelcomeContent",
        token
      );
    }
  };

  const hashnodeToken = readData(context, "accessToken");
  console.log("token ", hashnodeToken);
  getWelcomeContent(hashnodeToken);

  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "hashnode-on-vscode" is now active!'
  );

  const notepadDataProvider = new NotepadDataProvider(blogs);

  // Create a tree view to contain the list of notepad notes
  const treeView = vscode.window.createTreeView(
    "hashnode-on-vscode.blogsList",
    {
      treeDataProvider: notepadDataProvider,
      showCollapseAll: false,
    }
  );

  // Command to render a webview-based note view
  const openBlog = vscode.commands.registerCommand(
    "notepad.showNoteDetailView",
    () => {
      const selectedTreeViewItem = treeView.selection[0];
      const matchingNote = blogs.find(
        (note) => note.id === selectedTreeViewItem.id
      );
      if (!matchingNote) {
        vscode.window.showErrorMessage("No matching note found");
        return;
      }

      // If no panel is open, create a new one and update the HTML
      if (!panel) {
        panel = vscode.window.createWebviewPanel(
          "noteDetailView",
          matchingNote.title,
          vscode.ViewColumn.One,
          {
            // Enable JavaScript in the webview
            enableScripts: true,
            // Restrict the webview to only load resources from the `out` directory
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

      // If a panel is open and receives an update message, update the notes array and the panel title/html
      panel.webview.onDidReceiveMessage((message) => {
        const command = message.command;
        const note = message.note;
        switch (command) {
          case "updateNote":
            const updatedNoteId = note.id;
            const copyOfNotesArray = [...notes];
            const matchingNoteIndex = copyOfNotesArray.findIndex(
              (note) => note.id === updatedNoteId
            );
            copyOfNotesArray[matchingNoteIndex] = note;
            notes = copyOfNotesArray;
            notepadDataProvider.refresh(notes);
            panel
              ? ((panel.title = note.title),
                (panel.webview.html = getWebviewContent(
                  panel.webview,
                  context.extensionUri,
                  note
                )))
              : null;
            break;
        }
      });

      panel.onDidDispose(
        () => {
          // When the panel is closed, cancel any future updates to the webview content
          panel = undefined;
        },
        null,
        context.subscriptions
      );
    }
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "hashnode-on-vscode.getHashnode",
    function () {
      // The code you place here will be executed every time your command is executed

      // Display a message box to the user
      vscode.window.showInformationMessage("Hello Hashnode Users!!");
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
        saveData(context, "accessToken", accessToken);
        const heheToken = readData(context, "accessToken");
        console.log("hehe ", heheToken);
        vscode.window.showInformationMessage("Access Token stored securely!");
        const token = readData(context, "accessToken");
        if (token) {
          const response = await getAuthUser(token);
          vscode.window.showWarningMessage(JSON.stringify(response));
        }
      }
    }
  );

  const createNote = vscode.commands.registerCommand(
    "notepad.createNote",
    () => {
      notepadDataProvider.refresh(blogs);
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(addToken);
  context.subscriptions.push(createNote);
}

export function deactivate() {}
