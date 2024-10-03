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

module.exports = router;

