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
    }
};