document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const conversionType = document.getElementById('conversionType');
    const convertAndCopyButton = document.getElementById('convertAndCopyButton');
    const outputText = document.getElementById('outputText');
    const pasteButton = document.getElementById('pasteButton');
    const pasteAndConvertButton = document.getElementById('pasteAndConvertButton');

    // ヘルパー関数群
    const Utils = {
        // 改行コードをLFに正規化
        normalizeNewlines: (text) => {
            return text.replace(/\r\n|\r/g, '\n');
        },
        // 改行コードをCRLFに変換
        toCRLF: (text) => {
            return text.replace(/\n/g, '\r\n');
        }
    };

    // 変換ロジックをまとめた関数
    const performConversion = (textToConvert) => {
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
                // 空行には ">" のみ、それ以外には "> " を付加
                var linesForQuote = textToConvert.split('\n');
                var quotedText = '';

                // 各行に対して処理を行う
                linesForQuote.forEach((line, index) => {
                    if (index > 0) { // 最初の行以外は改行を追加
                        quotedText += '\n';
                    }
                    if (line.trim() === '') {
                        quotedText += '>'; // 空行（空白のみの行も含む）の場合
                    } else {
                        quotedText += '> ' + line; // それ以外の行の場合
                    }
                });
                convertedText = quotedText;
                break;
            case 'markdownNumberedList':
                // 空行をスキップして連番を振る
                var numberedLines = textToConvert.split('\n');
                var counter = 1;
                var processedNumberedLines = [];

                numberedLines.forEach(line => {
                    // 行頭・行末の空白をトリムし、その結果が空でない場合のみ処理
                    if (line.trim().length > 0) {
                        processedNumberedLines.push(`${counter}. ${line}`);
                        counter++;
                    }
                    // 空行（空白のみの行も含む）の場合は何もせずスキップする
                });
                convertedText = processedNumberedLines.join('\n');
                break;
            case 'markdownNumberedList':
                const lines = textToConvert.split('\n');
                convertedText = lines.map((line, index) => `${index + 1}. ${line}`).join('\n');
                break;
            case 'geminiNewlineFix':
                // 1. 3つ連続する改行を2つに減らす
                var tempText = textToConvert.replace(/\n\n\n/g, '\n\n');
                // 2. その結果に対して、2つ連続する改行を1つに減らす
                convertedText = tempText.replace(/\n\n/g, '\n');
                // 3. NBSP(ノーブレークスペース)を半角スペースに変換する
                convertedText = convertedText.replace(/\u00A0/g, ' ');
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
            case 'quoteAndHalfwidthSpace':
                // 1. 全角スペースを半角スペースに統一
                var tempText = textToConvert.replace(/　/g, ' ');

                // 2. 空行には ">" のみ、それ以外には "> " を付加
                var linesForQuoteAndSpace = tempText.split('\n');
                var quotedAndSpacedText = '';

                linesForQuoteAndSpace.forEach((line, index) => {
                    if (index > 0) { // 最初の行以外は改行を追加
                        quotedAndSpacedText += '\n';
                    }
                    if (line.trim() === '') {
                        quotedAndSpacedText += '>'; // 空行（空白のみの行も含む）の場合
                    } else {
                        quotedAndSpacedText += '> ' + line; // それ以外の行の場合
                    }
                });
                convertedText = quotedAndSpacedText;
                break;
            default:
                convertedText = textToConvert;
        }
        return convertedText;
    };

    // クリップボードへのコピーと結果表示をまとめた関数
    const copyToClipboardAndShowResult = async (text) => {
        outputText.value = text; // まず出力エリアに結果を表示
        try {
            await navigator.clipboard.writeText(text);
            alert('変換結果をクリップボードにコピーしました！'); // 成功メッセージを一本化
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

    // 貼り付けて変換ボタンのイベントリスナー
    pasteAndConvertButton.addEventListener('click', async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            inputText.value = clipboardText; // まず入力欄に貼り付け

            // 貼り付けたテキストを正規化し、変換ロジックを呼び出す
            const textToConvert = Utils.normalizeNewlines(inputText.value);
            const convertedText = performConversion(textToConvert);

            await copyToClipboardAndShowResult(convertedText); // 変換結果を出力し、コピーする
        } catch (err) {
            console.error('貼り付けと変換に失敗しました:', err);
            alert('貼り付けと変換に失敗しました。ブラウザのセキュリティ設定を確認してください。');
        }
    });

    // 変換してコピーボタンのイベントリスナー
    convertAndCopyButton.addEventListener('click', async () => {
        const textToConvert = Utils.normalizeNewlines(inputText.value);
        const convertedText = performConversion(textToConvert);

        await copyToClipboardAndShowResult(convertedText); // 変換結果を出力し、コピーする
    });
});