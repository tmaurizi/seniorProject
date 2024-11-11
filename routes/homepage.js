// *******************************************************************
// HOMEPAGE
// Handles all other routers
// *******************************************************************

// <*> MEMBERS <*>
const express = require('express');
const router = express.Router();

// <*> FUNCTIONS <*>
// *******************************************************************
// Name: GET ( lobby )
// Purpose: Brings the user to the lobby
// Reference:
//      Bubble sort algorithm - https://www.geeksforgeeks.org/bubble-sort-algorithms-by-using-javascript/
// *******************************************************************
router.get('/', async (req, res) => {
    // Gets game list
    const game_list = await req.db.findGameList();

    // Makes an array of the top 10 players in order of points
    let player_list = await req.db.findPlayerList();
    let leaderboard_list = [];
    // Bubble sort algorithm to make it in ascending order
    try {
        for (let i = 0; i < player_list.length; i++) {
            for (let j = 0; j < (player_list.length - i - 1); j++) {
                if (player_list[j].totalPoints < player_list[j + 1].totalPoints) {
                    let temp = player_list[j];
                    player_list[j] = player_list[j + 1];
                    player_list[j + 1] = temp;
                }
            }
        }
        for (let i = 0; i < 10; i++) {
            if (player_list[i]) {
                leaderboard_list.push(player_list[i]);
            }
        }
    }
    catch (Exception) {
        leaderboard_list[0] = "No players exist!";
    }

    // If there's a game_list it renders the lobby page with the available games and the leaderboard
    if (game_list) {
        res.render('lobby', { game_list: game_list, leaderboard_list: leaderboard_list });
    }
    // Otherwise it brings user to the home page
    else {
        res.render('home', { message: 'Please create a game!' });
    }
});

// *******************************************************************
// Name: POST Create
// Creates a game and redirects the player to the game they just created
// *******************************************************************
router.post('/create', async (req, res) => {
    // Creates game with the game id
    const gameid = await req.db.createGame(0);
    // Takes player to the game
    res.redirect('/' + gameid);
});

// *******************************************************************
// Name: GET gameid
// Purpose: After checking validity of game, take player to game
// *******************************************************************
router.get('/:gameid', async (req, res) => {
    // Get the game information from the database
    const game = await req.db.findGameById(req.params.gameid);

    // Checks that the game exists
    if (game == null) {
        res.redirect('/');
        return;
    }
    // Checks that the game has either 0 or 1 players
    if (game && game.playeramt < 2) {
        player = 'Guest';
        // If the user is logged in, send the username to the game page
        if (req.session.user != undefined) {
            player = req.session.user.username;
        }
        // Adds the player to the database
        await req.db.playerJoin(req.params.gameid, player);
        // Renders game page
        res.render('game', { hide_login: true, game: game, gameid: game.gameid });
    }
    // Otherwise brings the user back to the lobby
    else {
        res.redirect('/');
    }
});

module.exports = router;