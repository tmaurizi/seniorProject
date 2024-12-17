// *******************************************************************
// ACCOUNTS
// Handles account related routers
// *******************************************************************

// <*> MEMBERS <*>
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// *******************************************************************
// Name: GET Log in
// Purpose: Renders the login page
// *******************************************************************
router.get('/login', async (req, res) => {
    res.render('login', { hide_login: true });
});
// *******************************************************************
// Name: POST Log in
// Purpose: Checks that the player exists and then logs them in as session user
// *******************************************************************
router.post('/login', async (req, res) => {
    // Gets the inputted email
    const email = req.body.email.trim();
    // Gets the inputted passwords
    const password = req.body.password.trim();
    // Gets the player's information if they exist
    const player = await req.db.findPlayerByEmail(email);

    // If the player exists and the passwords match then set the session user to the player and redirect them to the lobby
    if (player && bcrypt.compareSync(password, player.password)) {
        req.session.user = player;
        res.redirect('/');
        return;
    }
    // If the player doesn't exist, re-render login page and return an error message
    else {
        res.render('login', { hide_login: true, message: 'Incorrect login' });
        return;
    }
});

// *******************************************************************
// Name: GET Log Out
// Purpose: Logs player out and then brings them back to the homepage
// *******************************************************************
router.get('/logout', async (req, res) => {
    req.session.user = undefined;
    res.redirect('/');
});

// *******************************************************************
// Name: GET Sign Up
// Purpose: Renders signup page
// *******************************************************************
router.get('/signup', async (req, res) => {
    res.render('signup', { hide_login: true });
});
// *******************************************************************
// Name: POST Sign Up
// Purpose: Add player to database if everything is valid
// *******************************************************************
router.post('/signup', async (req, res) => {
    // Gets the input values from signup page
    const email = req.body.email.trim();
    let username = req.body.username.trim();
    const password1 = req.body.password1.trim();
    const password2 = req.body.password2.trim();

    // Making sure that password match
    if (password1 != password2) {
        res.render('signup', { hide_login: true, message: 'Passwords do not match' });
        return;
    }

    // Making sure that username isn't already taken
    const player = await req.db.findPlayerByUsername(username);
    if (player) { 
        res.render('signup', { hide_login: true, message: 'This username is taken!' });
        return;
    }

    // Making sure username isn't guest
    if (username.toUpperCase() == 'GUEST') {
        res.render('signup', { hide_login: true, message: 'Can not make your username GUEST!' });
        return;
    }

    // Making sure username doesn't have spaces
    if (username.includes(' ')) {
        res.render('signup', { hide_login: true, message: 'Can not have spaces in your username!' });
        return;
    }

    // Making sure someone can't make a second account with the same email
    const account = await req.db.findPlayerByEmail(email);
    if (account) {
        res.render('signup', { hide_login: true, message: 'This email already has an account linked!' });
        return;
    }

    // Makes sure everything was filled in
    if (email == '' || username == '' || password1 == '' || password2 == '') {
        res.render('signup', { hide_login: true, message: 'One of the fields were empty.' });
        return;
    }

    // Hashes password to be added to database
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password1, salt);

    // Creates the player
    const id = await req.db.createPlayer(email, username, hash);
    // Sets the session user to the new user
    req.session.user = await req.db.findPlayerById(id);
    // Brings user back to lobby
    res.redirect('/');
});

// *******************************************************************
// Name: GET History
// Purpose: Brings user to their history
// *******************************************************************
router.get('/history', async (req, res) => {
    // If the user is not logged in, it redirects them to the lobby
    if (req.session.user == undefined) {
        res.redirect('/');
        return;
    }
    // Gets their games and then renders history page
    const games = await req.db.findGameByUsername(req.session.user.username);
    res.render('history', { gamelist: games });
});

// *******************************************************************
// Name: GET Friends
// Purpose: Brings user to their friends list page
// *******************************************************************
router.get('/friends', async (req, res) => {
    // If the user is not logged in, it redirects them to the lobby
    if (req.session.user == undefined) {
        res.redirect('/');
        return;
    }

    // Gets friends
    const friends = await req.db.findFriendsByPlayerUsername(req.session.user.username);
    // Checks if friends are empty
    let friendFlag = false;
    if (friends.friends == '') {
        friendFlag = true;
    }
    // Creates a readable list by splitting each friend into an array
    const friend_list = friends.friends.split(' ');

    // Gets requests
    const requests = await req.db.findRequestsByPlayerUsername(req.session.user.username);
    // Checks if friend requests are empty
    let requestFlag = false;
    if (requests.requests == '') {
        requestFlag = true;
    }
    // Creates a readable list by splitting each request username into an array
    const request_list = requests.requests.split(' ');
    // Renders friendList page with the friend_list, request_list, and each flag if they are empty
    res.render('friendList', { friend_list: friend_list, request_list: request_list, requestFlag: requestFlag, friendFlag: friendFlag, username: req.session.user.username });
});

// *******************************************************************
// Name: GET delete
// Purpose: Renders delete page for user
// *******************************************************************
router.get('/delete', async (req, res) => {
    res.render('delete', { username: req.session.user.username });
});

// *******************************************************************
// Name: POST delete
// Purpose: Deletes player from database and "resets" connection
// *******************************************************************
router.post('/delete', async (req, res) => {
    await req.db.deletePlayer(req.session.user.username);
    req.session.user = undefined;
    res.redirect('/');
});

module.exports = router;

