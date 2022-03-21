import type { EmbeddedLanguageServicePlugin } from '@volar/vue-language-service-types';
import * as prettier from 'prettier';

export default function (): EmbeddedLanguageServicePlugin {

    return {

        format(document, range, options) {

            if (document.languageId !== 'html')
                return;

            const formattedText = prettier.format(document.getText(), {
                tabWidth: options.tabSize,
                useTabs: !options.insertSpaces,
                parser: document.languageId,
            });

            if (formattedText === document.getText())
                return []; // return empty array instead of undefined to avoid progress to next plugin

            return [{
                range: {
                    start: document.positionAt(0),
                    end: document.positionAt(document.getText().length),
                },
                newText: formattedText,
            }];
        },
    }
}
