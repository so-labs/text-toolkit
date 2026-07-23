let themeColorAnimFrame = null;

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}

function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

function updateThemeColor(targetHex, animate) {
    const metaThemeColor = document.getElementById('theme-color-meta');
    if (!metaThemeColor) return;

    if (!animate) {
        metaThemeColor.setAttribute('content', targetHex);
        return;
    }

    let currentHex = metaThemeColor.getAttribute('content');
    if (!currentHex || !currentHex.startsWith('#') || currentHex.length !== 7) {
        metaThemeColor.setAttribute('content', targetHex);
        return;
    }

    if (currentHex === targetHex) return;

    const startRgb = hexToRgb(currentHex);
    const targetRgb = hexToRgb(targetHex);
    const duration = 350; // CSSの --t-slow (0.35s) に合わせる
    const startTime = performance.now();

    if (themeColorAnimFrame) cancelAnimationFrame(themeColorAnimFrame);

    function step(currentTime) {
        let elapsed = currentTime - startTime;
        let progress = Math.min(elapsed / duration, 1);

        const t = 1 - Math.pow(1 - progress, 3);

        const r = Math.round(startRgb.r + (targetRgb.r - startRgb.r) * t);
        const g = Math.round(startRgb.g + (targetRgb.g - startRgb.g) * t);
        const b = Math.round(startRgb.b + (targetRgb.b - startRgb.b) * t);

        metaThemeColor.setAttribute('content', rgbToHex(r, g, b));

        if (progress < 1) {
            themeColorAnimFrame = requestAnimationFrame(step);
        } else {
            themeColorAnimFrame = null;
        }
    }

    themeColorAnimFrame = requestAnimationFrame(step);
}

export const getEffectiveTheme = (theme) => {
    if (theme === 'system' || !theme) {
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return systemPrefersDark ? 'dark' : 'light';
    }
    return theme;
};

export const applyTheme = (theme, animate = false) => {
    const effectiveTheme = getEffectiveTheme(theme);
    const root = document.documentElement;
    const bodyEl = document.body;

    if (effectiveTheme === 'dark') {
        root.classList.add('dark-mode');
        bodyEl.classList.add('dark-mode');
        updateThemeColor('#080e1a', animate);
    } else {
        root.classList.remove('dark-mode');
        bodyEl.classList.remove('dark-mode');
        updateThemeColor('#f0f2ff', animate);
    }

    // UIボタンの状態更新
    const themeButtons = document.querySelectorAll('.theme-option-btn');
    themeButtons.forEach(btn => {
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
        } else {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        }
    });
};

export const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'system';

    // システムのテーマ変更監視
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
        const currentSaved = localStorage.getItem('theme') || 'system';
        if (currentSaved === 'system') {
            document.documentElement.classList.add('theme-transition');
            applyTheme('system', true);
            window.setTimeout(() => {
                document.documentElement.classList.remove('theme-transition');
            }, 420);
        }
    };

    if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleSystemThemeChange);
    }

    applyTheme(savedTheme, false);

    // イベント委譲またはボタン一律登録
    const themeButtons = document.querySelectorAll('.theme-option-btn');
    themeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedTheme = e.currentTarget.dataset.theme;
            document.documentElement.classList.add('theme-transition');

            localStorage.setItem('theme', selectedTheme);
            applyTheme(selectedTheme, true);

            window.setTimeout(() => {
                document.documentElement.classList.remove('theme-transition');
            }, 420);
        });
    });
};