// After a username is checked it displays the proper message of whether it was successful or if not why
const displayUsernameChecked = async (data) => {
    document.getElementById('username').value = '';
    document.getElementById('message').innerHTML = data.message;
}

// Accepting friend request from username
const acceptFriend = async (username) => {    
    // Take username off request list
    sock.emit('friendRequestResolved', { username: username, current: currentUser });
    location.reload();

    // Add friend to the username's friend list and to the current user's friend list
    sock.emit('friendAccepted', { username: username, current: currentUser });
}

// Denying a friend request from username
const denyFriend = async (username) => {
    // Take username off request list
    sock.emit('friendRequestResolved', { username: username, current: currentUser });
    location.reload();
}

// Sends the username to the server to lookup if the username exists
const onFriendSubmitted = async (event) => {
    event.preventDefault();

    let username = document.getElementById('username').value;
    sock.emit('testUsername', { username: username, current: currentUser });
}

const currentUser = document.getElementById('currentUser').value;

const sock = io();
sock.on('usernameChecked', displayUsernameChecked);


// Socket event listeners
document.getElementById('addFriend-form').addEventListener('submit', onFriendSubmitted);