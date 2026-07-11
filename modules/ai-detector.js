/**
 * ai-detector.js
 * Puter.js を使用したAI言語自動判定モジュール
**/

export const AIDetector = (() => {
    // --- Puter.js App ID 設定 ---
    const PUTER_APP_ID = 'app-0278050f-9197-4a67-8493-638ecfe6be05'; 
    const FALLBACK_LANG = '';
    const LANGUAGE_DETECT_MAX_CHARS = 4000;
    const PUTER_AI_MODEL = 'gpt-4o-mini'; // 使用するモデル

    // Puter.ai.chat の応答からテキストを取り出す
    const extractChatText = (response) => {
        if (typeof response === 'string') return response;
        const content = response?.message?.content;
        if (typeof content === 'string') return content;
        if (Array.isArray(content)) {
            return content.map(part => typeof part === 'string' ? part : (part?.text || '')).join('');
        }
        return '';
    };

    // 検出された言語名を標準化する
    const normalizeDetectedLanguage = (lang) => {
        if (!lang) return FALLBACK_LANG;
        lang = lang.trim().toLowerCase().replace(/[`"']/g, '');
        if (lang.length > 50 || /^(plaintext|text|unknown|none)$/i.test(lang)) {
            return FALLBACK_LANG;
        }
        return lang;
    };

    // Puter.js を動的にロードする（Lazy Load）
    const loadPuterScript = (signal) => {
        return new Promise((resolve, reject) => {
            if (typeof puter !== 'undefined') {
                resolve(true);
                return;
            }

            if (signal?.aborted) {
                reject(new DOMException('Aborted', 'AbortError'));
                return;
            }

            console.log('Puter.js を動的に読み込みます...');
            const script = document.createElement('script');
            script.src = 'https://js.puter.com/v2/';
            if (PUTER_APP_ID) {
                script.setAttribute('data-app-id', PUTER_APP_ID);
            }

            const onAbort = () => {
                script.remove();
                reject(new DOMException('Aborted', 'AbortError'));
            };

            if (signal) {
                signal.addEventListener('abort', onAbort);
            }

            script.onload = () => {
                if (signal) signal.removeEventListener('abort', onAbort);
                console.log('Puter.js の動的ロードに成功しました。');
                resolve(true);
            };
            script.onerror = () => {
                if (signal) signal.removeEventListener('abort', onAbort);
                console.warn('Puter.js の動的ロードに失敗しました。');
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    return {
        // ロード状態を保証する（ログインプロンプトは一切呼ばず、匿名で自動認証を利用）
        ensureAuth: async (signal) => {
            if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
            const loaded = await loadPuterScript(signal);
            if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
            if (!loaded || typeof puter === 'undefined') {
                console.warn('Puter.js が読み込まれていないか、ロードに失敗しました。');
                return false;
            }
            return true;
        },

        // AI言語自動判定の実行（ローカルでも本物のAIを直接呼び出します）
        detect: async (text, signal) => {
            if (!text.trim()) return FALLBACK_LANG;
            if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

            if (typeof puter === 'undefined' || !puter?.ai?.chat) {
                console.warn('Puter.js が読み込まれていません。汎用コードブロックとして出力します。');
                return FALLBACK_LANG;
            }

            const systemInstruction =
                'Analyze the syntax, keywords, and structure of the following text to identify its format. ' +
                'This could be a programming language, a markup language, or a data format. ' +
                `Respond with only the format name. If the text is not a recognizable language or format, return "${FALLBACK_LANG}".`;
            const sample = text.length > LANGUAGE_DETECT_MAX_CHARS
                ? text.slice(0, LANGUAGE_DETECT_MAX_CHARS)
                : text;
            const prompt =
                `Analyze the syntax, keywords, and structure of the following text:\n\n\`\`\`\n${sample}\n\`\`\``;

            try {
                const chatPromise = puter.ai.chat(
                    [
                        { role: 'system', content: systemInstruction },
                        { role: 'user', content: prompt },
                    ],
                    {
                        model: PUTER_AI_MODEL,
                        temperature: 0.1
                    }
                );

                if (signal) {
                    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
                    const abortPromise = new Promise((_, reject) => {
                        signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
                    });
                    const response = await Promise.race([chatPromise, abortPromise]);
                    return normalizeDetectedLanguage(extractChatText(response));
                } else {
                    const response = await chatPromise;
                    return normalizeDetectedLanguage(extractChatText(response));
                }
            } catch (err) {
                if (err.name === 'AbortError') throw err;
                console.error('言語判定に失敗しました:', err);
                return FALLBACK_LANG;
            }
        }
    };
})();
