async function hashPassword(password) {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(password));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('check-user-form');
    const emailEl = document.getElementById('check-email');
    const passEl = document.getElementById('check-senha');
    const errorEl = document.getElementById('check-error');

    const userCard = document.getElementById('user-card');
    const uNome = document.getElementById('u-nome');
    const uEmail = document.getElementById('u-email');
    const uTelefone = document.getElementById('u-telefone');
    const uCidade = document.getElementById('u-cidade');
    const logoutBtn = document.getElementById('logout-btn');

    function showUser(user) {
        uNome.textContent = user.nome || '';
        uEmail.textContent = user.email || '';
        uTelefone.textContent = user.telefone || '';
        uCidade.textContent = user.cidade || '';
        userCard.hidden = false;
        form.hidden = true;
    }

    function logout() {
        sessionStorage.removeItem('currentUser');
        userCard.hidden = true;
        form.hidden = false;
        form.reset();
    }

    logoutBtn.addEventListener('click', logout);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorEl.textContent = '';

        const email = emailEl.value.trim().toLowerCase();
        const senha = passEl.value;

        const raw = localStorage.getItem('users');
        const users = raw ? JSON.parse(raw) : [];

        const user = users.find(u => u.email === email);
        if (!user) {
            errorEl.textContent = 'Usuário não encontrado.';
            return;
        }

        const hash = await hashPassword(senha);
        if (hash !== user.passwordHash) {
            errorEl.textContent = 'Senha incorreta.';
            return;
        }

        // sucesso: salva sessão simples e mostra dados
        sessionStorage.setItem('currentUser', JSON.stringify({ email: user.email, nome: user.nome }));
        showUser(user);
    });

    // se já houver sessão, carrega dados automaticamente
    const sess = sessionStorage.getItem('currentUser');
    if (sess) {
        try {
            const s = JSON.parse(sess);
            const raw = localStorage.getItem('users');
            const users = raw ? JSON.parse(raw) : [];
            const user = users.find(u => u.email === s.email);
            if (user) showUser(user);
        } catch (e) { /* ignore */ }
    }
});