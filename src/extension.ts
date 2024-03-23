// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TsUML2Extension } from './tsuml2-extension';
import { CMD_SHOW_CLASS_DIAGRAM, CMD_SHOW_MERMAID_DSL, CMD_SHOW_NOMNOML_DSL, CMD_SHOW_SETTINGS } from './constants';


// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
// Your extension is activated the very first time the command is executed

	const extension = new TsUML2Extension(context);

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "tsuml2-vscode" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand(CMD_SHOW_CLASS_DIAGRAM,(uri: vscode.Uri, allSelectedFiles?: vscode.Uri[]) => { 
		return allSelectedFiles ? extension.showClassDiagram(allSelectedFiles) : extension.showClassDiagram(uri);
	});
	context.subscriptions.push(disposable);

	context.subscriptions.push(vscode.commands.registerCommand(CMD_SHOW_MERMAID_DSL, () =>extension.showMermaidDSL()));
	context.subscriptions.push(vscode.commands.registerCommand(CMD_SHOW_NOMNOML_DSL, () => extension.showNomnomlDSL()));
	context.subscriptions.push(vscode.commands.registerCommand(CMD_SHOW_SETTINGS, () => extension.showSettings()));
}

// This method is called when your extension is deactivated
export function deactivate() {}
