export const applyTheme = (theme, themeToggle) => {
    const root   = document.documentElement;
    const bodyEl = document.body;
    if (theme === 'dark') {
        root.classList.add('dark-mode');
        bodyEl.classList.add('dark-mode');
        if (themeToggle) themeToggle.textContent = '☀️';
    } else {
        root.classList.remove('dark-mode');
        bodyEl.classList.remove('dark-mode');
        if (themeToggle) themeToggle.textContent = '🌙';
    }
};

export const initTheme = (themeToggle) => {
    const savedTheme       = localStorage.getItem('theme');
    const systemPrefersDark= window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme     = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    applyTheme(initialTheme, themeToggle);

    themeToggle.addEventListener('click', () => {
        const isDark   = document.body.classList.contains('dark-mode');
        const newTheme = isDark ? 'light' : 'dark';
        document.documentElement.classList.add('theme-transition');
        applyTheme(newTheme, themeToggle);
        localStorage.setItem('theme', newTheme);
        window.setTimeout(() => {
            document.documentElement.classList.remove('theme-transition');
        }, 420);
    });
};