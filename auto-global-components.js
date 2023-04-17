const ts = require('typescript');
const path = require('path');
const volar = require('@volar/language-core');
const snapshotToMirrorMappings = new WeakMap();

/** @type {import('@volar/language-core').LanguageModule} */
module.exports = {
    createFile(fileName, snapshot) {
        if (fileName.endsWith('/generated-component-types.d.ts')) {
            return {
                fileName,
                snapshot,
                capabilities: {},
                embeddedFiles: [],
                kind: volar.FileKind.TypeScriptHostFile,
                mappings: [{
                    data: {},
                    sourceRange: [0, snapshot.getLength()],
                    generatedRange: [0, snapshot.getLength()],
                }],
                mirrorBehaviorMappings: snapshotToMirrorMappings.get(snapshot),
            };
        }
    },
    updateFile(file, newSnapshot) {
        file.snapshot = newSnapshot;
        file.mappings = [{
            data: {},
            sourceRange: [0, newSnapshot.getLength()],
            generatedRange: [0, newSnapshot.getLength()],
        }];
        file.mirrorBehaviorMappings = snapshotToMirrorMappings.get(newSnapshot);
    },
    proxyLanguageServiceHost(host) {
        const vueTypesScript = {
            projectVersion: '',
            fileName: host.getCurrentDirectory() + '/generated-component-types.d.ts',
            _version: 0,
            _snapshot: ts.ScriptSnapshot.fromString(''),
            get version() {
                this.update();
                return this._version;
            },
            get snapshot() {
                this.update();
                return this._snapshot;
            },
            update() {
                if (!this._snapshot) {
                    return
                }
                if (!host.getProjectVersion || host.getProjectVersion() !== this.projectVersion) {
                    this.projectVersion = host.getProjectVersion?.() ?? '';
                    const [newText, mirrorMappings] = this.generateText();
                    if (newText !== this._snapshot.getText(0, this._snapshot.getLength())) {
                        this._version++;
                        this._snapshot = ts.ScriptSnapshot.fromString(newText);
                        snapshotToMirrorMappings.set(this._snapshot, mirrorMappings);
                    }
                }
            },
            generateText() {
                const mirrorMappings = [];
                let code = '';
                code += `declare module 'vue' {\n`;
                code += `export interface GlobalComponents {\n`;
                for (const fileName of host.getScriptFileNames()) {
                    if (fileName.endsWith('.vue')) {
                        const dirName = path.dirname(fileName);
                        const baseName = path.basename(fileName);
                        const componentName = baseName.replace('.vue', '');
                        const left = [code.length, code.length + componentName.length];
                        code += `${componentName}: typeof import('./${path.relative(host.getCurrentDirectory(), dirName)}/`;
                        const right = [code.length, code.length + baseName.length];
                        code += `${baseName}').default;\n`;
                        mirrorMappings.push({
                            data: [volar.MirrorBehaviorCapabilities.full, volar.MirrorBehaviorCapabilities.full],
                            sourceRange: left,
                            generatedRange: right,
                        });
                    }
                }
                code += `}\n`;
                code += `}\n`;
                code += `export { };\n`;
                return [code, mirrorMappings];
            },
        };

        return {
            getScriptFileNames() {
                return [
                    ...host.getScriptFileNames(),
                    vueTypesScript.fileName,
                ];
            },
            getScriptVersion(fileName) {
                if (fileName === vueTypesScript.fileName) {
                    return String(vueTypesScript.version);
                }
                return host.getScriptVersion(fileName);
            },
            getScriptSnapshot(fileName) {
                if (fileName === vueTypesScript.fileName) {
                    return vueTypesScript.snapshot;
                }
                return host.getScriptSnapshot(fileName);
            },
        }
    },
};