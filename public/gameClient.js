// *******************************************************************
// GAME CLIENT
// Handles each game's client functions
// *******************************************************************

// <*> MEMBERS <*>
// Gets game id from the hidden element on html
const gameid = document.getElementById('gameid').value;
// Gets username from the hidden element on html
const username = document.getElementById('username').value;
let opponent;
const sock = io();
// Emits that a player has joined this game ( adds them to the room )
sock.emit('join', { gameid: gameid, username: username });

// <*> FUNCTIONS <*>
// *******************************************************************
// TO BE UPDATED - NEED TO HAVE ONLY START WITH 2 PLAYERS AND IT RANDOMLY ASSIGNS SOMEONE TO GO
// Name: On Start Submitted
// Purpose: After the start button is clicked it sends the player to rest and it's the other player's turn
// Parameters:
//      event - the event object of the form being submitted
// *******************************************************************
const onStartSubmitted = async (event) => {
    event.preventDefault();
    // Emits players to get the players' usernames
    sock.emit('players', { gameid: gameid });
    // Emits rest for current player so they can't do anything
    sock.emit('rest');
    // Emits turn so the other player can go
    sock.emit('turn', { gameid: gameid });
};

// *******************************************************************
// Name: Show Players
// Purpose: Displays the opponent on both players screens
// Parameters:
//      players - contains both players' usernames
// *******************************************************************
const showPlayers = async (players) => {
    // Checks that the players' username is not matching the current user's username so it's not displaying your username as the opponent
    if (players[0] == username) {
        opponent = players[1];
    }
    else {
        opponent = players[0];
    }

    // If the opponent was set to undefined, then it's a guest user so the opponent is set to "Guest"
    if (opponent == undefined) {
        opponent = 'Guest';
    }

    // Displays the opponent's username 
    document.getElementById('opponent').innerHTML = "Your opponent is " + opponent;
};

// *******************************************************************
// Name: Reset Page
// Purpose: Resets entire game page( if a player leaves )
// *******************************************************************
const resetPage = async () => {
    // Resets and disables buttons
    resetButtons();
    disableButtons();

    // Enables start button
    document.getElementById('start').disabled = false;

    // Gets rid of the old opponent's username
    document.getElementById('opponent').innerHTML = '';

    // List of all table row names
    const list = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes', 'threeok', 'fourok', 'fullhouse', 'smstraight', 'lgstraight', 'yahtzee', 'chance'];

    // Goes through list and resets the table to have value of zero and the original color for each player using tempPlayer
    let tempPlayer = 'p1';
    for (let i = 0; i < list.length; i++) {
        tempPlayer = 'p1';
        document.getElementById(tempPlayer + list[i]).innerHTML = 0;
        document.getElementById(tempPlayer + list[i]).style.color = 'black';
        tempPlayer = 'p2';
        document.getElementById(tempPlayer + list[i]).innerHTML = 0;
        document.getElementById(tempPlayer + list[i]).style.color = 'black';
    }

    // Resets value to zero for the uppersums, bonus, and total for each player
    document.getElementById('p1uppersum').innerHTML = 0;
    document.getElementById('p1bonus').innerHTML = 0;
    document.getElementById('p1total').innerHTML = 0;
    document.getElementById('p2uppersum').innerHTML = 0;
    document.getElementById('p2bonus').innerHTML = 0;
    document.getElementById('p2total').innerHTML = 0;
};

// *******************************************************************
// Name: Enable Buttons
// Purpose: Enables playable buttons
// *******************************************************************
const enableButtons = async () => {
    // Checks if opponent is a guest
    if (opponent == undefined) {
        opponent = 'Guest';
    }

    // Displays opponent's name
    document.getElementById('opponent').innerHTML = "Your opponent is " + opponent;

    // Enables turn buttons
    document.getElementById('start').disabled = true;
    document.getElementById('finishbtn').disabled = false;
    document.getElementById('rollbtn').disabled = false;

    // Enables table's choose buttons
    document.getElementById('ones').disabled = false;
    document.getElementById('twos').disabled = false;
    document.getElementById('threes').disabled = false;
    document.getElementById('fours').disabled = false;
    document.getElementById('fives').disabled = false;
    document.getElementById('sixes').disabled = false;

    document.getElementById('threeok').disabled = false;
    document.getElementById('fourok').disabled = false;
    document.getElementById('fullhouse').disabled = false;
    document.getElementById('smstraight').disabled = false;
    document.getElementById('lgstraight').disabled = false;
    document.getElementById('yahtzee').disabled = false;
    document.getElementById('chance').disabled = false;

    // Calls reset functions to reset rest of the page so it's ready for next turn
    resetDice();
    resetButtons();
};

// *******************************************************************
// Name: Disable Buttons
// Purpose: Disables all the buttons for user
// *******************************************************************
const disableButtons = async () => {
    document.getElementById('start').disabled = true;

    // Disables all the dice
    document.getElementById('d1').disabled = true;
    document.getElementById('d2').disabled = true;
    document.getElementById('d3').disabled = true;
    document.getElementById('d4').disabled = true;
    document.getElementById('d5').disabled = true;

    // Ddisables the turn buttons
    document.getElementById('rollbtn').disabled = true;
    document.getElementById('finishbtn').disabled = true;
    document.getElementById('hintbtn').disabled = true;

    // Disables table choose buttons
    document.getElementById('ones').disabled = true;
    document.getElementById('twos').disabled = true;
    document.getElementById('threes').disabled = true;
    document.getElementById('fours').disabled = true;
    document.getElementById('fives').disabled = true;
    document.getElementById('sixes').disabled = true;

    document.getElementById('threeok').disabled = true;
    document.getElementById('fourok').disabled = true;
    document.getElementById('fullhouse').disabled = true;
    document.getElementById('smstraight').disabled = true;
    document.getElementById('lgstraight').disabled = true;
    document.getElementById('yahtzee').disabled = true;
    document.getElementById('chance').disabled = true;

    // Calls reset functions to reset rest of the page so it's ready for next turn
    resetButtons();
    resetDice();
};

// *******************************************************************
// Name: Reset Buttons
// Purpose: Resets dice color, the possible points, and if there was an error message
// *******************************************************************
const resetButtons = async () => {
    document.getElementById('d1').style.background = 'lightgray';
    document.getElementById('d2').style.background = 'lightgray';
    document.getElementById('d3').style.background = 'lightgray';
    document.getElementById('d4').style.background = 'lightgray';
    document.getElementById('d5').style.background = 'lightgray';

    document.getElementById('possiblePoints').innerHTML = '';
    document.getElementById('message').innerHTML = '';
};

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
    sock.emit('message', { gameid: gameid, text: text, username: username });
};

// *******************************************************************
// Name: Write Message
// Purpose: Adds message to chat history, displaying it to all users in the room
// Parameters:
//      data - data[0] is the message being sent and data[1] is the username of the player that sent the message
// *******************************************************************
const writeMessage = async (data) => {    
    // Gets the chatHistory element for the current game
    const parent = document.getElementById('chatHistory' + gameid);

    // Creates a list element containing the username and the message
    const el = document.createElement('li');

    // Used to check that it's not the message "You are connected"
    if (data[0].length > 1) {
        el.innerHTML = data[1] + ' ~ ' + data[0];
    }
    else {
        el.innerHTML = data;
    }

    // Adds the list element to the end of the chatHistory element
    parent.appendChild(el);
};

// *******************************************************************
// Name: Refresh Page
// Purpose: "Refreshes" the page by updating the colors and updating the table with the player's choice
// Parameters:
//      id - the column of that is being changed
//      sum - the sum of the dice in correlation to the column chosen
// *******************************************************************
const refreshPage = async (id, sum) => {
    // Sets the column's value to the sum
    document.getElementById(id).innerHTML = sum;

    // Changing the upper sum by adding the top section of the table
    const list = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
    let uppersum = 0;
    for (let i = 0; i < list.length; i++) {
        uppersum += parseInt(document.getElementById(player + list[i]).innerHTML);
    }
    document.getElementById(player + 'uppersum').innerHTML = uppersum;

    // Checking for if bonus applies
    if (document.getElementById(player + 'uppersum').innerHTML > 63) {
        document.getElementById(player + 'bonus').innerHTML = 35;
    }

    // Changing the color to red to indicate it's already been chosen
    document.getElementById(id).style.color = 'red';

    // Changes total for the play to include the new sum that was added
    document.getElementById(player + 'total').innerHTML = parseInt(document.getElementById(player + 'total').innerHTML) + sum;

    // Switching the player
    if (player == 'p1') {
        player = 'p2';
    }
    else {
        player = 'p1';
    }
};

// *******************************************************************
// Name: On Finish Submitted
// Purpose: After the finish turn is submitted then takes the player's choice sends it through socket
// Parameters:
//      event - the event object of the form being submitted
// Reference:
//      Concept to send info and data through socket - Professor Frees
// *******************************************************************
const onFinishSubmitted = async (event) => {
    event.preventDefault();

    // If a table row is chosen and it hasn't already been chosen
    if (buttonChoice) {
        if (document.getElementById(player + buttonChoice).style.color != 'red') {
            // Get the total of both players and checks if there's a winner
            p2total = parseInt(document.getElementById('p2total').innerHTML) + possiblePoints;
            p1total = parseInt(document.getElementById('p1total').innerHTML);
            checkWinner(player, p2total);
            // Emits to socket the choice so it can be changed in database
            sock.emit('choice', { gameid: gameid, choice: buttonChoice, points: possiblePoints });
            // If there's a winner
            if (winner != 0) {
//COMMENT                //sock emit a finish game where everything is disabled for everyone and its displayed who won
//COMMENT                //maybe take to new page?
                var winnerMessage;
                switch (winner) {
                    case 1:
                        winnerMessage = 'WINNER IS PLAYER ONE!';
                        break;
                    case 2:
                        winnerMessage = 'WINNER IS PLAYER TWO!';
                        break;
                    default:
                        winnerMessage = "IT'S A DRAW!";
                }
                // Disables the buttons for both players
                disableButtons();
                // Emits rest for current player and disabled everything
                sock.emit('rest');
//TO BE CHANGED                // Sends the winner message in chat
                sock.emit('message', { gameid: gameid, text: winnerMessage });
                // Emits finish game with points so they can be added to database
                sock.emit('finishGame', { gameid: gameid, p1points: p1total, p2points: p2total });
            }
            // If no winner
            else {
                // Emits rest for current player and disables everything
                sock.emit('rest');
                // Emits turn for the game so the other player can go
                sock.emit('turn', { gameid: gameid });
            }
            
        }
        // If already chosen
        else {
            document.getElementById('message').innerHTML = "You can't choose something you already have!";
        }
    }
    // If no row was chosen
    else {
        document.getElementById('message').innerHTML = 'Please choose where to apply dice!';
    }
};

// *******************************************************************
// Name: On Leave Submitted
// Purpose: If a player leaves the game it will reset game and then redirect the player that wants to leave
// Parameters:
//      event - the event object of the form being submitted
// References:
//      location.assign() - https://sentry.io/answers/redirect-to-another-page-using-javascript/#:~:text=Navigating%20to%20a%20new%20page,assign()%20.&text=By%20using%20assign()%20%2C%20the,not%20change%20the%20browser's%20history.
// *******************************************************************
const onLeaveSubmitted = async (event) => {
    event.preventDefault();
    // If a winner hasn't been determined then it will reset game
    if (winner == 0) {
        // Emits that the player left to take them out of database for game and to reset the game
        sock.emit('left', { gameid: gameid, username: username });
    }
    // Emits a message to alert the other player that their opponent has left
    sock.emit('message', { gameid: gameid, text: 'Opponent has left.' });
    // Takes the player that wants to leave to the home page
    location.assign('/');
};

// <*> LISTENERS <*>
// Socket event listeners
sock.on('message', writeMessage);
sock.on('rest', disableButtons);
sock.on('turn', enableButtons);
sock.on('refresh', refreshPage);
sock.on('reset', resetPage);
sock.on('returnPlayers', showPlayers);

// Form submission listeners
document.getElementById('chat-form').addEventListener('submit', onChatSubmitted);
document.getElementById('finish-form').addEventListener('submit', onFinishSubmitted);
document.getElementById('startGame-form').addEventListener('submit', onStartSubmitted);
document.getElementById('leaveGame-form').addEventListener('submit', onLeaveSubmitted);