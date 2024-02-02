import * as vscode from "vscode";

export const saveData = (
  context: vscode.ExtensionContext,
  key: string,
  value: any
) => {
  context.globalState.update(key, value);
};

export const readData = (context: vscode.ExtensionContext, key: string) => {
  return context.globalState.get(key);
};
