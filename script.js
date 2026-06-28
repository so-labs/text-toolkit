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
        },
        // 指定された言語と入力テキストから、適切なバッククォート数で囲んだ文字列を生成する
        createCodeBlock: (lang, text) => {
            // 行頭にあるバッククォートの連続を検索（無関係なインラインバッククォートを除外）
            const matches = text.match(/^`+/gm) || [];
            // 最も長いバッククォートの列の長さを取得（なければ0）
            const maxTicks = matches.length > 0 ? Math.max(...matches.map(m => m.length)) : 0;
            // 囲うバッククォートの数は (最大数 + 1) か 3 の大きい方
            const tickCount = Math.max(3, maxTicks + 1);
            const fence = "`".repeat(tickCount);

            return `${fence}${lang}\n${text}\n${fence}`;
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

    // 変換タイプに応じた個別の変換処理マップ
    const converters = {
        adjustKagikakko: (text) => {
            let nestingLevel = 0;
            let convertedText = '';
            for (const char of text) {
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
            return convertedText;
        },
        trimWhitespace: (text) => text.replace(/^[ ]+/gm, ''),
        stripTrailingWhitespace: (text) => text.replace(/[ ]+$/gm, ''),
        spaceToFullwidth: (text) => text.replace(/ /g, '　'),
        spaceToHalfwidth: (text) => text.replace(/　/g, ' '),
        markdownQuote: (text) => {
            const lines = text.split('\n');
            return lines.map(line => line.trim() === '' ? '>' : '> ' + line).join('\n');
        },
        markdownBulletList: (text) => {
            const lines = text.split('\n');
            const processedLines = [];
            lines.forEach(line => {
                if (line.trim().length > 0) {
                    processedLines.push(`- ${line}`);
                }
            });
            return processedLines.join('\n');
        },
        markdownNumberedList: (text) => {
            const lines = text.split('\n');
            let counter = 1;
            const processedLines = [];
            lines.forEach(line => {
                if (line.trim().length > 0) {
                    processedLines.push(`${counter}. ${line}`);
                    counter++;
                }
            });
            return processedLines.join('\n');
        },
        geminiNewlineFix: (text) => {
            const tempText = text.replace(/\n\n\n/g, '\n\n');
            const convertedText = tempText.replace(/\n\n/g, '\n');
            return convertedText.replace(/ /g, ' ');
        },
        codeBlockAuto: async (text) => {
            const detectedLang = await AIDetector.detect(text);
            return Utils.createCodeBlock(detectedLang, text);
        },
        codeBlockMarkdown: (text) => Utils.createCodeBlock('markdown', text),
        codeBlockPython: (text) => Utils.createCodeBlock('python', text),
        codeBlockJs: (text) => Utils.createCodeBlock('javascript', text),
        codeBlockGeneric: (text) => Utils.createCodeBlock('', text),
        newlinesToSlash: (text) => text.replace(/\n/g, ' / '),
        newlinesToSpace: (text) => text.replace(/\n/g, ' '),
        markdownGeminiFix: (text) => {
            return text
                .replace(/ /g, ' ')
                .replace(/^\s*---\s*$/gm, '')
                .replace(/\*\*([^*]+)([「\『（])(.*?)([」\』）])\*\*/g, '**$1**$2**$3**$4')
                .replace(/\*\*([「\『（])(.*?)([」\』）])\*\*/g, '$1**$2**$3')
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
        },
        base64Encode: (text) => btoa(unescape(encodeURIComponent(text))),
        base64Decode: (text) => {
            try {
                return decodeURIComponent(escape(atob(text)));
            } catch (e) {
                return '【エラー】有効なBase64文字列ではありません';
            }
        },
        urlEncode: (text) => encodeURIComponent(text),
        urlDecode: (text) => {
            try {
                return decodeURIComponent(text);
            } catch (e) {
                return '【エラー】有効なURLエンコード文字列ではありません';
            }
        }
    };

    // 変換ロジックをまとめた関数
    const performConversion = async (textToConvert) => {
        const selectedType = conversionType.value;
        const converter = converters[selectedType];
        if (converter) {
            return await converter(textToConvert);
        }
        return textToConvert;
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