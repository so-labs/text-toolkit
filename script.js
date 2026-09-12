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
    const selectedBadgeList = document.getElementById('selectedBadgeList');
    const chainToggle = document.getElementById('chainToggle');
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
        renderBadges();
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

            // バブルモードではバッジ表示がないため連続変換を無効化する
            if (chainEnabled || selectedTypes.length > 1) {
                chainEnabled = false;
                selectedTypes = selectedTypes.slice(0, 1);
                if (chainToggle) chainToggle.checked = false;
                syncSelectionToDom();
            }
            if (chainToggle) chainToggle.disabled = true;
        } else {
            document.body.classList.remove('bubble-mode');
            if (btnTitle) btnTitle.textContent = t('action.convertAndCopy.title');
            if (btnSub) btnSub.textContent = t('action.convertAndCopy.sub');
            if (chainToggle) chainToggle.disabled = false;
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
    let pendingInitialSelection = '';
    if (initialValue) {
        const matchingTile = document.querySelector(`.tile[data-value="${initialValue}"]`);
        if (matchingTile) {
            const group = matchingTile.closest('.picker-group');
            if (group && group.dataset.group) {
                initialTab = group.dataset.group;
                pendingInitialSelection = initialValue;
            }
        }
    }
    switchTab(initialTab);

    // ── Tile Picker / Chain Selection ─────────────────────────────────────────
    const MAX_CHAIN_SELECTIONS = 3;
    let chainEnabled = false;
    let selectedTypes = pendingInitialSelection ? [pendingInitialSelection] : [];

    /** タイルのラベルテキストを取得 */
    const getTileLabel = (tile) => {
        const nameEl = tile.querySelector('.tile-name');
        // small タグを除いたテキストのみ
        const clone = nameEl.cloneNode(true);
        clone.querySelectorAll('small').forEach(s => s.remove());
        return clone.textContent.trim();
    };

    const getTileByValue = (value) => document.querySelector(`.tile[data-value="${value}"]`);

    // ── 連続変換カラー（ベース色 --c-primary から動的に算出） ──────────────────
    // ベース色が変わっても 2〜3選択目の色が自動で追従するよう、HSL の色相を回転させる
    const CHAIN_HUE_ROTATIONS = [0, 55, 110];

    const parseCssColor = (input) => {
        const str = (input || '').trim();
        let m = str.match(/^#([0-9a-f]{3,8})$/i);
        if (m) {
            let hex = m[1];
            if (hex.length === 3 || hex.length === 4) {
                hex = hex.slice(0, 3).split('').map(c => c + c).join('');
            } else {
                hex = hex.slice(0, 6);
            }
            const n = parseInt(hex, 16);
            return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
        }
        m = str.match(/^rgba?\(([^)]+)\)$/i);
        if (m) {
            const parts = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
            return { r: parts[0], g: parts[1], b: parts[2] };
        }
        return null;
    };

    const rgbToHsl = ({ r, g, b }) => {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const l = (max + min) / 2;
        let h = 0;
        let s = 0;
        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
            else if (max === g) h = (b - r) / d + 2;
            else h = (r - g) / d + 4;
            h *= 60;
        }
        return { h, s, l };
    };

    const updateChainColors = () => {
        const root = document.documentElement;
        const base = parseCssColor(getComputedStyle(root).getPropertyValue('--c-primary'))
            || { r: 99, g: 102, b: 241 };
        const { h, s, l } = rgbToHsl(base);
        const sPct = Math.round(s * 100);
        const lPct = Math.round(l * 100);
        const isDark = root.classList.contains('dark-mode');

        CHAIN_HUE_ROTATIONS.forEach((rot, i) => {
            const idx = i + 1;
            const hue = Math.round(((h + rot) % 360 + 360) % 360);
            root.style.setProperty(`--chain-c${idx}`, `hsl(${hue}, ${sPct}%, ${lPct}%)`);
            root.style.setProperty(`--chain-badge-bg${idx}`, `hsla(${hue}, ${sPct}%, ${lPct}%, 0.1)`);
            root.style.setProperty(`--chain-badge-bd${idx}`, `hsla(${hue}, ${sPct}%, ${lPct}%, 0.25)`);
            root.style.setProperty(`--chain-tile-bg${idx}`, `hsla(${hue}, ${sPct}%, ${lPct}%, ${isDark ? 0.12 : 0.08})`);
            root.style.setProperty(`--chain-glow${idx}`, `hsla(${hue}, ${sPct}%, ${lPct}%, ${isDark ? 0.25 : 0.2})`);
        });
    };

    updateChainColors();
    new MutationObserver(updateChainColors).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
    });

    /** 現在の選択状態からバッジ一覧を再描画する（1つ目は既存の #selectedBadge） */
    const renderBadges = () => {
        selectedBadgeList.querySelectorAll('.dyn-badge, .badge-sep').forEach((el) => el.remove());

        if (selectedTypes.length === 0) {
            selectedBadge.classList.add('hidden');
            selectedBadgeList.classList.add('hidden');
            return;
        }

        selectedBadgeList.classList.remove('hidden');
        selectedBadge.classList.remove('hidden');
        const firstTile = getTileByValue(selectedTypes[0]);
        if (firstTile && selectedBadgeText) {
            const icon = firstTile.querySelector('.tile-icon')?.textContent || '';
            selectedBadgeText.textContent = `${icon} ${getTileLabel(firstTile)}`;
        }

        for (let i = 1; i < selectedTypes.length; i++) {
            const tile = getTileByValue(selectedTypes[i]);
            if (!tile) continue;

            const sep = document.createElement('span');
            sep.className = 'badge-sep';
            sep.setAttribute('aria-hidden', 'true');
            sep.textContent = '→';

            const badge = document.createElement('div');
            badge.className = `selected-badge dyn-badge badge-pos-${i + 1}`;
            const text = document.createElement('span');
            const icon = tile.querySelector('.tile-icon')?.textContent || '';
            text.textContent = `${icon} ${getTileLabel(tile)}`;
            const clearBtn = document.createElement('button');
            clearBtn.type = 'button';
            clearBtn.className = 'badge-clear';
            clearBtn.textContent = '✕';
            clearBtn.setAttribute('aria-label', t('badge.clearAria'));
            clearBtn.addEventListener('click', () => {
                selectedTypes.splice(i, 1);
                syncSelectionToDom();
            });
            badge.append(text, clearBtn);

            selectedBadgeList.append(sep, badge);
        }
    };

    /** 選択タイル・バッジ・hidden select を現在の状態に合わせて更新する */
    const syncSelectionToDom = () => {
        conversionType.value = selectedTypes[0] || '';

        tiles.forEach((tile) => {
            const idx = selectedTypes.indexOf(tile.dataset.value);
            tile.classList.toggle('selected', idx !== -1);
            tile.classList.toggle('selected-2', idx === 1);
            tile.classList.toggle('selected-3', idx === 2);
        });

        renderBadges();
    };

    /** タイルの選択/解除。連続変換 ON のときは最大3つまで右に連ねる */
    const toggleTileSelection = (tile) => {
        const value = tile.dataset.value;
        const idx = selectedTypes.indexOf(value);

        if (chainEnabled) {
            if (idx !== -1) {
                selectedTypes.splice(idx, 1);
            } else {
                if (selectedTypes.length >= MAX_CHAIN_SELECTIONS) {
                    showToast(t('toast.chainMax'), 'warning');
                    return;
                }
                selectedTypes.push(value);
            }
        } else {
            selectedTypes = idx !== -1 ? [] : [value];
        }

        syncSelectionToDom();

        // スムーズに選択バッジまでスクロール（スマホ向け）
        if (selectedTypes.includes(value)) {
            selectedBadgeList.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
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
            toggleTileSelection(tile);
        });
    });

    // 先頭のバッジの ✕ はその項目のみ解除
    clearSelectionBtn.addEventListener('click', () => {
        selectedTypes.splice(0, 1);
        syncSelectionToDom();
    });

    // 連続変換トグル（localStorage 等には保存しない）
    chainToggle?.addEventListener('change', (e) => {
        chainEnabled = e.target.checked;
        if (!chainEnabled && selectedTypes.length > 1) {
            selectedTypes = selectedTypes.slice(0, 1);
            syncSelectionToDom();
        }
    });

    syncSelectionToDom();

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
    // 選択された変換を順に適用する（連続変換 OFF のときは1つのみ）
    const performConversion = async (text, signal) => {
        let current = text;
        for (const selectedType of selectedTypes) {
            const converter = converters[selectedType];
            if (!converter) {
                // Service Worker の旧キャッシュ混在などで、HTMLだけ新・JSが旧の
                // 場合にここに来る。無言で何もしないと原因が分からないため警告する。
                console.warn(`未知の変換タイプです: "${selectedType}"。キャッシュが古い可能性があります。リロードしてください。`);
                showToast(t('toast.convertFailed'), 'error');
                return current;
            }
            current = await converter(current, signal);
            if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
        }
        return current;
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
        if (selectedTypes.length === 0) {
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
        const needsAiProcessing = selectedTypes.some(v => aiFunctions.includes(v));

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