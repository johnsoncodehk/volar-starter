const vue = require('@volar/vue-language-core');
const path = require('path');
const ts = require('typescript');

const tsconfig = require.resolve('./tsconfig.json');
const parsedCommandLine = vue.tsShared.createParsedCommandLine(ts, {
    useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames,
    readDirectory: (path, extensions, exclude, include, depth) => {
        return ts.sys.readDirectory(path, [...extensions, '.vue'], exclude, include, depth);
    },
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
}, tsconfig);
const scriptSnapshot = {};
const core = vue.createLanguageContext({
    ...ts.sys,
    getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options), // should use ts.getDefaultLibFilePath not ts.getDefaultLibFileName
    useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
    getCompilationSettings: () => parsedCommandLine.options,
    getScriptFileNames: () => parsedCommandLine.fileNames,
    getProjectReferences: () => parsedCommandLine.projectReferences,
    getScriptVersion: (fileName) => '0',
    getScriptSnapshot: (fileName) => {
        if (!scriptSnapshot[fileName]) {
            const fileText = ts.sys.readFile(fileName);
            if (fileText !== undefined) {
                scriptSnapshot[fileName] = ts.ScriptSnapshot.fromString(fileText);
            }
        }
        return scriptSnapshot[fileName];
    },
    getTypeScriptModule: () => ts,
    getVueCompilationSettings: () => parsedCommandLine.vueOptions,
});
const tsLs = ts.createLanguageService(core.typescriptLanguageServiceHost);
const program = tsLs.getProgram();
const typeChecker = program.getTypeChecker();

const helloWorldScript = getMainTsSourceFile(path.resolve(__dirname, './src/components/HelloWorld.vue'));
const definePropsTypeNode = findDefinePropTypeNode(helloWorldScript);
const definePropsType = typeChecker.getTypeAtLocation(definePropsTypeNode);

for (const [key, member] of definePropsType.symbol.members) {
    console.log(key + ': ' + typeChecker.getTypeFromTypeNode(member.valueDeclaration.type).intrinsicName);
}

function getMainTsSourceFile(vueFileName) {
    const vueSourceFile = core.mapper.get(vueFileName);
    const mainScript = vueSourceFile.getAllEmbeddeds().find(e => e.file.isTsHostFile && /.*\.vue.(ts|js)$/.test(e.file.fileName));
    return program?.getSourceFile(mainScript.file.fileName);
    // or just: return program?.getSourceFile(vueFileName + '.ts');
}

function findDefinePropTypeNode(sourceFile) {

    let result;

    sourceFile.forEachChild(walkNode);

    return result;

    function walkNode(node) {
        if (
            ts.isCallExpression(node)
            && ts.isIdentifier(node.expression)
            && node.expression.text === 'defineProps'
            && node.typeArguments?.length
        ) {
            result = node.typeArguments[0];
        }
        if (!result) {
            node.forEachChild(walkNode);
        }
    }
}
