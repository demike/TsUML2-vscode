import * as packageJson from '../package.json';

export const PUBLISHER = packageJson.publisher
export const EXTENSION_NAME = 'tsuml2-vscode';

export const ASSETS_FOLDER_NAME = 'assets';


export const CMD_SHOW_CLASS_DIAGRAM = `${EXTENSION_NAME}.showClassDiagram`;
export const CMD_SHOW_MERMAID_DSL = `${EXTENSION_NAME}.showMermaidDSL`;
export const CMD_SHOW_NOMNOML_DSL = `${EXTENSION_NAME}.showNomnomlDSL`;
export const CMD_SHOW_SETTINGS = `${EXTENSION_NAME}.showTsUML2Settings`;
