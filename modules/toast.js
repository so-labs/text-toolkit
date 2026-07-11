const toastContainer = document.getElementById('toastContainer');

/**
 * トースト通知を表示する
 * @param {string} message  表示するメッセージ
 * @param {'success'|'error'|'info'|'warning'} type  トーストの種類
 * @param {number} duration  表示時間 (ms)
 */
export const showToast = (message, type = 'info', duration = 3000) => {
    if (!toastContainer) return;
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-msg">${message}</span>
    `;
    toastContainer.appendChild(toast);

    // 自動削除
    const remove = () => {
        toast.classList.add('toast-out');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
    };
    const timer = setTimeout(remove, duration);

    // クリックでも閉じられる
    toast.addEventListener('click', () => {
        clearTimeout(timer);
        remove();
    });
};