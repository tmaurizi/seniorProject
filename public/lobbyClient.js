const sock = io();

const writeMessage = async (data) => {
    const parent = document.getElementById('lobbyChatHistory');
    const el = document.createElement('li');
    el.innerHTML = data[1] + ' ~ ' + data[0];
    parent.appendChild(el);
};

const onChatSubmitted = async (event) => {
    event.preventDefault();
    const input = document.getElementById('chat');
    const text = input.value;
    input.value = '';
    sock.emit('lobbyMsg', { text: text, username: username });
};

const refreshButton = async () => {
    location.reload();
};

const username = document.getElementById('username').value;

sock.on('lobbyMsg', writeMessage);

sock.emit('join', { gameid: 0 });

document.getElementById('chat-form').addEventListener('submit', onChatSubmitted);