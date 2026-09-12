import { showToast } from './modules/toast.js';
import { initTheme } from './modules/theme.js';
import { CookieUtils, Utils } from './modules/utils.js';
import { converters } from './modules/converters.js';
import { AIService } from './modules/ai-service.js';
import { t, getLanguage, setLanguage, applyTranslations } from './modules/i18n.js';

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
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsMenu = document.getElementById('settingsMenu');
    const settingsCloseBtn = document.getElementById('settingsCloseBtn');
    const debugToggle = document.getElementById('debugToggle');
    const bubbleToggle = document.getElementById('bubbleToggle');
    const bubbleSettingGroup = document.getElementById('bubbleSettingGroup');
    const versionInfoGroup = document.getElementById('versionInfoGroup');
    const appVersionDisplay = document.getElementById('appVersionDisplay');
    const consentModal = document.getElementById('consentModal');
    const consentApproveBtn = document.getElementById('consentApproveBtn');
    const consentCancelBtn = document.getElementById('consentCancelBtn');
    const clearInputButton = document.getElementById('clearInputButton');
    const copyOutputButton = document.getElementById('copyOutputButton');
    const clearSelectionBtn = document.getElementById('clearSelectionBtn');
    const selectedBadge = document.getElementById('selectedBadge');
    const selectedBadgeText = document.getElementById('selectedBadgeText');
    const tiles = document.querySelectorAll('.tile');
    const cancelAiContainer = document.getElementById('cancelAiContainer');
    const cancelAiButton = document.getElementById('cancelAiButton');

    // ── Settings Menu Toggle ──────────────────────────────────────────────────
    const toggleSettingsMenu = (show) => {
        if (!settingsMenu) return;
        const isHidden = settingsMenu.classList.contains('hidden');
        const shouldShow = show !== undefined ? show : isHidden;
        if (shouldShow) {
            settingsMenu.classList.remove('hidden');
            settingsToggle?.setAttribute('aria-expanded', 'true');
        } else {
            settingsMenu.classList.add('hidden');
            settingsToggle?.setAttribute('aria-expanded', 'false');
        }
    };

    settingsToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSettingsMenu();
    });

    settingsCloseBtn?.addEventListener('click', () => {
        toggleSettingsMenu(false);
    });

    settingsMenu?.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    document.addEventListener('click', () => {
        toggleSettingsMenu(false);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            toggleSettingsMenu(false);
        }
    });

    // ── Dark / System Theme ───────────────────────────────────────────────────
    initTheme();

    // ── App Version ───────────────────────────────────────────────────────────
    Utils.getAppVersion().then(version => {
        if (appVersionDisplay) {
            appVersionDisplay.textContent = `Ver ${version}`;
        }
    });

    // ── i18n (言語切替) ────────────────────────────────────────────────────────
    const langButtons = document.querySelectorAll('.lang-option-btn');

    const syncLangButtonUI = (lang) => {
        langButtons.forEach(btn => {
            if (btn.dataset.lang === lang) {
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            }
        });
    };

    const refreshSelectedBadgeText = () => {
        const selectedTile = document.querySelector('.tile.selected');
        if (selectedTile && selectedBadgeText) {
            const label = getTileLabel(selectedTile);
            const icon = selectedTile.querySelector('.tile-icon')?.textContent || '';
            selectedBadgeText.textContent = `${icon} ${label}`;
        }
    };

    const applyLang = (lang) => {
        setLanguage(lang);
        applyTranslations(document);
        syncLangButtonUI(lang);
        refreshSelectedBadgeText();
        updateBubbleModeUI(document.body.classList.contains('bubble-mode'));
    };

    // 初期状態の反映
    const currentLang = getLanguage();
    syncLangButtonUI(currentLang);
    applyTranslations(document);

    // 言語ボタンのクリックハンドラ
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            applyLang(btn.dataset.lang);
        });
    });

    // ── Debug & Bubble Mode ───────────────────────────────────────────────────
    let isDebugModeEnabled = localStorage.getItem('debugMode') === 'true';
    if (debugToggle) {
        debugToggle.checked = isDebugModeEnabled;
    }

    const isPwa = () => {
        return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    };

    const checkAndroid17OrAbove = async () => {
        // 1. User-Agent Client Hints API (プライバシー保護下でも正確なバージョンが取れる)
        if (navigator.userAgentData) {
            try {
                const values = await navigator.userAgentData.getHighEntropyValues(['platformVersion']);
                const isAndroid = navigator.userAgentData.platform === 'Android' || /Android/i.test(navigator.userAgent);
                if (isAndroid && values.platformVersion) {
                    const majorVersion = parseInt(values.platformVersion.split('.')[0], 10);
                    if (!isNaN(majorVersion)) {
                        return majorVersion >= 17;
                    }
                }
            } catch (e) {
                // 取得失敗時は無視してフォールバックへ
            }
        }

        // 2. フォールバック: User-Agent 文字列からの抽出
        const match = navigator.userAgent.match(/Android\s([0-9\.]+)/);
        if (match) {
            const majorVersion = parseInt(match[1].split('.')[0], 10);
            return majorVersion >= 17;
        }

        return false;
    };

    const updateBubbleModeUI = (isBubble) => {
        const btnTitle = convertAndCopyButton.querySelector('.btn-title');
        const btnSub = convertAndCopyButton.querySelector('.btn-sub');
        if (isBubble) {
            document.body.classList.add('bubble-mode');
            if (btnTitle) btnTitle.textContent = t('bubble.convert');
            if (btnSub) btnSub.textContent = t('bubble.convertSub');
        } else {
            document.body.classList.remove('bubble-mode');
            if (btnTitle) btnTitle.textContent = t('action.convertAndCopy.title');
            if (btnSub) btnSub.textContent = t('action.convertAndCopy.sub');
        }
        if (bubbleToggle) {
            bubbleToggle.checked = isBubble;
        }
    };

    // バブルモードの自動判定ロジック
    let manualBubbleOverride = false;

    const detectBubbleState = () => {
        if (!isPwa()) return false;

        // PC環境でのPWAウィンドウリサイズによる誤爆を防ぐため、モバイル端末のみで判定
        const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (!isMobile) return false;

        const screenW = window.screen.width;
        const screenH = window.screen.height;
        const appW = window.innerWidth;
        const appH = window.innerHeight;

        const widthRatio = appW / screenW;
        const heightRatio = appH / screenH;

        if (widthRatio < 0.98 && heightRatio < 0.98) {
            return true;
        }
        return false;
    };

    const applyBubbleModeAuto = () => {
        if (manualBubbleOverride) return;
        updateBubbleModeUI(detectBubbleState());
    };

    let isBubbleModeSupported = false;

    const updateSettingsVisibility = () => {
        const shouldShowBubble = isDebugModeEnabled || isBubbleModeSupported;
        if (shouldShowBubble) {
            bubbleSettingGroup?.classList.remove('hidden');
        } else {
            bubbleSettingGroup?.classList.add('hidden');
            if (document.body.classList.contains('bubble-mode')) {
                updateBubbleModeUI(false);
            }
        }

        if (isDebugModeEnabled) {
            versionInfoGroup?.classList.remove('hidden');
        } else {
            versionInfoGroup?.classList.add('hidden');
        }
    };

    const initBubbleMode = async () => {
        const pwa = isPwa();
        const android17Plus = pwa ? await checkAndroid17OrAbove() : false;
        isBubbleModeSupported = pwa && android17Plus;

        updateSettingsVisibility();

        if (isBubbleModeSupported) {
            setTimeout(applyBubbleModeAuto, 150);
            window.addEventListener('resize', () => {
                setTimeout(applyBubbleModeAuto, 150);
            });
        }
    };

    debugToggle?.addEventListener('change', (e) => {
        isDebugModeEnabled = e.target.checked;
        localStorage.setItem('debugMode', isDebugModeEnabled ? 'true' : 'false');
        updateSettingsVisibility();
    });

    bubbleToggle?.addEventListener('change', (e) => {
        manualBubbleOverride = true;
        updateBubbleModeUI(e.target.checked);
    });

    initBubbleMode();

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
    let initialTab = 'ai';
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

    // ── Cancel Ai Button ────────────────────────────────────────────────
    cancelAiButton?.addEventListener('click', () => {
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
            showToast(t('toast.copySuccess'), 'success');
        } catch {
            showToast(t('toast.copyFailed'), 'error');
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
        if (!converter) {
            // Service Worker の旧キャッシュ混在などで、HTMLだけ新・JSが旧の
            // 場合にここに来る。無言で何もしないと原因が分からないため警告する。
            console.warn(`未知の変換タイプです: "${selectedType}"。キャッシュが古い可能性があります。リロードしてください。`);
            showToast(t('toast.convertFailed'), 'error');
            return text;
        }
        return await converter(text, signal);
    };

    const setButtonsBusy = (busy, showCancel = false) => {
        convertAndCopyButton.disabled = busy;
        pasteAndConvertButton.disabled = busy;

        const isBubble = document.body.classList.contains('bubble-mode');
        if (isBubble) {
            const btnTitle = convertAndCopyButton.querySelector('.btn-title');
            const btnSub = convertAndCopyButton.querySelector('.btn-sub');
            if (busy) {
                if (btnTitle) btnTitle.textContent = t('bubble.converting');
                if (btnSub) btnSub.textContent = t('bubble.convertingSub');
            } else {
                if (btnTitle) btnTitle.textContent = t('bubble.convert');
                if (btnSub) btnSub.textContent = t('bubble.convertSub');
            }
        }

        if (cancelAiContainer) {
            if (busy && showCancel) {
                cancelAiContainer.classList.remove('hidden');
            } else {
                cancelAiContainer.classList.add('hidden');
            }
        }
    };

    const copyToClipboardAndShowResult = async (text) => {
        outputText.value = text;
        try {
            await navigator.clipboard.writeText(text);
            showToast(t('toast.convertCopySuccess'), 'success');
        } catch {
            // フォールバック
            try {
                outputText.select();
                document.execCommand('copy');
                showToast(t('toast.convertCopySuccess'), 'success');
            } catch {
                showToast(t('toast.convertCopyFailed'), 'error', 5000);
            }
        }
    };

    const runConversion = async () => {
        if (!conversionType.value) {
            showToast(t('toast.selectConversion'), 'warning');
            // 選択エリアへスクロール
            document.getElementById('conversionPicker')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        let textToConvert = '';
        const isBubble = document.body.classList.contains('bubble-mode');

        if (isBubble) {
            try {
                textToConvert = await navigator.clipboard.readText();
                if (!textToConvert) {
                    showToast(t('toast.clipboardEmpty'), 'warning');
                    return;
                }
                textToConvert = Utils.normalizeNewlines(textToConvert);
            } catch {
                showToast(t('toast.clipboardReadFailed'), 'error');
                return;
            }
        } else {
            textToConvert = Utils.normalizeNewlines(inputText.value);
        }

        const aiFunctions = ['codeBlockAuto', 'tableFormatter'];
        const needsAiProcessing = aiFunctions.includes(conversionType.value);

        if (needsAiProcessing) {
            const consent = CookieUtils.get('ai_consent');
            if (consent !== 'true') {
                const approved = await showConsentModal();
                if (!approved) return;
                CookieUtils.set('ai_consent', 'true', 365);
            }
        }

        // キャンセル用の AbortController を作成
        activeAbortController = new AbortController();
        const signal = activeAbortController.signal;

        setButtonsBusy(true, needsAiProcessing);

        if (needsAiProcessing) {
            outputText.value = t('error.aiProcessing');
            if (isBubble) {
                showToast(t('toast.aiProcessing'), 'info');
            }
        }

        // タイムアウト設定 (12秒)
        const timeoutId = setTimeout(() => {
            if (activeAbortController) {
                activeAbortController.abort('timeout');
            }
        }, 45000);

        try {
            if (needsAiProcessing) {
                const authSuccess = await AIService.ensureAuth(signal);
                if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
                if (!authSuccess) {
                    console.log('Puter認証がスキップされたか、またはローカル環境中のため、AI処理をスキップするかフォールバックします。');
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
                    showToast(t('toast.aiTimeout'), 'warning');
                } else {
                    showToast(t('toast.aiCancelled'), 'info');
                }
                outputText.value = '';
            } else {
                console.error('変換またはコピーに失敗しました:', err);
                outputText.value = t('error.conversionFailed') + '\n\n' + textToConvert;
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
            showToast(t('toast.pasteSuccess'), 'info');
        } catch {
            showToast(t('toast.pasteFailed'), 'error', 5000);
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
            showToast(t('toast.pasteConvertFailed'), 'error', 5000);
            setButtonsBusy(false);
        }
    });

    // 変換してコピーボタン
    convertAndCopyButton.addEventListener('click', async () => {
        try {
            await runConversion();
        } catch (err) {
            console.error('変換に失敗しました:', err);
            showToast(t('toast.convertFailed'), 'error');
            setButtonsBusy(false);
        }
    });

});