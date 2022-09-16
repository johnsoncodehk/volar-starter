/** @type {import('@volar/vue-language-core').VueLanguagePlugin} */
const plugin = () => {

	return {

		resolveEmbeddedFile(fileName, sfc, embeddedFile) {
			if (embeddedFile.fileName.replace(fileName, '').match(/^\.(js|ts|jsx|tsx)$/)) {
				const keys = new Set();
				for (const block of sfc.customBlocks) {
					if (block.type === 'i18n') {
						try {
							const data = JSON.parse(block.content);
							for (const [_, obj] of Object.entries(data)) {
								for (const key in obj) {
									keys.add(key);
								}
							}
						}
						catch { }
					}
				}
				if (keys.size) {
					embeddedFile.codeGen.addText(`
						interface __VLS_Ctx {
							$t(key: ${[...keys].map(key => `'${key}'`).join(' | ')}): void;
						}
					`);
				}
			}
		},
	};
};
module.exports = plugin;
