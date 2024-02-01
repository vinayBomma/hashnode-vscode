// The module 'vscode' contains the VS Code extensibility API

// import { getAuthUser } from "./api/queries.js";

// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
// const { getAuthUser } = require("./api/queries");

function activate(context) {
  const secrets = context["secrets"];
  const subDisposable = [];
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "hashnode-on-vscode" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "hashnode-on-vscode.getHashnode",
    function () {
      // The code you place here will be executed every time your command is executed

      // Display a message box to the user
      vscode.window.showInformationMessage("Hello Hashnode Users!!");
    }
  );
  subDisposable.push(disposable);
  let addToken = vscode.commands.registerCommand(
    "hashnode-on-vscode.addToken",
    async () => {
      const accessToken = await vscode.window.showInputBox({
        prompt: "Please Enter Hashnode Access Token",
        title: "Hashnode Access Token",
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
        await secrets.store("hashnode-on-vscode.accessToken", accessToken);
        vscode.window.showInformationMessage("Access Token stored securely!");
      }

      const token = await secrets.get("hashnode-on-vscode.accessToken");
      // const user = await getAuthUser(token);
      // console.log("Token ", token);
      // console.log("user: ", user);
    }
  );
  subDisposable.push(addToken);

  context.subscriptions.push(...subDisposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
