import { showToast } from './modules/toast.js';
import { initTheme } from './modules/theme.js';
import { CookieUtils, Utils } from './modules/utils.js';
import { converters } from './modules/converters.js';
import { AIDetector } from './modules/ai-detector.js';

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

    // ── Dark Mode ─────────────────────────────────────────────────────────────
    initTheme(themeToggle);

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