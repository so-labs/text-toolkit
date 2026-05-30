document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const conversionType = document.getElementById('conversionType');
    const convertAndCopyButton = document.getElementById('convertAndCopyButton');
    const outputText = document.getElementById('outputText');
    const pasteButton = document.getElementById('pasteButton');
    const pasteAndConvertButton = document.getElementById('pasteAndConvertButton');
    const themeToggle = document.getElementById('themeToggle');
    const consentModal = document.getElementById('consentModal');
    const consentApproveBtn = document.getElementById('consentApproveBtn');
    const consentCancelBtn = document.getElementById('consentCancelBtn');

    // ダークモード関連の処理
    const applyTheme = (theme) => {
        const root = document.documentElement;
        const bodyEl = document.body;
        if (theme === 'dark') {
            root.classList.add('dark-mode');
            bodyEl.classList.add('dark-mode');
            themeToggle.textContent = '☀️';
        } else {
            root.classList.remove('dark-mode');
            bodyEl.classList.remove('dark-mode');
            themeToggle.textContent = '🌙';
        }
    };

    // 初期化: localStorage または システム設定からテーマを決定
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    applyTheme(initialTheme);

    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-mode');
        const newTheme = isDark ? 'light' : 'dark';
        // Apply a short helper class to ensure CSS transitions are smooth
        document.documentElement.classList.add('theme-transition');
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        window.setTimeout(() => {
            document.documentElement.classList.remove('theme-transition');
        }, 420);
    });

    // Cookie操作ユーティリティ
    const CookieUtils = {
        set: (name, value, days) => {
            let expires = "";
            if (days) {
                const date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
        },
        get: (name) => {
            const nameEQ = name + "=";
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        }
    };

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

    // 同意確認を求めるプロミスを返す関数
    const showConsentModal = () => {
        return new Promise((resolve) => {
            consentModal.classList.remove('hidden');

            const handleApprove = () => {
                cleanup();
                resolve(true);
            };

            const handleCancel = () => {
                cleanup();
                resolve(false);
            };

            const cleanup = () => {
                consentModal.classList.add('hidden');
                consentApproveBtn.removeEventListener('click', handleApprove);
                consentCancelBtn.removeEventListener('click', handleCancel);
            };

            consentApproveBtn.addEventListener('click', handleApprove);
            consentCancelBtn.addEventListener('click', handleCancel);
        });
    };

    // 変換ロジックをまとめた関数
    const performConversion = async (textToConvert) => {
        const selectedType = conversionType.value;
        let convertedText = '';

        // コードブロック処理用の共通ロジック
        // 指定された言語と入力テキストから、適切なバッククォート数で囲んだ文字列を生成する
        const createCodeBlock = (lang, text) => {
            // 行頭にあるバッククォートの連続を検索（無関係なインラインバッククォートを除外）
            const matches = text.match(/^`+/gm) || [];
            // 最も長いバッククォートの列の長さを取得（なければ0）
            const maxTicks = matches.length > 0 ? Math.max(...matches.map(m => m.length)) : 0;
            // 囲うバッククォートの数は (最大数 + 1) か 3 の大きい方
            const tickCount = Math.max(3, maxTicks + 1);
            const fence = "`".repeat(tickCount);

            return `${fence}${lang}\n${text}\n${fence}`;
        };

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
            case 'geminiNewlineFix':
                // 1. 3つ連続する改行を2つに減らす
                var tempText = textToConvert.replace(/\n\n\n/g, '\n\n');
                // 2. その結果に対して、2つ連続する改行を1つに減らす
                convertedText = tempText.replace(/\n\n/g, '\n');
                // 3. NBSP(ノーブレークスペース)を半角スペースに変換する
                convertedText = convertedText.replace(/ /g, ' ');
                break;

            /* --- コードブロック自動判定ロジック適用 --- */
            case 'codeBlockAuto': {
                const detectedLang = await AIDetector.detect(textToConvert);
                convertedText = createCodeBlock(detectedLang, textToConvert);
                break;
            }
            case 'codeBlockMarkdown':
                convertedText = createCodeBlock('markdown', textToConvert);
                break;
            case 'codeBlockAhk':
                convertedText = createCodeBlock('autohotkey', textToConvert);
                break;
            case 'codeBlockPython':
                convertedText = createCodeBlock('python', textToConvert);
                break;
            case 'codeBlockJs':
                convertedText = createCodeBlock('javascript', textToConvert);
                break;
            case 'codeBlockGeneric':
                convertedText = createCodeBlock('', textToConvert);
                break;
            /* -------------------------------------- */

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
            case 'markdownGeminiFix':
                convertedText = textToConvert
                    // 1. NBSPを半角スペースに
                    .replace(/ /g, ' ')

                    // 2. 水平線の削除
                    .replace(/^\s*---\s*$/gm, '')

                    // 3. 強調内の全角括弧を分割する (例: **A（B）** -> **A**（**B**）)
                    // 強調の開始と終了の間に全角括弧がある場合、一旦強調を閉じて括弧を開き直す
                    .replace(/\*\*([^*]+)([「『（])(.*?)([」』）])\*\*/g, '**$1**$2**$3**$4')

                    // 4. 括弧の外側の強調を内側に移動 (例: **「A」** -> 「**A**」)
                    .replace(/\*\*([「『（])(.*?)([」』）])\*\*/g, '$1**$2**$3')

                    // --- 以下、リストや見出し、テーブルの修正 ---
                    .replace(/^(\s*)\* /gm, '$1- ')
                    .replace(/[ ]+\|/g, '|')
                    .replace(/\|[ ]+/g, '|')
                    .replace(/([^\n])\n(#+ )/g, '$1\n\n$2')
                    .replace(/^(#+ .+)$(?!\n\n)/gm, '$1\n')
                    .replace(/([^\n#\-])\n(- )/g, '$1\n\n$2')
                    .replace(/(\s*- .*)\n\n+(\s*- )/g, '$1\n$2')
                    .replace(/^([ ]+)- /gm, (match, spaces) => {
                        return '  '.repeat(Math.ceil(spaces.length / 4)) + '- ';
                    })
                    .replace(/\n{3,}/g, '\n\n')
                    .trim();
                break;
            case 'base64Encode':
                convertedText = btoa(unescape(encodeURIComponent(textToConvert)));
                break;
            case 'base64Decode': {
                try {
                    convertedText = decodeURIComponent(escape(atob(textToConvert)));
                } catch (e) {
                    convertedText = '【エラー】有効なBase64文字列ではありません';
                }
                break;
            }
            case 'urlEncode':
                convertedText = encodeURIComponent(textToConvert);
                break;
            case 'urlDecode': {
                try {
                    convertedText = decodeURIComponent(textToConvert);
                } catch (e) {
                    convertedText = '【エラー】有効なURLエンコード文字列ではありません';
                }
                break;
            }
            default:
                convertedText = textToConvert;
        }
        return convertedText;
    };

    const setButtonsBusy = (busy) => {
        convertAndCopyButton.disabled = busy;
        pasteAndConvertButton.disabled = busy;
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

    const runConversion = async () => {
        if (!conversionType.value) {
            alert('変換機能を選択してください。');
            return;
        }
        const textToConvert = Utils.normalizeNewlines(inputText.value);
        const needsDetection = conversionType.value === 'codeBlockAuto';

        if (needsDetection) {
            const consent = CookieUtils.get('ai_detector_consent');
            if (consent !== 'true') {
                const approved = await showConsentModal();
                if (!approved) {
                    // 同意されなかった場合は、静かに処理を中止
                    return;
                }
                CookieUtils.set('ai_detector_consent', 'true', 365); // 365日間保存
            }
        }

        setButtonsBusy(true);
        if (needsDetection) {
            outputText.value = 'AIが言語を判定中...';
        }

        try {
            if (needsDetection) {
                const authSuccess = await AIDetector.ensureAuth();
                if (!authSuccess) {
                    console.log('Puter認証がスキップされたか、またはローカル環境中のため、AI判定なしで汎用コードブロックを出力します。');
                }
            }
            const convertedText = await performConversion(textToConvert);
            await copyToClipboardAndShowResult(convertedText);
        } catch (err) {
            console.error('変換またはコピーに失敗しました:', err);
            // 失敗時は「判定中...」を消去し、エラー表記とともに元のテキストを書き戻す
            outputText.value = '【エラー】変換またはコピーに失敗しました。\n\n' + textToConvert;
            // クリックリスナー側でエラーダイアログをトリガーさせるために再スロー
            throw err;
        } finally {
            setButtonsBusy(false);
        }
    };

    // 貼り付けて変換ボタンのイベントリスナー
    pasteAndConvertButton.addEventListener('click', async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            inputText.value = clipboardText;
            await runConversion();
        } catch (err) {
            console.error('貼り付けと変換に失敗しました:', err);
            alert('貼り付けと変換に失敗しました。ブラウザのセキュリティ設定を確認してください。');
            setButtonsBusy(false);
        }
    });

    // 変換してコピーボタンのイベントリスナー
    convertAndCopyButton.addEventListener('click', async () => {
        try {
            await runConversion();
        } catch (err) {
            console.error('変換に失敗しました:', err);
            alert('変換に失敗しました。');
            setButtonsBusy(false);
        }
    });

});