document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const conversionType = document.getElementById('conversionType');
    const convertAndCopyButton = document.getElementById('convertAndCopyButton');
    const outputText = document.getElementById('outputText');
    const pasteButton = document.getElementById('pasteButton');

    // ヘルパー関数群
    const Utils = {
        // 改行コードをLFに正規化
        normalizeNewlines: (text) => {
            return text.replace(/\r\n|\r/g, '\n');
        },
        // 改行コードをCRLFに変換 (今回は使わないが残しておく)
        toCRLF: (text) => {
            return text.replace(/\n/g, '\r\n');
        }
    };

    // 貼り付けボタンのイベントリスナー
    pasteButton.addEventListener('click', async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            inputText.value = clipboardText;
            alert('クリップボードからテキストを貼り付けました！');
        } catch (err) {
            console.error('クリップボードからの読み取りに失敗しました:', err);
            alert('クリップボードからの貼り付けに失敗しました。ブラウザのセキュリティ設定を確認するか、手動で貼り付けてください。');
        }
    });

    convertAndCopyButton.addEventListener('click', async () => {
        const textToConvert = Utils.normalizeNewlines(inputText.value); // まず改行をLFに正規化
        const selectedType = conversionType.value;
        let convertedText = '';

        switch (selectedType) {
            case 'adjustKagikakko':
                let nestingLevel = 0;
                for (const char of textToConvert) {
                    if (char === '「' || char === '『') {
                        nestingLevel++;
                        convertedText += (nestingLevel % 2 !== 0) ? '「' : '『';
                    } else if (char === '」' || char === '』') {
                        convertedText += (nestingLevel % 2 !== 0) ? '」' : '』';
                        if (nestingLevel > 0) nestingLevel--;
                    } else {
                        convertedText += char;
                    }
                }
                break;
            case 'trimWhitespace':
                convertedText = textToConvert.replace(/^[ ]+/gm, '');
                break;
            case 'stripTrailingWhitespace':
                convertedText = textToConvert.replace(/[ ]+$/gm, '');
                break;
            case 'spaceToFullwidth':
                convertedText = textToConvert.replace(/ /g, '　');
                break;
            case 'spaceToHalfwidth':
                convertedText = textToConvert.replace(/　/g, ' ');
                break;
            case 'markdownQuote':
                convertedText = textToConvert.replace(/^/gm, '> ');
                break;
            case 'markdownBulletList':
                convertedText = textToConvert.replace(/^/gm, '* ');
                break;
            case 'markdownNumberedList':
                const lines = textToConvert.split('\n');
                convertedText = lines.map((line, index) => `${index + 1}. ${line}`).join('\n');
                break;
            case 'geminiNewlineFix':
                // 1. 3つ連続する改行を2つに減らす
                let tempText = textToConvert.replace(/\n\n\n/g, '\n\n');
                // 2. その結果に対して、2つ連続する改行を1つに減らす
                convertedText = tempText.replace(/\n\n/g, '\n');
                break;
            case 'codeBlockAhk':
                convertedText = `\`\`\`AutoHotKey\n${textToConvert}\n\`\`\``;
                break;
            case 'codeBlockPython':
                convertedText = `\`\`\`Python\n${textToConvert}\n\`\`\``;
                break;
            case 'codeBlockJs':
                convertedText = `\`\`\`JavaScript\n${textToConvert}\n\`\`\``;
                break;
            case 'codeBlockGeneric':
                convertedText = `\`\`\`\n${textToConvert}\n\`\`\``;
                break;
            case 'newlinesToSlash':
                convertedText = textToConvert.replace(/\n/g, ' / ');
                break;
            case 'newlinesToSpace':
                convertedText = textToConvert.replace(/\n/g, ' ');
                break;
            default:
                convertedText = textToConvert;
        }

        outputText.value = convertedText;

        try {
            await navigator.clipboard.writeText(convertedText);
            alert('変換結果をクリップボードにコピーしました！');
        } catch (err) {
            console.error('クリップボードへのコピーに失敗しました:', err);
            try {
                outputText.select();
                document.execCommand('copy');
                alert('変換結果をクリップボードにコピーしました！ (旧式コピー)');
            } catch (fallbackErr) {
                alert('クリップボードへのコピーに失敗しました。手動でコピーしてください。');
                console.error('旧式コピーも失敗:', fallbackErr);
            }
        }
    });
});