// *******************************************************************
// LOBBY CLIENT
// Handles the lobby's client functions
// *******************************************************************

// <*> MEMBERS <*>
const sock = io();
const username = document.getElementById('username').value;

// Emits that player joined lobby
sock.emit('join', { gameid: 0 });

// <*> FUNCTIONS <*>
// *******************************************************************
// Name: On Chat Submitted
// Purpose: After a message is submitted, takes the input and emits to socket
// Parameters:
//      event - the event object of the form being submitted
// *******************************************************************
const onChatSubmitted = async (event) => {
    event.preventDefault();

    // Gets chat message and stores in text and then resets the input box to be empty
    const input = document.getElementById('chat');
    const text = input.value;
    // Resets input box to have nothing
    input.value = '';
    // Sends message to socket to be displayed
    sock.emit('lobbyMsg', { text: text, username: username });
};

// *******************************************************************
// Name: Write Message
// Purpose: Adds message to chat history, displaying it to all users in the room
// Parameters:
//      data - data[0] is the message being sent and data[1] is the username of the player that sent the message
// *******************************************************************
const writeMessage = async (data) => {
    // Gets the lobbyChatHistory element for the current game
    const parent = document.getElementById('lobbyChatHistory');
    // Creates a list element containing the username and the message
    const el = document.createElement('li');

    el.innerHTML = data[1] + ' ~ ' + data[0];

    // Adds the list element to the end of the chatHistory element
    parent.appendChild(el);
};

// *******************************************************************
// Name: Refresh Button
// Purpose: Reloads the entire page
// *******************************************************************
const refreshButton = async () => {
    location.reload();
};

// <*> LISTENERS
// Socket Event listeners
sock.on('lobbyMsg', writeMessage);

// Form Submission listeners
document.getElementById('chat-form').addEventListener('submit', onChatSubmitted);