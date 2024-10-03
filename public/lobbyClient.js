const sock = io();

const writeMessage = async (text) => {
    const parent = document.getElementById('lobbyChatHistory');
    const el = document.createElement('li');
    el.innerHTML = text;
    parent.appendChild(el);
};

const onChatSubmitted = async (event) => {
    event.preventDefault();
    const input = document.getElementById('chat');
    const text = input.value;
    input.value = '';
    sock.emit('lobbyMsg', { text: text });
};

const refreshButton = async () => {
    console.log('refresh');
    location.reload();
};

sock.on('lobbyMsg', writeMessage);

sock.emit('join', { gameid: 0 });

document.getElementById('chat-form').addEventListener('submit', onChatSubmitted);