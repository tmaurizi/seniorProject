const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Renders the login page
router.get('/login', async (req, res) => {
    res.render('login', { hide_login: true });
});
// After player hits submit, checks that the player exists and the password matches the database and then they will be logged in 
router.post('/login', async (req, res) => {
    const email = req.body.email.trim();
    const password = req.body.password.trim();
    const player = await req.db.findPlayerByEmail(email);
    if (player && bcrypt.compareSync(password, player.password)) {
        req.session.user = player;
        res.redirect('/');
        return;
    }
    else {
        res.render('login', { hide_login: true, message: 'Incorrect login' });
        return;
    }
});

// Logs player out and then brings them back to the homepage
router.get('/logout', async (req, res) => {
    req.session.user = undefined;
    res.redirect('/');
});

// Renders signup page
router.get('/signup', async (req, res) => {
    res.render('signup', { hide_login: true });
});

// Will add the player to the database if passwords match and the username isn't taken
router.post('/signup', async (req, res) => {
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

    // Hashes password to be added to database
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password1, salt);

    const id = await req.db.createPlayer(email, username, hash);
    req.session.user = await req.db.findPlayerById(id);
    res.redirect('/');
});

// Brings user to their history
router.get('/history', async (req, res) => {
    if (req.session.user == undefined) {
        res.redirect('/');
        return;
    }
    const games = await req.db.findGameByUsername(req.session.user.username);
    res.render('history', { gamelist: games });
});

// Brings user to their friends list page
router.get('/friends', async (req, res) => {
    if (req.session.user == undefined) {
        res.redirect('/');
        return;
    }

    const friends = await req.db.findFriendsByPlayerUsername(req.session.user.username);
    // Checks if friends are empty
    let friendFlag = false;
    if (friends.friends == '') {
        friendFlag = true;
    }
    const friend_list = friends.friends.split(' ');

    const requests = await req.db.findRequestsByPlayerUsername(req.session.user.username);
    // Checks if friend requests are empty
    let requestFlag = false;
    if (requests.requests == '') {
        requestFlag = true;
    }
    const request_list = requests.requests.split(' ');

    res.render('friendList', { friend_list: friend_list, request_list: request_list, requestFlag: requestFlag, friendFlag: friendFlag, username: req.session.user.username });
});

module.exports = router;

