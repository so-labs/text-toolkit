import { showToast } from './modules/toast.js';
import { initTheme } from './modules/theme.js';
import { CookieUtils, Utils } from './modules/utils.js';
import { converters } from './modules/converters.js';
import { AIDetector } from './modules/ai-detector.js';

document.addEventListener('DOMContentLoaded', () => {
    // ── State ───────────────────────────────────────────────────────────────
    let activeAbortController = null;

    // ── DOM References ───────────────────────────────────────────────────────
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
    const clearInputButton = document.getElementById('clearInputButton');
    const copyOutputButton = document.getElementById('copyOutputButton');
    const clearSelectionBtn = document.getElementById('clearSelectionBtn');
    const selectedBadge = document.getElementById('selectedBadge');
    const selectedBadgeText = document.getElementById('selectedBadgeText');
    const tiles = document.querySelectorAll('.tile');
    const cancelDetectionContainer = document.getElementById('cancelDetectionContainer');
    const cancelDetectionButton = document.getElementById('cancelDetectionButton');

    // ── Dark Mode ─────────────────────────────────────────────────────────────
    initTheme(themeToggle);

    // ── Tab Navigation ────────────────────────────────────────────────────────
    const tabBtns = document.querySelectorAll('#conversionTabs .tab-btn');
    const pickerGroups = document.querySelectorAll('#conversionPicker .picker-group');

    const switchTab = (targetTabName) => {
        tabBtns.forEach(btn => {
            if (btn.dataset.tab === targetTabName) {
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            }
        });

        pickerGroups.forEach(group => {
            if (group.dataset.group === targetTabName) {
                group.classList.add('active');
            } else {
                group.classList.remove('active');
            }
        });
    };

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });

    // 初期状態のタブを選択（ブラウザの自動復元値を考慮）
    const initialValue = conversionType.value;
    let initialTab = 'codeblock';
    if (initialValue) {
        const matchingTile = document.querySelector(`.tile[data-value="${initialValue}"]`);
        if (matchingTile) {
            const group = matchingTile.closest('.picker-group');
            if (group && group.dataset.group) {
                initialTab = group.dataset.group;
                selectTile(matchingTile);
            }
        }
    }
    switchTab(initialTab);

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
        const icon = tile.querySelector('.tile-icon').textContent;
        selectedBadgeText.textContent = `${icon} ${label}`;
        selectedBadge.classList.remove('hidden');

        // スムーズに選択バッジまでスクロール（スマホ向け）
        selectedBadge.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    tiles.forEach(tile => {
        let isScrolling = false;
        let startX = 0;
        let startY = 0;

        // タッチ開始時に位置を記録
        tile.addEventListener('touchstart', (e) => {
            isScrolling = false;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        // 指が動いた距離が一定(8px)を超えたらスクロールと判定
        tile.addEventListener('touchmove', (e) => {
            if (isScrolling) return;
            const moveX = Math.abs(e.touches[0].clientX - startX);
            const moveY = Math.abs(e.touches[0].clientY - startY);
            if (moveX > 8 || moveY > 8) {
                isScrolling = true;
            }
        }, { passive: true });

        tile.addEventListener('click', (e) => {
            // スクロール操作だった場合はクリック処理をキャンセル
            if (isScrolling) {
                e.preventDefault();
                isScrolling = false;
                return;
            }
            // 既に選択済みならトグル解除
            if (tile.classList.contains('selected')) {
                selectTile(null);
            } else {
                selectTile(tile);
            }
        });
    });

    clearSelectionBtn.addEventListener('click', () => selectTile(null));

    // ── Cancel Detection Button ────────────────────────────────────────────────
    cancelDetectionButton?.addEventListener('click', () => {
        if (activeAbortController) {
            activeAbortController.abort('user');
        }
    });

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

        const handleApprove = () => { cleanup(); resolve(true); };
        const handleCancel = () => { cleanup(); resolve(false); };
        const cleanup = () => {
            consentModal.classList.add('hidden');
            consentApproveBtn.removeEventListener('click', handleApprove);
            consentCancelBtn.removeEventListener('click', handleCancel);
        };

        consentApproveBtn.addEventListener('click', handleApprove);
        consentCancelBtn.addEventListener('click', handleCancel);
    });

    // ── Core Logic ────────────────────────────────────────────────────────────
    const performConversion = async (text, signal) => {
        const selectedType = conversionType.value;
        const converter = converters[selectedType];
        return converter ? await converter(text, signal) : text;
    };

    const setButtonsBusy = (busy, showCancel = false) => {
        convertAndCopyButton.disabled = busy;
        pasteAndConvertButton.disabled = busy;

        if (cancelDetectionContainer) {
            if (busy && showCancel) {
                cancelDetectionContainer.classList.remove('hidden');
            } else {
                cancelDetectionContainer.classList.add('hidden');
            }
        }
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

        // キャンセル用の AbortController を作成
        activeAbortController = new AbortController();
        const signal = activeAbortController.signal;

        setButtonsBusy(true, needsDetection);

        if (needsDetection) {
            outputText.value = '🤖 AIが言語を判定中…';
        }

        // タイムアウト設定 (12秒)
        const timeoutId = setTimeout(() => {
            if (activeAbortController) {
                activeAbortController.abort('timeout');
            }
        }, 45000);

        try {
            if (needsDetection) {
                const authSuccess = await AIDetector.ensureAuth(signal);
                if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
                if (!authSuccess) {
                    console.log('Puter認証がスキップされたか、またはローカル環境中のため、AI判定なしで汎用コードブロックを出力します。');
                }
            }

            if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
            const convertedText = await performConversion(textToConvert, signal);

            if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
            await copyToClipboardAndShowResult(convertedText);
        } catch (err) {
            if (err.name === 'AbortError' || signal.aborted) {
                const reason = activeAbortController?.signal?.reason || 'user';
                if (reason === 'timeout') {
                    showToast('言語判定がタイムアウトしました。', 'warning');
                } else {
                    showToast('言語判定をキャンセルしました。', 'info');
                }
                outputText.value = '';
            } else {
                console.error('変換またはコピーに失敗しました:', err);
                outputText.value = '【エラー】変換またはコピーに失敗しました。\n\n' + textToConvert;
                throw err;
            }
        } finally {
            clearTimeout(timeoutId);
            activeAbortController = null;
            setButtonsBusy(false, false);
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