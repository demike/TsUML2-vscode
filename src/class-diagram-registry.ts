import { ClassDiagram } from "./class-diagram";
import * as vscode from 'vscode';


export class ClassDiagramRegistry {

    classDiagrams = new Map<string,ClassDiagram>();
    constructor() {
        
    }
    public createClassDiagram(uri: vscode.Uri) {
        const uriString = uri.toString();
        const classDiagram = new ClassDiagram({uri, onDispose: ()=>{this.classDiagrams.delete(uriString);}});
        this.classDiagrams.set(uriString, classDiagram);
        return classDiagram;
    }
    public getClassDiagram(uri: vscode.Uri) {
        return this.classDiagrams.get(uri.toString());
    }
}