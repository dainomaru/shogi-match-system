// 認証モジュール
const AUTH = {
  CREDENTIAL: { id: 'sakura', pwHash: '8c037fd37cb11e43409338cd56f407b3b7a86647' },

  // SHA-1ハッシュ（ブラウザ内簡易実装）
  async hash(str) {
    const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  },

  async login(id, password) {
    const h = await this.hash(password);
    if (id === this.CREDENTIAL.id && h === this.CREDENTIAL.pwHash) {
      sessionStorage.setItem('loggedIn', '1');
      sessionStorage.setItem('userId', id);
      return true;
    }
    return false;
  },

  logout() {
    sessionStorage.removeItem('loggedIn');
    sessionStorage.removeItem('userId');
    location.href = 'index.html';
  },

  requireAuth() {
    if (sessionStorage.getItem('loggedIn') !== '1') {
      location.href = 'index.html';
    }
  },

  currentUser() {
    return sessionStorage.getItem('userId') || '';
  }
};

// ログインページ処理
const form = document.getElementById('loginForm');
if (form) {
  // 既にログイン済みならダッシュボードへ
  if (sessionStorage.getItem('loggedIn') === '1') {
    location.href = 'dashboard.html';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('loginId').value.trim();
    const pw = document.getElementById('password').value;
    const errEl = document.getElementById('loginError');
    errEl.textContent = '';

    const ok = await AUTH.login(id, pw);
    if (ok) {
      location.href = 'dashboard.html';
    } else {
      errEl.textContent = 'ログインIDまたはパスワードが正しくありません。';
    }
  });
}
