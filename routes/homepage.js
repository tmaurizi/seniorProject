const express = require('express');
const router = express.Router();

// Brings the player to the initial pages
router.get('/', async (req, res) => {
    const game_list = await req.db.findGameList();

    // Makes an array of the top 10 players in order of points
    let player_list = await req.db.findPlayerList();
    let leaderboard_list = [];
    // Bubble sort algorithm to make it in ascending order
    // Reference https://www.geeksforgeeks.org/bubble-sort-algorithms-by-using-javascript/
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

    if (game_list) {
        res.render('availableGames', { game_list: game_list, leaderboard_list: leaderboard_list });
    }
    else {
        res.render('home', { message: 'Please create a game!' });
    }
});

// Creates a game and redirects the player to the game they just created
router.post('/create',async(req,res)=>{
    const gameid = await req.db.createGame(0);
    res.redirect('/' + gameid);
});

// Brings user to their history
router.get('/history', async (req, res) => {
    if (req.session.user == undefined) {
        res.redirect('/');
        return;
    }
    const games = await req.db.findGameByUsername(req.session.user.username);
    res.render('history', {gamelist: games});
});

// If the game exists and has less than 2 players then the player can join and be redirected
router.get('/:gameid', async (req, res) => {
    const game = await req.db.findGameById(req.params.gameid);
    if (game == null) {
        res.redirect('/');
        return;
    }
    if (game && game.playeramt < 2) {
        player = 'Guest';
        if (req.session.user != undefined) {
            player = req.session.user.username;
        }
        await req.db.playerJoin(req.params.gameid, player);
        res.render('game', { game: game, gameid: game.gameid });
    }
    else {
        res.redirect('/');
    }
});

module.exports = router;