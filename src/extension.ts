// The module 'vscode' contains the VS Code extensibility API

// import { getAuthUser } from "./api/queries.js";

// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { getAuthUser } from "./api/queries";
import { NotepadDataProvider } from "./providers/BlogDataProvider";
import { Note } from "./types/Note";
import { readData, saveData } from "./utilities/globalState";
// const { getAuthUser } = require("./api/queries");

export function activate(context: vscode.ExtensionContext) {
  let notes: Note[] = [];
  // const secrets = context["secrets"];
  const hashnodeToken = readData(context, "hashnode-on-vscode.accessToken");
  if (hashnodeToken) {
    console.log("token present: ", hashnodeToken);
  }
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "hashnode-on-vscode" is now active!'
  );

  const notepadDataProvider = new NotepadDataProvider(notes);

  // Create a tree view to contain the list of notepad notes
  const treeView = vscode.window.createTreeView(
    "hashnode-on-vscode.blogsList",
    {
      treeDataProvider: notepadDataProvider,
      showCollapseAll: false,
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
        vscode.window.showInformationMessage("Access Token stored securely!");
        const token = readData(context, "accessToken");
        if (token) {
          const response = await getAuthUser(token);
          console.log("Token ", typeof token);
          // console.log("user: ", response);
          vscode.window.showWarningMessage(JSON.stringify(response));

          // if(response){
          //   if(response.errors)
          // }
        }
      }
    }
  );

  const fetchToken = vscode.commands.registerCommand(
    "hashnode-on-vscode.fetchToken",
    async () => {
      //
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(addToken);
}

export function deactivate() {}
