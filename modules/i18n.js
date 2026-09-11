// i18n 多言語対応モジュール

export const translations = {
    ja: {
        // Header
        'header.title': 'TextToolkit',
        'header.subtitle': 'シンプルで使いやすいテキスト整形・変換ツール',

        // Settings Menu
        'settings.toggle': '設定',
        'settings.title': '⚙️ 設定',
        'settings.close': '閉じる',
        'settings.theme': 'テーマ',
        'settings.themeLightBtn': 'ライト',
        'settings.themeDarkBtn': 'ダーク',
        'settings.themeSystemBtn': 'システム',
        'settings.lang': '言語',
        'settings.debugMode': 'デバッグモード',
        'settings.debugModeDesc': '動作検証・デバッグ用の拡張設定',
        'settings.bubbleMode': 'バブルモード 🫧',
        'settings.bubbleModeDesc': 'フローティング表示でクイック変換',

        // Input Section
        'input.label': '変換したいテキスト',
        'input.placeholder': 'ここにテキストを入力してください…',
        'input.clearAria': 'クリア',
        'input.clearTitle': 'テキストをクリア',

        // Conversion Section
        'conversion.label': '変換機能を選択',
        'conversion.selectAria': '変換タイプ',
        'conversion.selectPlaceholder': '変換機能を選択してください',

        // Tabs
        'tab.ai': 'AI機能',
        'tab.codeblock': 'コードブロック',
        'tab.textformat': 'テキスト整形',
        'tab.whitespace': '空白・改行',
        'tab.encode': 'エンコード',

        // Picker Group Labels
        'group.ai': '🤖 AI機能',
        'group.codeblock': '💻 コードブロック化',
        'group.textformat': '✍️ テキスト整形・リスト化',
        'group.whitespace': '🔄 空白・改行の変換',
        'group.encode': '🔐 エンコード・デコード',

        // Tiles - AI
        'tile.codeBlockAuto': '言語自動判定',
        'tile.codeBlockAutoSub': '(コードブロック)',
        'tile.tableFormatter': 'テーブル整形',
        'tile.tableFormatterSub': '(Markdown)',

        // Tiles - Code Block
        'tile.codeBlockMarkdown': 'Markdown',
        'tile.codeBlockJs': 'JavaScript',
        'tile.codeBlockPython': 'Python',
        'tile.codeBlockPlaintext': 'Plaintext',
        'tile.codeBlockGeneric': '汎用',

        // Tiles - Text Format
        'tile.markdownGeminiFix': 'Markdown修正',
        'tile.markdownGeminiFixSub': '(Gemini用)',
        'tile.geminiNewlineFix': 'Gemini改行修正',
        'tile.adjustKagikakko': '括弧ネスト調整',
        'tile.markdownQuote': '引用ブロック',
        'tile.markdownBulletList': '箇条書きリスト',
        'tile.markdownNumberedList': '番号付きリスト',

        // Tiles - Whitespace
        'tile.stripTrailingWhitespace': '行末空白削除',
        'tile.trimWhitespace': '行頭空白削除',
        'tile.spaceToFullwidth': '半角→全角スペース',
        'tile.spaceToHalfwidth': '全角→半角スペース',
        'tile.newlinesToSlash': '改行→スラッシュ',
        'tile.newlinesToSpace': '改行→スペース',
        'tile.newlinesToLiteralN': '改行→\\n文字列',

        // Tiles - Encode
        'tile.base64Encode': 'Base64エンコード',
        'tile.base64Decode': 'Base64デコード',
        'tile.urlEncode': 'URLエンコード',
        'tile.urlDecode': 'URLデコード',

        // Hidden Select Options
        'option.codeBlockAuto': '言語自動判定 (コードブロック)',
        'option.tableFormatter': 'テーブル整形 (Markdown)',
        'option.codeBlockMarkdown': 'コードブロック (markdown)',
        'option.codeBlockJs': 'コードブロック (javascript)',
        'option.codeBlockPython': 'コードブロック (python)',
        'option.codeBlockPlaintext': 'コードブロック (plaintext)',
        'option.codeBlockGeneric': 'コードブロック (汎用)',
        'option.markdownGeminiFix': 'Markdown修正 (Gemini用)',
        'option.geminiNewlineFix': 'Gemini改行修正',
        'option.adjustKagikakko': '括弧のネスト自動調整',
        'option.markdownQuote': 'Markdown引用 (>)',
        'option.markdownBulletList': 'Markdown箇条書き (-)',
        'option.markdownNumberedList': 'Markdown番号付きリスト',
        'option.stripTrailingWhitespace': '行末の空白削除',
        'option.trimWhitespace': '行頭の空白削除',
        'option.spaceToFullwidth': '半角スペース → 全角統一',
        'option.spaceToHalfwidth': '全角スペース → 半角統一',
        'option.newlinesToSlash': '改行 → " / " に変換',
        'option.newlinesToSpace': '改行 → 半角スペースに変換',
        'option.newlinesToLiteralN': '改行 → \\n という文字列に変換',
        'option.base64Encode': 'Base64エンコード',
        'option.base64Decode': 'Base64デコード',
        'option.urlEncode': 'URLエンコード',
        'option.urlDecode': 'URLデコード',

        // Selected Badge
        'badge.clearAria': '選択解除',

        // Action Buttons
        'action.pasteAndConvert.title': '貼り付けて変換',
        'action.pasteAndConvert.sub': 'クリップボード → 変換 → コピー',
        'action.convertAndCopy.title': '変換してコピー',
        'action.convertAndCopy.sub': '入力内容を変換',
        'action.pasteOnly.title': '貼り付けのみ',
        'action.pasteOnly.sub': 'クリップボードから入力',
        'action.cancelAi.title': 'AI処理をキャンセル',
        'action.cancelAi.sub': '処理を中止して元の状態に戻します',

        // Bubble Mode Button Text
        'bubble.convert': '変換',
        'bubble.convertSub': 'クリップボードを直接変換',
        'bubble.converting': '変換中...',
        'bubble.convertingSub': '処理が終わるまでお待ちください',

        // Output Section
        'output.label': '変換結果',
        'output.hint': '（自動コピーされます）',
        'output.placeholder': '変換結果がここに表示されます…',
        'output.copyAria': 'コピー',
        'output.copyTitle': 'クリップボードにコピー',

        // Footer
        'footer.disclaimer': '⚠️ AI機能（自動判定・テーブル整形等）はPuterおよび外部AI APIを利用しています。結果の正確性は保証されません。入力内容に機密情報を含めないでください。本ツールは技術検証・実験用途を含みます。',

        // Consent Modal
        'consent.title': 'AI機能の利用確認',
        'consent.body': 'AI機能を利用する際、入力内容が外部AIプロバイダ（PuterおよびOpenAI等）のサーバーへ送信されます。機密情報などを入力しないようご注意ください。よろしいですか？',
        'consent.cancel': 'キャンセル',
        'consent.approve': '同意して実行',

        // Toast Messages
        'toast.copySuccess': 'クリップボードにコピーしました！',
        'toast.copyFailed': 'コピーに失敗しました。手動でコピーしてください。',
        'toast.pasteSuccess': 'クリップボードからテキストを貼り付けました！',
        'toast.pasteFailed': 'クリップボードからの貼り付けに失敗しました。ブラウザのセキュリティ設定を確認するか、手動で貼り付けてください。',
        'toast.convertCopySuccess': '変換結果をクリップボードにコピーしました！',
        'toast.convertCopyFailed': 'コピーに失敗しました。手動でコピーしてください。',
        'toast.selectConversion': '変換機能を選択してください。',
        'toast.clipboardEmpty': 'クリップボードが空です。',
        'toast.clipboardReadFailed': 'クリップボードからの読み取りに失敗しました。',
        'toast.aiProcessing': 'AI処理を開始しました…',
        'toast.aiTimeout': 'AI処理がタイムアウトしました。',
        'toast.aiCancelled': 'AI処理をキャンセルしました。',
        'toast.pasteConvertFailed': '貼り付けと変換に失敗しました。ブラウザのセキュリティ設定を確認してください。',
        'toast.convertFailed': '変換に失敗しました。',

        // Error Messages
        'error.conversionFailed': '【エラー】変換またはコピーに失敗しました。',
        'error.aiProcessing': '🤖 AIが処理中…',
        'error.base64Invalid': '【エラー】有効なBase64文字列ではありません',
        'error.urlEncodeInvalid': '【エラー】有効なURLエンコード文字列ではありません',
    },
    en: {
        // Header
        'header.title': 'TextToolkit',
        'header.subtitle': 'Simple & easy text formatting & conversion tool',

        // Settings Menu
        'settings.toggle': 'Settings',
        'settings.title': '⚙️ Settings',
        'settings.close': 'Close',
        'settings.theme': 'Theme',
        'settings.themeLightBtn': 'Light',
        'settings.themeDarkBtn': 'Dark',
        'settings.themeSystemBtn': 'System',
        'settings.lang': 'Language',
        'settings.debugMode': 'Debug Mode',
        'settings.debugModeDesc': 'Advanced settings for debugging',
        'settings.bubbleMode': 'Bubble Mode 🫧',
        'settings.bubbleModeDesc': 'Floating display for quick conversion',

        // Input Section
        'input.label': 'Text to convert',
        'input.placeholder': 'Enter your text here…',
        'input.clearAria': 'Clear',
        'input.clearTitle': 'Clear text',

        // Conversion Section
        'conversion.label': 'Select conversion',
        'conversion.selectAria': 'Conversion type',
        'conversion.selectPlaceholder': 'Select a conversion',

        // Tabs
        'tab.ai': 'AI Features',
        'tab.codeblock': 'Code Block',
        'tab.textformat': 'Text Format',
        'tab.whitespace': 'Whitespace',
        'tab.encode': 'Encode',

        // Picker Group Labels
        'group.ai': '🤖 AI Features',
        'group.codeblock': '💻 Code Block Wrapping',
        'group.textformat': '✍️ Text Formatting & Lists',
        'group.whitespace': '🔄 Whitespace & Newline Conversion',
        'group.encode': '🔐 Encoding & Decoding',

        // Tiles - AI
        'tile.codeBlockAuto': 'Auto-detect Language',
        'tile.codeBlockAutoSub': '(Code Block)',
        'tile.tableFormatter': 'Table Formatter',
        'tile.tableFormatterSub': '(Markdown)',

        // Tiles - Code Block
        'tile.codeBlockMarkdown': 'Markdown',
        'tile.codeBlockJs': 'JavaScript',
        'tile.codeBlockPython': 'Python',
        'tile.codeBlockPlaintext': 'Plaintext',
        'tile.codeBlockGeneric': 'Generic',

        // Tiles - Text Format
        'tile.markdownGeminiFix': 'Markdown Fix',
        'tile.markdownGeminiFixSub': '(for Gemini)',
        'tile.geminiNewlineFix': 'Gemini Newline Fix',
        'tile.adjustKagikakko': 'Bracket Nesting Fix',
        'tile.markdownQuote': 'Quote Block',
        'tile.markdownBulletList': 'Bullet List',
        'tile.markdownNumberedList': 'Numbered List',

        // Tiles - Whitespace
        'tile.stripTrailingWhitespace': 'Strip Trailing Spaces',
        'tile.trimWhitespace': 'Strip Leading Spaces',
        'tile.spaceToFullwidth': 'Half → Full-width Space',
        'tile.spaceToHalfwidth': 'Full → Half-width Space',
        'tile.newlinesToSlash': 'Newline → Slash',
        'tile.newlinesToSpace': 'Newline → Space',
        'tile.newlinesToLiteralN': 'Newline → \\n String',

        // Tiles - Encode
        'tile.base64Encode': 'Base64 Encode',
        'tile.base64Decode': 'Base64 Decode',
        'tile.urlEncode': 'URL Encode',
        'tile.urlDecode': 'URL Decode',

        // Hidden Select Options
        'option.codeBlockAuto': 'Auto-detect Language (Code Block)',
        'option.tableFormatter': 'Table Formatter (Markdown)',
        'option.codeBlockMarkdown': 'Code Block (markdown)',
        'option.codeBlockJs': 'Code Block (javascript)',
        'option.codeBlockPython': 'Code Block (python)',
        'option.codeBlockPlaintext': 'Code Block (plaintext)',
        'option.codeBlockGeneric': 'Code Block (generic)',
        'option.markdownGeminiFix': 'Markdown Fix (for Gemini)',
        'option.geminiNewlineFix': 'Gemini Newline Fix',
        'option.adjustKagikakko': 'Auto Bracket Nesting',
        'option.markdownQuote': 'Markdown Quote (>)',
        'option.markdownBulletList': 'Markdown Bullet List (-)',
        'option.markdownNumberedList': 'Markdown Numbered List',
        'option.stripTrailingWhitespace': 'Strip Trailing Whitespace',
        'option.trimWhitespace': 'Strip Leading Whitespace',
        'option.spaceToFullwidth': 'Half-width → Full-width Space',
        'option.spaceToHalfwidth': 'Full-width → Half-width Space',
        'option.newlinesToSlash': 'Newline → " / "',
        'option.newlinesToSpace': 'Newline → Space',
        'option.newlinesToLiteralN': 'Newline → "\\n" String',
        'option.base64Encode': 'Base64 Encode',
        'option.base64Decode': 'Base64 Decode',
        'option.urlEncode': 'URL Encode',
        'option.urlDecode': 'URL Decode',

        // Selected Badge
        'badge.clearAria': 'Deselect',

        // Action Buttons
        'action.pasteAndConvert.title': 'Paste & Convert',
        'action.pasteAndConvert.sub': 'Clipboard → Convert → Copy',
        'action.convertAndCopy.title': 'Convert & Copy',
        'action.convertAndCopy.sub': 'Convert input text',
        'action.pasteOnly.title': 'Paste Only',
        'action.pasteOnly.sub': 'Paste from clipboard',
        'action.cancelAi.title': 'Cancel AI Process',
        'action.cancelAi.sub': 'Abort and restore original state',

        // Bubble Mode Button Text
        'bubble.convert': 'Convert',
        'bubble.convertSub': 'Convert clipboard directly',
        'bubble.converting': 'Converting...',
        'bubble.convertingSub': 'Please wait until processing completes',

        // Output Section
        'output.label': 'Conversion Result',
        'output.hint': '(auto-copied)',
        'output.placeholder': 'Conversion result will appear here…',
        'output.copyAria': 'Copy',
        'output.copyTitle': 'Copy to clipboard',

        // Footer
        'footer.disclaimer': '⚠️ AI features (auto-detection, table formatting, etc.) use Puter and external AI APIs. Results are not guaranteed to be accurate. Do not include sensitive information. This tool includes experimental features.',

        // Consent Modal
        'consent.title': 'AI Feature Confirmation',
        'consent.body': 'When using AI features, your input will be sent to external AI providers (Puter, OpenAI, etc.). Please avoid entering sensitive information. Do you agree to proceed?',
        'consent.cancel': 'Cancel',
        'consent.approve': 'Agree & Proceed',

        // Toast Messages
        'toast.copySuccess': 'Copied to clipboard!',
        'toast.copyFailed': 'Failed to copy. Please copy manually.',
        'toast.pasteSuccess': 'Pasted text from clipboard!',
        'toast.pasteFailed': 'Failed to paste. Check browser security settings or paste manually.',
        'toast.convertCopySuccess': 'Conversion result copied to clipboard!',
        'toast.convertCopyFailed': 'Copy failed. Please copy manually.',
        'toast.selectConversion': 'Please select a conversion.',
        'toast.clipboardEmpty': 'Clipboard is empty.',
        'toast.clipboardReadFailed': 'Failed to read from clipboard.',
        'toast.aiProcessing': 'AI processing started…',
        'toast.aiTimeout': 'AI processing timed out.',
        'toast.aiCancelled': 'AI processing cancelled.',
        'toast.pasteConvertFailed': 'Paste & convert failed. Check browser security settings.',
        'toast.convertFailed': 'Conversion failed.',

        // Error Messages
        'error.conversionFailed': '[Error] Conversion or copy failed.',
        'error.aiProcessing': '🤖 AI processing…',
        'error.base64Invalid': '[Error] Not a valid Base64 string',
        'error.urlEncodeInvalid': '[Error] Not a valid URL-encoded string',
    }
};

const LANG_STORAGE_KEY = 'app-lang';
const listeners = new Set();

/**
 * ブラウザ言語を判定するヘルパー（未設定時のデフォルト）
 * @param {string[]|string|null} customLanguages - テスト用またはカスタムの言語リスト
 */
export function detectBrowserLanguage(customLanguages = null) {
    try {
        let lang = '';
        if (Array.isArray(customLanguages)) {
            lang = customLanguages.length > 0 ? (customLanguages[0] || '') : '';
        } else if (typeof customLanguages === 'string') {
            lang = customLanguages;
        } else if (typeof navigator !== 'undefined') {
            lang = (navigator.languages && navigator.languages[0]) || navigator.language || '';
        }
        return lang.toLowerCase().startsWith('ja') ? 'ja' : 'en';
    } catch {
        return 'en';
    }
}

/**
 * 現在の言語を取得 ('ja' | 'en')
 */
export function getLanguage() {
    try {
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem(LANG_STORAGE_KEY);
            if (saved === 'ja' || saved === 'en') {
                return saved;
            }
        }
    } catch { }
    return detectBrowserLanguage();
}

/**
 * 言語を設定 ('ja' | 'en')
 */
export function setLanguage(lang) {
    const validLang = lang === 'en' ? 'en' : 'ja';
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(LANG_STORAGE_KEY, validLang);
        }
    } catch { }

    if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.setAttribute('lang', validLang);
    }

    listeners.forEach((fn) => {
        try {
            fn(validLang);
        } catch (e) {
            console.error('i18n listener error:', e);
        }
    });

    return validLang;
}

/**
 * 翻訳キーから文字列を取得
 */
export function t(key, params = [], lang = getLanguage()) {
    const langDict = translations[lang] || translations.ja;
    let val = langDict ? langDict[key] : undefined;

    if (val === undefined && translations.ja) {
        // フォールバック（日本語辞書）
        val = translations.ja[key];
    }

    if (val === undefined) {
        return key;
    }

    if (!params || (Array.isArray(params) && params.length === 0)) {
        return val;
    }

    const paramArray = Array.isArray(params) ? params : [params];
    return val.replace(/\{(\d+)\}/g, (match, index) => {
        const idx = parseInt(index, 10);
        return paramArray[idx] !== undefined ? paramArray[idx] : match;
    });
}

/**
 * 言語変更イベントリスナーを登録
 */
export function onLanguageChange(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
}

/**
 * 指定要素配下の [data-i18n], [data-i18n-html], [data-i18n-placeholder], [data-i18n-title], [data-i18n-aria] を一括更新
 */
export function applyTranslations(root = document) {
    if (!root) return;

    const currentLang = getLanguage();

    // テキスト内容の更新: data-i18n="key"
    const textEls = root.querySelectorAll('[data-i18n]');
    textEls.forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (key) {
            el.textContent = t(key, [], currentLang);
        }
    });

    // HTML内容の更新: data-i18n-html="key"
    const htmlEls = root.querySelectorAll('[data-i18n-html]');
    htmlEls.forEach((el) => {
        const key = el.getAttribute('data-i18n-html');
        if (key) {
            el.innerHTML = t(key, [], currentLang);
        }
    });

    // placeholder
    const placeholderEls = root.querySelectorAll('[data-i18n-placeholder]');
    placeholderEls.forEach((el) => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (key) {
            el.setAttribute('placeholder', t(key, [], currentLang));
        }
    });

    // title
    const titleEls = root.querySelectorAll('[data-i18n-title]');
    titleEls.forEach((el) => {
        const key = el.getAttribute('data-i18n-title');
        if (key) {
            el.setAttribute('title', t(key, [], currentLang));
        }
    });

    // aria-label
    const ariaEls = root.querySelectorAll('[data-i18n-aria]');
    ariaEls.forEach((el) => {
        const key = el.getAttribute('data-i18n-aria');
        if (key) {
            el.setAttribute('aria-label', t(key, [], currentLang));
        }
    });
}
