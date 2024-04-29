import * as tsuml2 from "tsuml2";
import { createGlobFromUri, getNonce, getRelativePath } from "./util";
import { TsUML2Settings } from "tsuml2/dist/core/tsuml2-settings";
import * as vscode from "vscode";
import { FileDeclaration } from "tsuml2/dist/core/model";
import path from "path";
import fs from "fs";

export class ClassDiagram {
  readonly uri: vscode.Uri | vscode.Uri[];
  private onDisposeCallback: () => void;
  private panel?: vscode.WebviewPanel;
  private assetsPath: vscode.Uri;
  private tsuml2Settings: TsUML2Settings;
  private declarations: FileDeclaration[] = [];
  fileSystemWatcher?: vscode.FileSystemWatcher;
  //private fileSystemWatcher: vscode.FileSystemWatcher;
  constructor(options: {
    uri: vscode.Uri | vscode.Uri[];
    onDispose: () => void;
    assetsPath: vscode.Uri;
    tsuml2Settings: TsUML2Settings;
  }) {
    this.uri = options.uri;
    this.onDisposeCallback = options.onDispose;
    this.assetsPath = options.assetsPath;
    this.tsuml2Settings = options.tsuml2Settings;

    // this.fileSystemWatcher = vscode.workspace.createFileSystemWatcher(this.uri.fsPath, true, false, false);
    // this.fileSystemWatcher.onDidChange
  }

  public async generate(forceRefresh = false) {
    // TODO: implement settings for exclude patterns
    if (!this.tsuml2Settings.glob) {
      this.tsuml2Settings.glob = await createGlobFromUri(this.uri);
      this.setupFileSystemWatcher(this.tsuml2Settings.glob);
    }

    if(this.declarations.length === 0 || forceRefresh) {
      this.declarations = tsuml2.parseProject(this.tsuml2Settings);
    }
    const nomnomlDsl = tsuml2.getNomnomlDSL(
      this.declarations,
      this.tsuml2Settings
    );
    let svg = tsuml2.renderNomnomlSVG(nomnomlDsl);
    svg = tsuml2.postProcessSvg(svg, undefined, this.declarations);
    return svg;
  }

  public show(svg?: string) {
    if (!this.panel) {
      this.panel = this.createPanel();
      this.setupWebViewListener(this.panel.webview);
    }
    const panel = this.panel;

    if (svg) {
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

  public isActive() {
    return this.panel?.active ?? false;
  }

  protected getLoadingWebviewContent(webView: vscode.Webview) {
    const webviewcss = webView.asWebviewUri(
      vscode.Uri.joinPath(this.assetsPath, "webview.css")
    );
    const loadingImage = webView.asWebviewUri(
      vscode.Uri.joinPath(this.assetsPath, "busy_cat.gif")
    );
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
    const webviewcss = webView.asWebviewUri(
      vscode.Uri.joinPath(this.assetsPath, "webview.css")
    );
    const webviewjs = webView.asWebviewUri(
      vscode.Uri.joinPath(this.assetsPath, "webview.js")
    );
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
      "tsuml2",
      this.getTitle(),
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        enableCommandUris: true,
        localResourceRoots: [this.assetsPath],
      }
    );
    // panel.iconPath = // TODO set path
    return panel;
  }

  protected setupWebViewListener(webview: vscode.Webview) {
    webview.onDidReceiveMessage(
      (message: { command: string; uri?: string }) => {
        switch (message.command) {
          case "vscode.open":
            vscode.commands.executeCommand(
              message.command,
              vscode.Uri.file(message.uri!)
            );
            break;
          default:
            vscode.commands.executeCommand(message.command);
        }
      }
    );
  }

  protected setupFileSystemWatcher(globalPattern: string) {
    vscode.workspace.onDidSaveTextDocument(($event) => {
      if (
        Array.isArray(this.uri)
          ? this.uri.some((uri) => $event.fileName.startsWith(uri.fsPath))
          : $event.fileName.startsWith(this.uri.fsPath)
      ) {
        this.onFileChange();
      }
    });
  }

  protected async onFileChange() {
    const svg = await this.generate(true);
    this.show(svg);
  }

  protected getTitle() {
    return `Class Diagram: ${
      Array.isArray(this.uri)
        ? this.uri.map((uri) => getRelativePath(uri)).join(", ")
        : getRelativePath(this.uri)
    }`;
  }

  public saveSVG() {
    vscode.window.showSaveDialog({filters: { 'SVG': ['svg']}}).then(async fileInfos => {
      // here you can use fs to handle data saving
      if(fileInfos !== undefined) {
        const svgData = await this.generate();
      fs.writeFile(fileInfos.fsPath, svgData, (err) => {
        if(err) {
          console.error(err);
        }
      });
      }
  });
  }

  public showMermaidDSL() {
    this.showDSLFile(
      tsuml2.getMermaidDSL(this.declarations, this.tsuml2Settings),
      "uml2-diagram.mermaid"
    );
  }

  public showNomnomlDSL() {
    this.showDSLFile(
      tsuml2.getNomnomlDSL(this.declarations, this.tsuml2Settings),
      "uml2-diagram.nomnoml"
    );
  }

  protected showDSLFile(content: string, tmpFileName: string) {
    const newFile = vscode.Uri.parse(
      "untitled:" + path.join(vscode.workspace.rootPath!, tmpFileName)
    );
    vscode.workspace.openTextDocument(newFile).then((document) => {
      const edit = new vscode.WorkspaceEdit();
      edit.insert(newFile, new vscode.Position(0, 0), content);
      return vscode.workspace.applyEdit(edit).then((success) => {
        if (success) {
          vscode.window.showTextDocument(document);
        } else {
          vscode.window.showInformationMessage("Error!");
        }
      });
    });
  }

  /*
    protected onFileDelete() {
        // delete the panel when the file / folder was deleted
        this.panel?.dispose();
        this.fileSystemWatcher?.dispose();
    }
    */
}
