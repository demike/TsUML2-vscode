import * as tsuml2 from 'tsuml2';
import { createGlobFromUri, getNonce } from './util';
import { TsUML2Settings } from 'tsuml2/dist/core/tsuml2-settings';
import * as vscode from 'vscode';


export class ClassDiagram {
    readonly uri: vscode.Uri;
    private onDisposeCallback: () => void;
    private panel?: vscode.WebviewPanel;
    private assetsPath: vscode.Uri;
    private tsuml2Settings = new TsUML2Settings();
    fileSystemWatcher?: vscode.FileSystemWatcher;
    //private fileSystemWatcher: vscode.FileSystemWatcher;
    constructor(options: {uri: vscode.Uri, onDispose: () => void, assetsPath: vscode.Uri}) {
        this.uri = options.uri;
        this.onDisposeCallback = options.onDispose;
        this.assetsPath = options.assetsPath;

        this.tsuml2Settings.tsconfig = undefined as any;

        // this.fileSystemWatcher = vscode.workspace.createFileSystemWatcher(this.uri.fsPath, true, false, false);
        // this.fileSystemWatcher.onDidChange
    }

    public async generate() {
        // TODO: implement settings for exclude patterns
        if(!this.tsuml2Settings.glob) {
            this.tsuml2Settings.glob = await createGlobFromUri(this.uri);
            this.setupFileSystemWatcher(this.tsuml2Settings.glob);
        }

        const declarations = tsuml2.parseProject(this.tsuml2Settings.tsconfig,this.tsuml2Settings.glob);
        const nomnomlDsl = tsuml2.getNomnomlDSL(declarations, this.tsuml2Settings);
        let svg = tsuml2.renderNomnomlSVG(nomnomlDsl);
        svg = tsuml2.postProcessSvg(svg, undefined, declarations);
        return svg;
    }

    public show(svg?: string) {
        if(!this.panel) {
            this.panel = this.createPanel();
            this.setupWebViewListener(this.panel.webview);
        }
        const panel = this.panel;
        

        if(svg) {
            panel.webview.html = this.getSvgWebviewContent(panel.webview, svg);
        } else {
            panel.webview.html = this.getLoadingWebviewContent(panel.webview);
        }
        panel.onDidDispose(() => {
            this.onDisposeCallback();
            this.fileSystemWatcher?.dispose();
        });
    }

    public reveal() {
            this.panel?.reveal();
    }

    protected getLoadingWebviewContent(webView: vscode.Webview) { 
        const webviewcss = webView.asWebviewUri(vscode.Uri.joinPath(this.assetsPath, 'webview.css'));
        const loadingImage = webView.asWebviewUri(vscode.Uri.joinPath(this.assetsPath, 'busy_cat.gif'));
        const nonce = getNonce();
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <!--
            Use a content security policy to only allow loading images from https or from our extension directory,
            and only allow scripts that have a specific nonce.
            -->
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webView.cspSource}; img-src ${webView.cspSource} https:; script-src ${webView.cspSource};">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Class Diagram</title>
            <link rel="stylesheet" href="${webviewcss}">      
        </head>
        <body>
            <div class="loading-container">
            <h1>Processing</h1>
            <img src="${loadingImage}" width="300" />
            </div>
        </body>
        </html>`;
    }

    protected getSvgWebviewContent(webView: vscode.Webview, svg: string) { 
        const webviewcss = webView.asWebviewUri(vscode.Uri.joinPath(this.assetsPath, 'webview.css'));
        const webviewjs = webView.asWebviewUri(vscode.Uri.joinPath(this.assetsPath, 'webview.js'));
        // const nonce = getNonce();

        
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <!--
            Use a content security policy to only allow loading images from https or from our extension directory,
            and only allow scripts that have a specific nonce.
            -->
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webView.cspSource}; img-src ${webView.cspSource} https:; script-src ${webView.cspSource};">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Class Diagram</title>
            <link rel="stylesheet" href="${webviewcss}">
            <script src="${webviewjs}"></script>
        </head>
        <body>
            <div id="diagramwrapper" class="diagram-wrapper">
                <div id="diagram">${svg}</div>
            </div>
            <div class="zoom-container">
                <label for="zoomslider" class="zoom-slider-label">Zoom</label>
                <input id="zoomslider" value="100" min=1 max=100 type="range" />
            </div>
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
                enableCommandUris: true,
                localResourceRoots: [this.assetsPath]
            },
        );
        // panel.iconPath = // TODO set path
        return panel;
    }

    protected setupWebViewListener(webview: vscode.Webview) {
        webview.onDidReceiveMessage( (message: { command: string, uri?: string } ) => {
            switch(message.command) {
                case "vscode.open":
                    vscode.commands.executeCommand(message.command,vscode.Uri.file(message.uri!));
                    break;
                default:
                    vscode.commands.executeCommand(message.command);
            }
        });
    }

    protected setupFileSystemWatcher(globalPattern: string) {
        vscode.workspace.onDidSaveTextDocument(($event) => {
           if( $event.fileName.startsWith(this.uri.fsPath)) {
            this.onFileChange();
           }
         });
    }

    protected async onFileChange() {
        const svg = await this.generate();
        this.show(svg);
    }

    /*
    protected onFileDelete() {
        // delete the panel when the file / folder was deleted
        this.panel?.dispose();
        this.fileSystemWatcher?.dispose();
    }
    */

    
}