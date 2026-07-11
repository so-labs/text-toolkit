document.addEventListener('DOMContentLoaded', () => {
    // ── DOM References ───────────────────────────────────────────────────────
    const inputText            = document.getElementById('inputText');
    const conversionType       = document.getElementById('conversionType');
    const convertAndCopyButton = document.getElementById('convertAndCopyButton');
    const outputText           = document.getElementById('outputText');
    const pasteButton          = document.getElementById('pasteButton');
    const pasteAndConvertButton= document.getElementById('pasteAndConvertButton');
    const themeToggle          = document.getElementById('themeToggle');
    const consentModal         = document.getElementById('consentModal');
    const consentApproveBtn    = document.getElementById('consentApproveBtn');
    const consentCancelBtn     = document.getElementById('consentCancelBtn');
    const clearInputButton     = document.getElementById('clearInputButton');
    const copyOutputButton     = document.getElementById('copyOutputButton');
    const clearSelectionBtn    = document.getElementById('clearSelectionBtn');
    const selectedBadge        = document.getElementById('selectedBadge');
    const selectedBadgeText    = document.getElementById('selectedBadgeText');
    const tiles                = document.querySelectorAll('.tile');

    // ── Toast Notification System ─────────────────────────────────────────────
    const toastContainer = document.getElementById('toastContainer');

    /**
     * トースト通知を表示する
     * @param {string} message  表示するメッセージ
     * @param {'success'|'error'|'info'|'warning'} type  トーストの種類
     * @param {number} duration  表示時間 (ms)
     */
    const showToast = (message, type = 'info', duration = 3000) => {
        const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-msg">${message}</span>
        `;
        toastContainer.appendChild(toast);

        // 自動削除
        const remove = () => {
            toast.classList.add('toast-out');
            toast.addEventListener('animationend', () => toast.remove(), { once: true });
        };
        const timer = setTimeout(remove, duration);

        // クリックでも閉じられる
        toast.addEventListener('click', () => {
            clearTimeout(timer);
            remove();
        });
    };

    // ── Dark Mode ─────────────────────────────────────────────────────────────
    const applyTheme = (theme) => {
        const root   = document.documentElement;
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

    const savedTheme       = localStorage.getItem('theme');
    const systemPrefersDark= window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme     = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    applyTheme(initialTheme);

    themeToggle.addEventListener('click', () => {
        const isDark   = document.body.classList.contains('dark-mode');
        const newTheme = isDark ? 'light' : 'dark';
        document.documentElement.classList.add('theme-transition');
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        window.setTimeout(() => {
            document.documentElement.classList.remove('theme-transition');
        }, 420);
    });

    // ── Tile Picker ────────────────────────────────────────────────────────────
    /** タイルのラベルテキストを取得 */
    const getTileLabel = (tile) => {
        const nameEl = tile.querySelector('.tile-name');
        // small タグを除いたテキストのみ
        const clone = nameEl.cloneNode(true);
        clone.querySelectorAll('small').forEach(s => s.remove());
        return clone.textContent.trim();
    };

    /** 選択状態を更新する */
    const selectTile = (tile) => {
        // 全タイルの selected を解除
        tiles.forEach(t => t.classList.remove('selected'));

        if (!tile) {
            conversionType.value = '';
            selectedBadge.classList.add('hidden');
            return;
        }

        tile.classList.add('selected');
        conversionType.value = tile.dataset.value;

        const label = getTileLabel(tile);
        const icon  = tile.querySelector('.tile-icon').textContent;
        selectedBadgeText.textContent = `${icon} ${label}`;
        selectedBadge.classList.remove('hidden');

        // スムーズに選択バッジまでスクロール（スマホ向け）
        selectedBadge.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    tiles.forEach(tile => {
        tile.addEventListener('click', () => {
            // 既に選択済みならトグル解除
            if (tile.classList.contains('selected')) {
                selectTile(null);
            } else {
                selectTile(tile);
            }
        });
    });

    clearSelectionBtn.addEventListener('click', () => selectTile(null));

    // ── Clear Input Button ────────────────────────────────────────────────────
    clearInputButton.addEventListener('click', () => {
        inputText.value = '';
        inputText.focus();
    });

    // ── Copy Output Button ────────────────────────────────────────────────────
    copyOutputButton.addEventListener('click', async () => {
        if (!outputText.value) return;
        try {
            await navigator.clipboard.writeText(outputText.value);
            showToast('クリップボードにコピーしました！', 'success');
        } catch {
            showToast('コピーに失敗しました。手動でコピーしてください。', 'error');
        }
    });

    // ── Cookie Utilities ──────────────────────────────────────────────────────
    const CookieUtils = {
        set: (name, value, days) => {
            let expires = '';
            if (days) {
                const date = new Date();
                date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
                expires = '; expires=' + date.toUTCString();
            }
            document.cookie = name + '=' + (value || '') + expires + '; path=/; SameSite=Lax';
        },
        get: (name) => {
            const nameEQ = name + '=';
            const ca = document.cookie.split(';');
            for (let c of ca) {
                c = c.trim();
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
            }
            return null;
        }
    };

    // ── Conversion Helpers ────────────────────────────────────────────────────
    const Utils = {
        normalizeNewlines: (text) => text.replace(/\r\n|\r/g, '\n'),
        toCRLF: (text) => text.replace(/\n/g, '\r\n'),
        createCodeBlock: (lang, text) => {
            const matches   = text.match(/^`+/gm) || [];
            const maxTicks  = matches.length > 0 ? Math.max(...matches.map(m => m.length)) : 0;
            const tickCount = Math.max(3, maxTicks + 1);
            const fence     = '`'.repeat(tickCount);
            return `${fence}${lang}\n${text}\n${fence}`;
        }
    };

    // ── Consent Modal ─────────────────────────────────────────────────────────
    const showConsentModal = () => new Promise((resolve) => {
        consentModal.classList.remove('hidden');

        const handleApprove = () => { cleanup(); resolve(true);  };
        const handleCancel  = () => { cleanup(); resolve(false); };
        const cleanup = () => {
            consentModal.classList.add('hidden');
            consentApproveBtn.removeEventListener('click', handleApprove);
            consentCancelBtn.removeEventListener('click', handleCancel);
        };

        consentApproveBtn.addEventListener('click', handleApprove);
        consentCancelBtn.addEventListener('click', handleCancel);
    });

    // ── Converters ────────────────────────────────────────────────────────────
    const converters = {
        adjustKagikakko: (text) => {
            let nestingLevel = 0;
            let result = '';
            for (const char of text) {
                if (char === '「' || char === '『') {
                    nestingLevel++;
                    result += (nestingLevel % 2 !== 0) ? '「' : '『';
                } else if (char === '」' || char === '』') {
                    result += (nestingLevel % 2 !== 0) ? '」' : '』';
                    if (nestingLevel > 0) nestingLevel--;
                } else {
                    result += char;
                }
            }
            return result;
        },
        trimWhitespace:          (text) => text.replace(/^[ ]+/gm, ''),
        stripTrailingWhitespace: (text) => text.replace(/[ ]+$/gm, ''),
        spaceToFullwidth:        (text) => text.replace(/ /g, '　'),
        spaceToHalfwidth:        (text) => text.replace(/　/g, ' '),
        markdownQuote: (text) => {
            return text.split('\n').map(l => l.trim() === '' ? '>' : '> ' + l).join('\n');
        },
        markdownBulletList: (text) => {
            return text.split('\n').filter(l => l.trim().length > 0).map(l => `- ${l}`).join('\n');
        },
        markdownNumberedList: (text) => {
            let counter = 1;
            return text.split('\n').filter(l => l.trim().length > 0).map(l => `${counter++}. ${l}`).join('\n');
        },
        geminiNewlineFix: (text) => {
            const tmp = text.replace(/\n\n\n/g, '\n\n');
            return tmp.replace(/\n\n/g, '\n').replace(/ /g, ' ');
        },
        codeBlockAuto: async (text) => {
            const detectedLang = await AIDetector.detect(text);
            return Utils.createCodeBlock(detectedLang, text);
        },
        codeBlockMarkdown: (text) => Utils.createCodeBlock('markdown', text),
        codeBlockPython:   (text) => Utils.createCodeBlock('python', text),
        codeBlockJs:       (text) => Utils.createCodeBlock('javascript', text),
        codeBlockGeneric:  (text) => Utils.createCodeBlock('', text),
        newlinesToSlash:   (text) => text.replace(/\n/g, ' / '),
        newlinesToSpace:   (text) => text.replace(/\n/g, ' '),
        markdownGeminiFix: (text) => {
            return text
                .replace(/ /g, ' ')
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
                .replace(/^([ ]+)- /gm, (match, spaces) => '  '.repeat(Math.ceil(spaces.length / 4)) + '- ')
                .replace(/\n{3,}/g, '\n\n')
                .trim();
        },
        base64Encode: (text) => btoa(unescape(encodeURIComponent(text))),
        base64Decode: (text) => {
            try { return decodeURIComponent(escape(atob(text))); }
            catch { return '【エラー】有効なBase64文字列ではありません'; }
        },
        urlEncode: (text) => encodeURIComponent(text),
        urlDecode: (text) => {
            try { return decodeURIComponent(text); }
            catch { return '【エラー】有効なURLエンコード文字列ではありません'; }
        }
    };

    // ── Core Logic ────────────────────────────────────────────────────────────
    const performConversion = async (text) => {
        const selectedType = conversionType.value;
        const converter    = converters[selectedType];
        return converter ? await converter(text) : text;
    };

    const setButtonsBusy = (busy) => {
        convertAndCopyButton.disabled  = busy;
        pasteAndConvertButton.disabled = busy;
    };

    const copyToClipboardAndShowResult = async (text) => {
        outputText.value = text;
        try {
            await navigator.clipboard.writeText(text);
            showToast('変換結果をクリップボードにコピーしました！', 'success');
        } catch {
            // フォールバック
            try {
                outputText.select();
                document.execCommand('copy');
                showToast('変換結果をクリップボードにコピーしました！', 'success');
            } catch {
                showToast('コピーに失敗しました。手動でコピーしてください。', 'error', 5000);
            }
        }
    };

    const runConversion = async () => {
        if (!conversionType.value) {
            showToast('変換機能を選択してください。', 'warning');
            // 選択エリアへスクロール
            document.getElementById('conversionPicker')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        const textToConvert = Utils.normalizeNewlines(inputText.value);
        const needsDetection = conversionType.value === 'codeBlockAuto';

        if (needsDetection) {
            const consent = CookieUtils.get('ai_detector_consent');
            if (consent !== 'true') {
                const approved = await showConsentModal();
                if (!approved) return;
                CookieUtils.set('ai_detector_consent', 'true', 365);
            }
        }

        setButtonsBusy(true);

        if (needsDetection) {
            outputText.value = '🤖 AIが言語を判定中…';
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
            outputText.value = '【エラー】変換またはコピーに失敗しました。\n\n' + textToConvert;
            throw err;
        } finally {
            setButtonsBusy(false);
        }
    };

    // ── Event Listeners ───────────────────────────────────────────────────────

    // 貼り付けボタン
    pasteButton.addEventListener('click', async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            inputText.value = clipboardText;
            showToast('クリップボードからテキストを貼り付けました！', 'info');
        } catch {
            showToast('クリップボードからの貼り付けに失敗しました。ブラウザのセキュリティ設定を確認するか、手動で貼り付けてください。', 'error', 5000);
        }
    });

    // 貼り付けて変換ボタン
    pasteAndConvertButton.addEventListener('click', async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            inputText.value = clipboardText;
            await runConversion();
        } catch (err) {
            console.error('貼り付けと変換に失敗しました:', err);
            showToast('貼り付けと変換に失敗しました。ブラウザのセキュリティ設定を確認してください。', 'error', 5000);
            setButtonsBusy(false);
        }
    });

    // 変換してコピーボタン
    convertAndCopyButton.addEventListener('click', async () => {
        try {
            await runConversion();
        } catch (err) {
            console.error('変換に失敗しました:', err);
            showToast('変換に失敗しました。', 'error');
            setButtonsBusy(false);
        }
    });

});