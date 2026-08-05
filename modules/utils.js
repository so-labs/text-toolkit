export const CookieUtils = {
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

export const Utils = {
    normalizeNewlines: (text) => text.replace(/\r\n|\r/g, '\n'),
    toCRLF: (text) => text.replace(/\n/g, '\r\n'),
    createCodeBlock: (lang, text) => {
        const matches   = text.match(/^`+/gm) || [];
        const maxTicks  = matches.length > 0 ? Math.max(...matches.map(m => m.length)) : 0;
        const tickCount = Math.max(3, maxTicks + 1);
        const fence     = '`'.repeat(tickCount);
        return `${fence}${lang}\n${text}\n${fence}`;
    },
    getAppVersion: async (swPath = './sw.js') => {
        try {
            // ブラウザの強力なキャッシュを回避して最新の sw.js を読み込む
            const response = await fetch(swPath, { cache: 'no-store' });
            if (!response.ok) return 'Unknown';

            const text = await response.text();
            // 例: const CACHE_NAME = 'text-toolkit-2026.08-r1';
            const match = text.match(/CACHE_NAME\s*=\s*['"]text-toolkit-(.+?)['"]/);

            if (match && match[1]) {
                return match[1];
            }
        } catch (e) {
            console.warn('Failed to fetch app version from sw.js:', e);
        }
        return 'Unknown';
    }
};