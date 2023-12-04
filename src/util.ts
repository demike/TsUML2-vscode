import * as vscode from 'vscode';
export async function createGlobFromUri(uri: vscode.Uri, options?: { excludeSpecs?: boolean } ) {
    const excludeSpecs = options?.excludeSpecs ?? true;
    const stat = await vscode.workspace.fs.stat(uri);

    const isDirectory = (stat.type & vscode.FileType.Directory) === vscode.FileType.Directory;
    if(isDirectory) {
        //TODO go on
        return uri.fsPath + ((excludeSpecs) ? '/**/!(*.spec).ts' : '/**/*.ts');
    } else {
        return uri.fsPath;
    }
}


export function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}