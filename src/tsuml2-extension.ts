import * as vscode from 'vscode';
import { ClassDiagramRegistry } from './class-diagram-registry';
export class TsUML2Extension {
    private classDiagramRegistry: ClassDiagramRegistry;
    constructor(private readonly context: vscode.ExtensionContext) {
        this.classDiagramRegistry = new ClassDiagramRegistry(context);
    }


    public async showClassDiagram(uri: vscode.Uri) {
    
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from TsUML2-vscode!');
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
}