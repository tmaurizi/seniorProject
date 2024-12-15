// *******************************************************************
// INDEX
// The main program that starts the game and runs the game
// Reference from web application design final project
// *******************************************************************

// <*> MEMBERS <*>
const express = require('express');
const session = require('express-session');
const http=require('http');

require('dotenv').config();
const Database = require('./db.js');
const db = new Database();

// *******************************************************************
// Name: Initialize
// Purpose: Creates tables if they do not exist and connects to database
// *******************************************************************
const initialize = async () => {
    await db.connect();

    // Creates Players table
    await db.schema('Players', [
        { name: 'id', type: 'INTEGER' },
        { name: 'email', type: 'TEXT' },
        { name: 'username', type: 'TEXT' },
        { name: 'password', type: 'TEXT' },
        { name: 'friends', type: 'TEXT' },
        { name: 'requests', type: 'TEXT' },
        { name: 'totalPoints', type: 'INTEGER' }
    ], 'id');

    // Creates Games table
    await db.schema('Games', [
        { name: 'gameid', type: 'INTEGER' },
        { name: 'playeramt', type: 'INTEGER' },
        { name: 'p1ones', type: 'INTEGER' },
        { name: 'p1twos', type: 'INTEGER' },
        { name: 'p1threes', type: 'INTEGER' },
        { name: 'p1fours', type: 'INTEGER' },
        { name: 'p1fives', type: 'INTEGER' },
        { name: 'p1sixes', type: 'INTEGER' },
        { name: 'p1threeok', type: 'INTEGER' },
        { name: 'p1fourok', type: 'INTEGER' },
        { name: 'p1fullhouse', type: 'INTEGER' },
        { name: 'p1smstraight', type: 'INTEGER' },
        { name: 'p1lgstraight', type: 'INTEGER' },
        { name: 'p1yahtzee', type: 'INTEGER' },
        { name: 'p1chance', type: 'INTEGER' },
        { name: 'p2ones', type: 'INTEGER' },
        { name: 'p2twos', type: 'INTEGER' },
        { name: 'p2threes', type: 'INTEGER' },
        { name: 'p2fours', type: 'INTEGER' },
        { name: 'p2fives', type: 'INTEGER' },
        { name: 'p2sixes', type: 'INTEGER' },
        { name: 'p2threeok', type: 'INTEGER' },
        { name: 'p2fourok', type: 'INTEGER' },
        { name: 'p2fullhouse', type: 'INTEGER' },
        { name: 'p2smstraight', type: 'INTEGER' },
        { name: 'p2lgstraight', type: 'INTEGER' },
        { name: 'p2yahtzee', type: 'INTEGER' },
        { name: 'p2chance', type: 'INTEGER' },
        { name: 'p1username', type: 'TEXT' },
        { name: 'p2username', type: 'TEXT' }
    ], 'gameid');
};

initialize();

// <*> EXPRESS <*>
// Creates the application
const app = express();
app.locals.pretty = true;
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) =>
{
    req.db = db;
    next();
});

app.use(session({
    secret: 'senior',
    resave: false,
    saveUnitialized: true,
    cookie: { secure: false } 
}));

app.use((req, res, next) => {
    if (req.session.user) {
        playerID = req.session.user.id;
        playerUSERNAME = req.session.user.username;
        res.locals.user = {
            id: playerID,
            username: playerUSERNAME
        };
    }
    next();
});

app.set('view engine', 'pug');

app.use(express.static('public'));
app.use('/', require('./routes/accounts'));
app.use('/', require('./routes/homepage'));

const server=http.createServer(app);

// Connects to socket
const socketio=require('socket.io');
const io=socketio(server);

// <*> DATABASE ACCESS FUNCTIONS <*>

// *******************************************************************
// Name: Update Player After Game
// Purpose: After a game is finished it updates the gatabase with the player's info
// Parameters:
//      gameid - the game's id
//      p1total - player 1's total points
//      p2total - player 2's total points
// *******************************************************************
const updatePlayerAfterGame = async (gameid, p1total, p2total) => { 
    const p1username = await db.findPlayer1FromGameid(gameid);
    const p2username = await db.findPlayer2FromGameid(gameid);

    await db.updatePlayerPoints(p1username, p1total);
    await db.updatePlayerPoints(p2username, p2total);
};

// *******************************************************************
// Name: Find Players From Database
// Purpose: Finds the players that are in the database for a game using gameid
// Parameters:
//      gameid - the game's id
// Return: returns an array of player 1 and player 2's usernames
// *******************************************************************
const findPlayersFromDb = async (gameid) => {
    const p1username = await db.findPlayer1FromGameid(gameid);
    const p2username = await db.findPlayer2FromGameid(gameid);

    return [p1username, p2username];
};

// *******************************************************************
// Name: Check Username
// Purpose: Checks friend's username to make sure that it's available to add
// Parameters:
//      username - the friend's username
//      currentUser - the current player's username
// Return: Whether adding the friend was successful or not and a message to accompany
// *******************************************************************
const checkUsername = async (username, currentUser) => {
    // Performs the checks through the database
    const exists = await db.findPlayerByUsername(username);
    const alreadyFriend = await db.checkFriendInList(currentUser, username);
    const alreadyRequested = await db.checkNameInRequestList(username, currentUser);
    const otherPersonRequested = await db.checkNameInRequestList(currentUser, username);

    // Checks each flag and returns the successful flag and the message 
    if (!exists) {
        return { successful: false, message: 'Friend\'s username does not exist.' };
    }
    else if (alreadyFriend) {
        return { successful: false, message: 'This person is already your friend!' };
    }
    else if (username == currentUser) {
        return { successful: false, message: 'You can not add yourself as a friend!' };
    }
    else if (alreadyRequested) {
        return { successful: false, message: 'You already sent this person a friend request.' };
    }
    else if (otherPersonRequested) {
        return { successful: false, message: 'This person sent you a friend request.' };
    }
    else if (exists && !alreadyFriend && username != currentUser && !alreadyRequested && !otherPersonRequested) {
        // Sends the friend request
        await db.friendRequest(currentUser, username);
        return { successful: true, message: 'Friend request sent successfully!' };
    }
    else {
        return { successful: false, message: 'Error adding friend.' };
    }
};

// <*> SOCKET FUNCTIONS <*>
// References:
//      Setting up the socket and getting the initial chat feature - https://www.youtube.com/watch?v=xVcVbCLmKew
//      Sending message to specific player - https://stackoverflow.com/questions/57735827/socket-io-emitting-to-all-users-despite-toroom
//      Setting up rooms and having players join them - https://stackoverflow.com/questions/32882891/how-to-get-event-details-in-middleware-for-socket-io
io.on('connection', (sock) => { 
    sock.emit('message', 'You are connected.');

    // Allows message to be sent to all players in the lobby
    sock.on('lobbyMsg', (data) => {
        // Makes sure the message isn't empty
        if (data.text != '') {
            io.in(0).emit('lobbyMsg', [data.text, data.username]);
        }
    });

    // Allows messages to be sent to other players if they are in the same room/game
    sock.on('message', (data) => {
        // Makes sure the message isn't empty
        if (data.text != '') {
            io.in(data.gameid).emit('message', [data.text, data.username]);
        }
    });

    // Lets players join rooms
    sock.on('join', (room) => { 
        if (room.gameid != 0) {
            let username = room.username;
            if (room.username == undefined) {
                username = 'Guest';
            }
            io.in(room.gameid).emit('message', username + ' joined!');
        }
        sock.join(room.gameid);

        io.in(room.gameid).emit('joinedRoom');
    });

    // If a player leaves the game
    sock.on('left', async (room) => {
        sock.join(0);
        await db.resetGame(room.gameid, room.username);
        io.in(room.gameid).emit('reset');
    });

    // Gets the players from the database and passes them back to the client code
    sock.on('players', async (room) => {
        let playerList = await findPlayersFromDb(room.gameid);
        io.in(room.gameid).emit('returnPlayers', playerList);
    });

    // After player is finished with their turn they are on 'rest'
    sock.on('rest', () => {
        sock.emit('rest');
    });

    // After the other player is finished with their turn the current player is going to make their turn
    sock.on('turn', (room) => {
        sock.broadcast.to(room.gameid).emit('turn');
    });

    // After a choice is made and submitted, the player get's switched and the tables are updated (on screen and database)
    sock.on('choice', async (data) => {
        var col;
        if (data.player == 0) {
            col = 'p1';
        }
        else {
            col = 'p2';
        }
        col += data.choice;
        await db.updateTableById(data.gameid, col, data.points);
        io.in(data.gameid).emit('refresh', col, data.points);
    });

    // Updates the database to have the finished game points stored
    sock.on('finishGame', async (data) => {
        await updatePlayerAfterGame(data.gameid, data.p1points, data.p2points);
    });

    // Sends winner messsage to game players
    sock.on('gameWon', async (data) => {
        io.in(data.gameid).emit('gameOver', data.winner);
    });

    // Tests username from friend request to make sure it's valid and sends information back to client
    sock.on('testUsername', async (data) => {
        let check = await checkUsername(data.username, data.current);
        sock.emit('usernameChecked', check);
    });

    // Resolves the friend request by taking it off the current user's request list
    sock.on('friendRequestResolved', async (data) => {
        await db.removeRequest(data.current, data.username);
    });

    // After a friend is accepted it adds the users to each other's friend lists
    sock.on('friendAccepted', async (data) => {        
        await db.addFriendByPlayerUsername(data.username, data.current);
        await db.addFriendByPlayerUsername(data.current, data.username);
        sock.emit('reload');
    });

    // Removes a friend from current's friend list
    sock.on('removeFriendFromList', async (data) => {
        await db.removeFriendByPlayerUsername(data.current, data.username);
        await db.removeFriendByPlayerUsername(data.username, data.current);
    });
});

server.listen(8080, () => {
    console.log('Visit http://localhost:8080/')
});