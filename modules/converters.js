import { AIService } from './ai-service.js';
import { Utils } from './utils.js';

export const converters = {
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
    codeBlockAuto: async (text, signal) => {
        const detectedLang = await AIService.detectLanguage(text, signal);
        return Utils.createCodeBlock(detectedLang, text);
    },
    tableFormatter: async (text, signal) => await AIService.formatTable(text, signal),
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