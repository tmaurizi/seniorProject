const express = require('express');
const session = require('express-session');
const http=require('http');

require('dotenv').config();
const Database = require('./db.js');
const db = new Database();

// Creates tables if they do not exist and connects to database
const initialize = async () => {
    await db.connect();

    await db.schema('Players', [
        { name: 'id', type: 'INTEGER' },
        { name: 'email', type: 'TEXT' },
        { name: 'username', type: 'TEXT' },
        { name: 'password', type: 'TEXT' },
        { name: 'totalPoints', type: 'INTEGER' }
    ], 'id');

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

// Rewritten from senior project 
initialize();
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

const socketio=require('socket.io');
const io=socketio(server);

var playerToggle = 0;

// A function to update the database from the socket functions that is async to allow 'await'
const updateDb = async (gameid, column, sum) => { 
    await db.updateTableById(gameid, column, sum);
};

// After a game is finished it updates the gatabase with the player's info
const updatePlayerAfterGame = async (gameid, p1total, p2total) => { 
    const p1username = await db.findPlayer1FromGameid(gameid);
    const p2username = await db.findPlayer2FromGameid(gameid);

    await db.updatePlayerPoints(p1username, p1total);
    await db.updatePlayerPoints(p2username, p2total);

};

const findPlayersFromDb = async (gameid) => { 
    const p1username = await db.findPlayer1FromGameid(gameid);
    const p2username = await db.findPlayer2FromGameid(gameid);

    return [p1username, p2username];
}

// If a player leaves, the game is reset to have all 0 values for both players
const resetDbForGame = async (gameid) => { 
    await db.resetGame(gameid);
};

// Socket functions
// Reference:
//      Setting up the socket and getting the initial chat feature - https://www.youtube.com/watch?v=xVcVbCLmKew
//      Sending message to specific player - https://stackoverflow.com/questions/57735827/socket-io-emitting-to-all-users-despite-toroom
//      Setting up rooms and having players join them - https://stackoverflow.com/questions/32882891/how-to-get-event-details-in-middleware-for-socket-io
io.on('connection', (sock) => { 
    console.log('Someone connected');
    sock.emit('message', 'You are connected.');

    sock.on('lobbyMsg', (text) => {
        io.in(0).emit('lobbyMsg', text.text);
    });

    // Allows messages to be sent to other players if they are in the same room
    sock.on('message', (room) => { 
        io.in(room.gameid).emit('message', room.text);
    });

    // Lets players join rooms
    sock.on('join', (room) => { 
        console.log('Joining room ' + room.gameid);
        if (room.gameid != 0) {
            let username = room.username;
            if (room.username == undefined) {
                username = 'Guest';
            }
            io.in(room.gameid).emit('message', username + ' joined!');
        }
        sock.join(room.gameid);
    });

    // If a player leaves the game
    sock.on('left', (room) => {
        sock.join(0);
        resetDbForGame(room.gameid);
        io.in(room.gameid).emit('reset');
    });

    sock.on('players', (room) => {
        let playerList = findPlayersFromDb(room.gameid);
        sock.emit('returnPlayers', playerList);
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
    sock.on('choice', (room) => {
        var col;
        if (playerToggle == 0) {
            col = 'p1';
            playerToggle = 1;
        }
        else {
            col = 'p2';
            playerToggle = 0;
        }
        col += room.choice;
        updateDb(room.gameid, col, room.points);
        io.in(room.gameid).emit('refresh', col, room.points);
    });

    sock.on('finishGame', (room) => {
        updatePlayerAfterGame(room.gameid, room.p1points, room.p2points);
    });

});

server.listen(8080, () => {
    console.log('Visit http://localhost:8080/')
});