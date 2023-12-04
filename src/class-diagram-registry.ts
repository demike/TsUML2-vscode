import { ClassDiagram } from "./class-diagram";
import * as vscode from 'vscode';
import { ASSETS_FOLDER_NAME } from "./constants";


export class ClassDiagramRegistry {

    classDiagrams = new Map<string,ClassDiagram>();
    constructor(private context: vscode.ExtensionContext) {
        
    }
    public createClassDiagram(uri: vscode.Uri) {
        const uriString = uri.toString();
        const classDiagram = new ClassDiagram({
            uri, 
            assetsPath: vscode.Uri.joinPath(this.context.extensionUri, ASSETS_FOLDER_NAME), 
            onDispose: ()=>{this.classDiagrams.delete(uriString);}});
        this.classDiagrams.set(uriString, classDiagram);
        return classDiagram;
    }
    public getClassDiagram(uri: vscode.Uri) {
        return this.classDiagrams.get(uri.toString());
    }
}