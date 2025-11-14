// Validação simples: senhas iguais
(function () {
    const form = document.getElementById('register-form');
    const senha = document.getElementById('senha');
    const confirma = document.getElementById('confirma');
    const error = document.getElementById('form-error');

    form.addEventListener('submit', function (e) {
        error.textContent = '';
        if (senha.value !== confirma.value) {
            e.preventDefault();
            error.textContent = 'As senhas não coincidem.';
            confirma.focus();
            return;
        }
        // aqui você pode enviar o formulário normalmente ou usar fetch/AJAX
        // e.preventDefault(); // descomente para evitar envio real em testes
    });
})();

async function hashPassword(password) {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(password));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

(function () {
    const form = document.getElementById('register-form');
    const senha = document.getElementById('senha');
    const confirma = document.getElementById('confirma');
    const error = document.getElementById('form-error');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        error.textContent = '';

        if (senha.value !== confirma.value) {
            error.textContent = 'As senhas não coincidem.';
            confirma.focus();
            return;
        }

        // checa campos obrigatórios (HTML já faz, aqui double-check)
        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const telefone = document.getElementById('telefone').value.trim();
        const cidade = document.getElementById('cidade').value.trim();

        if (!nome || !email || !senha.value) {
            error.textContent = 'Preencha os campos obrigatórios.';
            return;
        }

        // carrega users do localStorage
        const raw = localStorage.getItem('users');
        const users = raw ? JSON.parse(raw) : [];

        // evita duplicação por email
        if (users.some(u => u.email === email)) {
            error.textContent = 'Já existe uma conta com esse email.';
            return;
        }

        const passwordHash = await hashPassword(senha.value);

        const user = {
            nome,
            email,
            telefone,
            cidade,
            passwordHash,
            createdAt: new Date().toISOString()
        };

        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));

        // opcional: armazenar sessão simples na sessionStorage
        sessionStorage.setItem('currentUser', JSON.stringify({ email: user.email, nome: user.nome }));

        // redireciona para login ou mostra mensagem
        window.location.href = 'perfil.html';
    });
})();