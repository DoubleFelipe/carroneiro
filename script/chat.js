document.addEventListener('DOMContentLoaded', () => {
    const currentUserEl = document.getElementById('current-user');
    const logoutBtn = document.getElementById('logout-btn');
    const usersContainer = document.getElementById('users-container');
    const messagesContainer = document.getElementById('messages-container');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const messageForm = document.getElementById('message-form');
    const chatTitle = document.getElementById('chat-title');

    let currentUser = null;
    let selectedUser = null;

    // carrega usuário logado
    function loadCurrentUser() {
        const sess = sessionStorage.getItem('currentUser');
        if (!sess) {
            currentUserEl.textContent = 'Não logado';
            window.location.href = 'perfil.html';
            return;
        }

        try {
            currentUser = JSON.parse(sess);
            currentUserEl.textContent = `${currentUser.nome}`;
        } catch (e) {
            currentUserEl.textContent = 'Erro ao carregar';
        }
    }

    // carrega lista de usuários (exceto o atual)
    function loadUsers() {
        const raw = localStorage.getItem('users');
        const users = raw ? JSON.parse(raw) : [];

        usersContainer.innerHTML = '';
        users
            .filter(u => u.email !== currentUser.email)
            .forEach(user => {
                const div = document.createElement('div');
                div.className = 'user-item';
                div.textContent = user.nome;
                div.addEventListener('click', () => selectUser(user));
                usersContainer.appendChild(div);
            });
    }

    // seleciona usuário para chat
    function selectUser(user) {
        selectedUser = user;
        chatTitle.textContent = `Chat com ${user.nome}`;
        messageInput.disabled = false;
        sendBtn.disabled = false;

        // atualiza visual
        document.querySelectorAll('.user-item').forEach(el => {
            el.classList.toggle('active', el.textContent === user.nome);
        });

        loadMessages();
    }

    // carrega mensagens (chave: email1+email2 em ordem alfabética)
    function getChatKey(email1, email2) {
        const sorted = [email1, email2].sort();
        return `chat_${sorted[0]}_${sorted[1]}`;
    }

    function loadMessages() {
        if (!selectedUser) return;

        const key = getChatKey(currentUser.email, selectedUser.email);
        const raw = localStorage.getItem(key);
        const messages = raw ? JSON.parse(raw) : [];

        messagesContainer.innerHTML = '';
        messages.forEach(msg => {
            const div = document.createElement('div');
            div.className = `message ${msg.sender === currentUser.email ? 'own' : 'other'}`;

            const bubble = document.createElement('div');
            bubble.className = 'message-bubble';
            bubble.textContent = msg.text;

            const time = document.createElement('div');
            time.className = 'message-time';
            time.textContent = new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });

            div.appendChild(bubble);
            div.appendChild(time);
            messagesContainer.appendChild(div);
        });

        // scroll para última mensagem
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // envia mensagem
    messageForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!messageInput.value.trim() || !selectedUser) return;

        const key = getChatKey(currentUser.email, selectedUser.email);
        const raw = localStorage.getItem(key);
        const messages = raw ? JSON.parse(raw) : [];

        messages.push({
            sender: currentUser.email,
            text: messageInput.value.trim(),
            timestamp: new Date().toISOString()
        });

        localStorage.setItem(key, JSON.stringify(messages));
        messageInput.value = '';
        loadMessages();
    });

    // logout
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'perfil.html';
    });

    // inicializa
    loadCurrentUser();
    loadUsers();
});