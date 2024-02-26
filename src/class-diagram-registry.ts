import { ClassDiagram } from "./class-diagram";
import * as vscode from 'vscode';
import { ASSETS_FOLDER_NAME, EXTENSION_NAME } from "./constants";
import { TsUML2Settings } from "tsuml2";


function applyExtensionSettings(settings: TsUML2Settings) {
    const extConfig = vscode.workspace.getConfiguration(EXTENSION_NAME);
    (Object.keys(settings) as (keyof TsUML2Settings)[]).forEach(key => {
        if(extConfig.has(key)) {
            (settings as any)[key] = extConfig.get(key);
        }
    });
}

export class ClassDiagramRegistry {

    classDiagrams = new Map<string,ClassDiagram>();
    constructor(private context: vscode.ExtensionContext) {
        
    }
    public createClassDiagram(uri: vscode.Uri) {

        let settings = new TsUML2Settings();
        applyExtensionSettings(settings);
        settings.tsconfig = undefined as any;

        const uriString = uri.toString();
        const classDiagram = new ClassDiagram({
            uri, 
            tsuml2Settings: settings,
            assetsPath: vscode.Uri.joinPath(this.context.extensionUri, ASSETS_FOLDER_NAME), 
            onDispose: ()=>{this.classDiagrams.delete(uriString);}});
            
        this.classDiagrams.set(uriString, classDiagram);
        return classDiagram;
    }
    public getClassDiagram(uri: vscode.Uri) {
        return this.classDiagrams.get(uri.toString());
    }
}