import * as tsuml2 from 'tsuml2';
import { createGlobFromUri } from './util';
import { TsUML2Settings } from 'tsuml2/dist/core/tsuml2-settings';
import * as vscode from 'vscode';


export class ClassDiagram {
    readonly uri: vscode.Uri;
    private onDisposeCallback: () => void;
    private panel?: vscode.WebviewPanel;
    //private fileSystemWatcher: vscode.FileSystemWatcher;
    constructor(options: {uri: vscode.Uri, onDispose: () => void}) {
        this.uri = options.uri;
        this.onDisposeCallback = options.onDispose;

        // this.fileSystemWatcher = vscode.workspace.createFileSystemWatcher(this.uri.fsPath, true, false, false);
        // this.fileSystemWatcher.onDidChange
    }

    public async generate() {
        // TODO: implement settings for exclude patterns
        const glob = await createGlobFromUri(this.uri);
        const settings = new TsUML2Settings();
        settings.glob = glob;
        tsuml2.createDiagram(settings);
        this.setupFileSystemWatcher(glob);
    }

    public show() {
        if(this.panel) {
            this.panel.reveal();
            return;
        }
        const panel = this.createPanel();
        this.panel = panel;

        panel.webview.html = this.getWebviewContent();
        panel.onDidDispose(this.onDisposeCallback);
    }

    protected getWebviewContent() { 
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cat Coding</title>
        </head>
        <body>
            <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
        </body>
        </html>`;
    }

    protected createPanel() {
        const panel = vscode.window.createWebviewPanel(
            'tsuml2',
            'Class Diagram: ' + this.uri.fsPath,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
            },
        );
        // panel.iconPath = // TODO set path
        return panel;
    }

    protected setupFileSystemWatcher(globalPattern: string) {
        // TODO: implement me
    }

    protected async onFileChange() {
        await this.generate();
        this.show();
    }

    protected onFileDelete() {
        // delete the panel when the file / folder was deleted
        this.panel?.dispose();
    }

    
}