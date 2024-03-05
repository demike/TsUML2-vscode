import * as vscode from 'vscode';

export class StatusBarSection {
    private showModifiers: vscode.StatusBarItem;
    constructor(private context: vscode.ExtensionContext) {
        //TODO implement me
        this.showModifiers = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.showModifiers.text = `Modifiers $()`;
        this.showModifiers.command = 'tsuml2-vscode.showModifiers';
        this.context.subscriptions.push(this.showModifiers);
        this.showModifiers.show();
    }
    public dispose() {
        this.showModifiers.dispose();
    }
}