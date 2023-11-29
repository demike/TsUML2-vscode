import * as vscode from 'vscode';
import * as tsuml2 from 'tsuml2';
import { ClassDiagramRegistry } from './class-diagram-registry';
export class TsUML2Extension {
    private classDiagramRegistry = new ClassDiagramRegistry();
    constructor(private readonly context: vscode.ExtensionContext) {
    }


    public showClassDiagram(uri: vscode.Uri) {
    
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from TsUML2-vscode!');
        let classDiagram = this.classDiagramRegistry.getClassDiagram(uri);
        if(!classDiagram) {
            classDiagram = this.classDiagramRegistry.createClassDiagram(uri);
            classDiagram.generate();
            classDiagram.show();
            vscode.window.showInformationMessage('Class diagram already exists');
            return;
        } else {
            classDiagram.show();
        }
}
}