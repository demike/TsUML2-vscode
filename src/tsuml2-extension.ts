import * as vscode from 'vscode';
import { ClassDiagramRegistry } from './class-diagram-registry';
import { EXTENSION_NAME, PUBLISHER } from './constants';
export class TsUML2Extension {
    private classDiagramRegistry: ClassDiagramRegistry;
    constructor(private readonly context: vscode.ExtensionContext) {
        this.classDiagramRegistry = new ClassDiagramRegistry(context);
    }


    public async showClassDiagram(uri: vscode.Uri | vscode.Uri[]) {
        if(Array.isArray(uri) && uri.length === 1) {
            uri = uri[0];
        }
		// The code you place here will be executed every time your command is executed
        let classDiagram = this.classDiagramRegistry.getClassDiagram(uri);
        if(!classDiagram) {
            classDiagram = this.classDiagramRegistry.createClassDiagram(uri);
            classDiagram.show(); // show loading screen
            const svg = await classDiagram.generate();
            classDiagram.show(svg); // show the generated diagram
        } else {
            classDiagram.reveal();
        }
    }

    public showMermaidDSL() {
        const classDiagram = this.classDiagramRegistry.getActiveClassDiagram();
        if(classDiagram) {
            classDiagram.showMermaidDSL();
        }
    }

    public showNomnomlDSL() {
        const classDiagram = this.classDiagramRegistry.getActiveClassDiagram();
        if(classDiagram) {
            classDiagram.showNomnomlDSL();
        }
    }

    public saveSVG() {
        const classDiagram = this.classDiagramRegistry.getActiveClassDiagram();
        if(classDiagram) {
            classDiagram.saveSVG();
        }
    }

    public showSettings() {
        vscode.commands.executeCommand('workbench.action.openSettings', `@ext:${PUBLISHER}.${EXTENSION_NAME}`);
    }
}