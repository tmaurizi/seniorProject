const addFriend = async (data) => {
    document.getElementById('username').value = '';
    document.getElementById('message').innerHTML = data.message;
    if (data.successful) {
        const parent = document.getElementById('addFriendToList');
        const el = document.createElement('li');
        el.innerHTML = document.getElementById('username').value;
        parent.appendChild(el);
    }
}

// Sends the username to the server to lookup if the username exists
const onFriendSubmitted = async (event) => {
    event.preventDefault();

    let username = document.getElementById('username').value;
    sock.emit('testUsername', { username: username, current: currentUser });
}

const currentUser = document.getElementById('currentUser').value;

const sock = io();
sock.on('usernameChecked', addFriend);

// Socket event listeners
document.getElementById('addFriend-form').addEventListener('submit', onFriendSubmitted);