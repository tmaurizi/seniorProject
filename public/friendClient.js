// *******************************************************************
// FRIEND CLIENT
// Handles friend client functions
// *******************************************************************

// <*> MEMBERS <*>
const currentUser = document.getElementById('currentUser').value;
const sock = io();

// <*> FUNCTIONS <*>
// *******************************************************************
// Name: On Add Friend Submitted
// Purpose: Sends the username to the server to lookup if the username is valid
// Parameters:
//      event - the event object of the form being submitted
// *******************************************************************
const onAddFriendSubmitted = async (event) => {
    event.preventDefault();
    // Gets the username from the input box
    const username = document.getElementById('username').value;
    // Sends username and the current user to socket to check that the username is valid
    sock.emit('testUsername', { username: username, current: currentUser });
};

// *******************************************************************
// Name: Display Username Checked
// Purpose: After a username is checked it displays the proper message of whether it was successful or if not why
// Parameters:
//      data - contains whether the username was added ( data.successful ) and the accompanying message ( data.message )
// *******************************************************************
const displayUsernameChecked = async (data) => {
    // Gets rid of the username from the input box so it's empty
    document.getElementById('username').value = '';
    // Displays the accompanying message
    if (data.successful) {
        document.getElementById('message').style.color = 'green';
    }
    document.getElementById('message').innerHTML = data.message;
};

// *******************************************************************
// Name: Remove Friend
// Purpose: Removes a friend from the current user's friend list
// Parameters:
//      username - contains the username of the friend that you are removing
// *******************************************************************
const removeFriend = async (username) => {
    // Takes username off the current user's friend list in the database
    sock.emit('removeFriendFromList', { username: username, current: currentUser });
    // Reloads the page for user so the username is gone from their friend list
    location.reload();
};

// *******************************************************************
// Name: Accept Friend
// Purpose: Accepting friend request from username
// Parameters:
//      username - contains the username of the friend that you are accepting
// *******************************************************************
const acceptFriend = async (username) => {
    // Takes username off request list in the database
    sock.emit('friendRequestResolved', { username: username, current: currentUser });
    // Adds friend to the username's friend list and to the current user's friend list
    sock.emit('friendAccepted', { username: username, current: currentUser });
    // Reloads page for user so the username is gone from friend request list
    location.reload();
};

// *******************************************************************
// Name: Deny Friend
// Purpose: Denying a friend request from username
// Parameters:
//      username - contains the username of the friend that you are denying
// *******************************************************************
const denyFriend = async (username) => {
    // Takes username off request list in database
    sock.emit('friendRequestResolved', { username: username, current: currentUser });
    // Reloads page for user so the username is gone from friend request list
    location.reload();
};

// *******************************************************************
// Name: Refresh Page
// Purpose: Reloads the page for the user
// *******************************************************************
const refreshPage = async () => {
    location.reload();
};

// <*> LISTENERS <*>
// Socket event listeners
sock.on('usernameChecked', displayUsernameChecked);
sock.on('reload', refreshPage);

// Form submission listeners
document.getElementById('addFriend-form').addEventListener('submit', onAddFriendSubmitted);
