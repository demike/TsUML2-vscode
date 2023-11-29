import * as vscode from 'vscode';
export async function createGlobFromUri(uri: vscode.Uri, options?: { excludeSpecs?: boolean } ) {
    const excludeSpecs = options?.excludeSpecs ?? true;
    const stat = await vscode.workspace.fs.stat(uri);

    const isDirectory = (stat.type & vscode.FileType.Directory) === vscode.FileType.Directory;
    if(isDirectory) {
        //TODO go on
        return uri.fsPath + (excludeSpecs) ? '/**/!(*.spec).ts' : '/**/*.ts';
    } else {
        return uri.fsPath;
    }
}