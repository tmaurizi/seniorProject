// Disables all the buttons
const disableButtons = async () => {
    document.getElementById('start').disabled = true;
    document.getElementById('d1').disabled = true;
    document.getElementById('d2').disabled = true;
    document.getElementById('d3').disabled = true;
    document.getElementById('d4').disabled = true;
    document.getElementById('d5').disabled = true;

    document.getElementById('rollbtn').disabled = true;
    document.getElementById('finishbtn').disabled = true;
    document.getElementById('hintbtn').disabled = true;

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

    resetButtons();
    resetDice();
};

//Enables all buttons (except starting button)
const enableButtons = async () => {
    if (opponent == undefined) {
        opponent = 'Guest';
    }
    document.getElementById('opponent').innerHTML = "Your opponent is " + opponent;

    document.getElementById('start').disabled = true;
    document.getElementById('finishbtn').disabled = false;
    document.getElementById('rollbtn').disabled = false;

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

    resetDice();
    resetButtons();
};

// Resets dice and the possible points and if there was an error message
const resetButtons = async () => {
    document.getElementById('d1').style.background = 'lightgray';
    document.getElementById('d2').style.background = 'lightgray';
    document.getElementById('d3').style.background = 'lightgray';
    document.getElementById('d4').style.background = 'lightgray';
    document.getElementById('d5').style.background = 'lightgray';

    document.getElementById('possiblePoints').innerHTML = '';
    document.getElementById('message').innerHTML = '';
};

// Resets entire game page
const resetPage = async () => {
    resetButtons();
    disableButtons();
    document.getElementById('start').disabled = false;
    document.getElementById('opponent').innerHTML = '';

    const list = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes', 'threeok', 'fourok', 'fullhouse', 'smstraight', 'lgstraight', 'yahtzee', 'chance'];
    let tempPlayer = 'p1';
    for (let i = 0; i < list.length; i++) {
        tempPlayer = 'p1';
        document.getElementById(tempPlayer + list[i]).innerHTML = 0;
        document.getElementById(tempPlayer + list[i]).style.color = 'black';
        tempPlayer = 'p2';
        document.getElementById(tempPlayer + list[i]).innerHTML = 0;
        document.getElementById(tempPlayer + list[i]).style.color = 'black';
    }

    document.getElementById('p1uppersum').innerHTML = 0;
    document.getElementById('p1bonus').innerHTML = 0;
    document.getElementById('p1total').innerHTML = 0;

    document.getElementById('p2uppersum').innerHTML = 0;
    document.getElementById('p2bonus').innerHTML = 0;
    document.getElementById('p2total').innerHTML = 0;
}

// Adds message to chat history, displaying it to all users in the room
const writeMessage = async (text) => {    
    const parent = document.getElementById('chatHistory'+gameid);
    const el = document.createElement('li');
    el.innerHTML = text;
    parent.appendChild(el);
};

const showPlayers = async (players) => {
    if (players[0] == username) {
        opponent = players[1];
    }
    else {
        opponent = players[0];
    }

    if (opponent == undefined) {
        opponent = 'Guest';
    }
    document.getElementById('opponent').innerHTML = "Your opponent is " + opponent;
};

// "Refreshes" the page by updating the colors and updating the table
const refreshPage = async (id, sum) => {
    document.getElementById(id).innerHTML = sum;

    // Changing the upper sum
    const list = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
    let uppersum = 0;
    for (let i = 0; i < list.length; i++) {
        uppersum += parseInt(document.getElementById(player + list[i]).innerHTML);
    }
    document.getElementById(player + 'uppersum').innerHTML = uppersum;

    // Checking for bonus
    if (document.getElementById(player + 'uppersum').innerHTML > 63) {
        document.getElementById(player + 'bonus').innerHTML = 35;
    }

    //Changing rest of table (changing the color of input to red and changing total)
    document.getElementById(id).style.color = 'red';
    document.getElementById(player + 'total').innerHTML = parseInt(document.getElementById(player + 'total').innerHTML) + sum;

    // Switching the player
    if (player == 'p1') {
        player = 'p2';
    }
    else {
        player = 'p1';
    }
};

// After a message is submitted, takes the input and emits to socket
const onChatSubmitted = async (event) => {
    event.preventDefault();
    const input = document.getElementById('chat');
    const text = input.value;
    input.value = '';
    sock.emit('message', { gameid: gameid, text: text });
};

// After the finish turn is submitted then takes the player's choice sends it through socket
// Concept to send info through socket from Professor Frees (choice)
const onFinishSubmitted = async (event) => {
    event.preventDefault();

    if (buttonChoice) {
        if (document.getElementById(player + buttonChoice).style.color != 'red') {
            p2total = parseInt(document.getElementById('p2total').innerHTML) + possiblePoints;
            p1total = parseInt(document.getElementById('p1total').innerHTML);
            checkWinner(player, p2total);
            sock.emit('choice', { gameid: gameid, choice: buttonChoice, points: possiblePoints });
            if (winner != 0) {
                //sock emit a finish game where everything is disabled for everyone and its displayed who won
                //maybe take to new page?
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
                disableButtons();                
                sock.emit('rest');
                sock.emit('message', { gameid: gameid, text: winnerMessage });
                sock.emit('finishGame', { gameid: gameid, p1points: p1total, p2points: p2total });
            }
            else {
                sock.emit('rest');
                sock.emit('turn', { gameid: gameid });
            }
            
        }
        else {
            document.getElementById('message').innerHTML = "You can't choose something you already have!";
        }
    }
    else {
        document.getElementById('message').innerHTML = 'Please choose where to apply dice!';
    }
};

// After the start button is clicked it sends the player to rest and it's the other player's turn
const onStartSubmitted = async (event) => {
    event.preventDefault();
    sock.emit('players', { gameid: gameid });
    sock.emit('rest');
    sock.emit('turn', { gameid: gameid });
}

// If a player leaves the game it will reset game and then redirect the player
const onLeaveSubmitted = async (event) => {
    event.preventDefault();
    sock.emit('left', { gameid: gameid });
    sock.emit('message', { gameid: gameid, text: 'Opponent has left.' });
    location.assign('/'); // https://sentry.io/answers/redirect-to-another-page-using-javascript/#:~:text=Navigating%20to%20a%20new%20page,assign()%20.&text=By%20using%20assign()%20%2C%20the,not%20change%20the%20browser's%20history.
}

// Gets game id from the hidden element on html
const gameid = document.getElementById('gameid').value;
const username = document.getElementById('username').value;
let opponent;

// Socket functions
const sock = io();
sock.on('message', writeMessage);
sock.on('rest', disableButtons);
sock.on('turn', enableButtons);
sock.on('refresh', refreshPage);
sock.on('reset', resetPage);
sock.on('returnPlayers', showPlayers);

sock.emit('join', { gameid: gameid, username: username });


// Socket event listeners 
document.getElementById('chat-form').addEventListener('submit', onChatSubmitted);
document.getElementById('finish-form').addEventListener('submit', onFinishSubmitted);
document.getElementById('startGame-form').addEventListener('submit', onStartSubmitted);
document.getElementById('leaveGame-form').addEventListener('submit', onLeaveSubmitted);