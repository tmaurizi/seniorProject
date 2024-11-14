// *******************************************************************
// DATABASE
// Manages updating and viewing the database
// References:
//      Database design updated from my web application design project
// *******************************************************************


// <*> MEMBERS <*>
const assert = require('assert');
const { request } = require('http');
const sqlite = require('sqlite-async');


class DataStore {
    // Creates the database path
    constructor() {
        this.path = process.env.DBPATH;
        assert(this.path !== undefined, "DBPATH not specified in environment.");
    }

    // Connects to database
    async connect() {
        this.db = await sqlite.open(this.path);
    }

    // Creates database if it does not exist
    async create(table, data) {
        const params = Array(data.length).fill('?')
        const sql = `INSERT into ${table} (${data.map(d => d.column).join(',')}) values(${params.join(',')})`;
        const result = await this.db.run(
            sql,
            data.map(d => d.value));
        return result.lastID;
    }

    // Returns specified values from query
    async read(table, query, row) {
        let sql = `SELECT ${row} from ${table}`;
        if (query.length > 0) {
            sql += ` WHERE ${query.map(d => `${d.column}=?`).join(' and ')}`
        }
        return await this.db.all(
            sql, query.map(d => d.value)
        );
    }

    // Updates database with query
    async update(table, data, query) {
        let sql = `UPDATE ${table} set ${data.map(d => `${d.column}=?`)} where ${query.map(d => `${d.column} = ?`).join(' and ')}`;
        const _data = data.map(d => d.value).concat(query.map(q => q.value));
        return await this.db.run(sql, _data)
    }

    // Creates the table with the shell of schema
    async schema(table, schema, pkey) {
        const sql = `CREATE TABLE IF NOT EXISTS "${table}"
            (${schema.map(c => `"${c.name}" ${c.type}`).join(", ")},
            PRIMARY KEY ("${pkey}"))`;
        await this.db.run(sql);
        return;
    }

    // Deletes specified row from table according to query
    async delete(table, query) {
        assert(query.length > 0, 'Deleting without query is a bad idea');
        let sql = `DELETE from ${table} WHERE ${query.map(d => `${d.column} = ?`).join(' and ')}`;
        return await this.db.all(
            sql, query.map(d => d.value)
        );
    }

    // *******************************************************************
    // <*> PLAYER TABLE FUNCTIONS <*>
    // *******************************************************************

    // *******************************************************************
    // Name: Create Player
    // Purpose: Adds a new player to the database with their information
    // Parameters:
    //      email - the new player's email address
    //      username - the new player's username
    //      password - the new player's password
    // Return: The new player's id
    // *******************************************************************
    async createPlayer(email, username, password) {
        // Creates the player with their information and initializes them with no friends, friend requests, or total points
        const id = await this.create('Players', [
            { column: 'email', value: email },
            { column: 'username', value: username },
            { column: 'password', value: password },
            { column: 'friends', value: '' },
            { column: 'requests', value: '' },
            { column: 'totalPoints', value: '0' }
        ])
        return id;
    }

    // *******************************************************************
    // Name: Find Player List
    // Purpose: Returns a list of all the players in the database
    // Return: The list of players
    // *******************************************************************
    async findPlayerList() {
        // Gets the list of all players
        const list = await this.read('Players', [], '*');
        // If the list has players 
        if (list.length > 0) {
            return list;
        }
        else {
            return undefined;
        }
    }

    // *******************************************************************
    // Name: Find Player By ID
    // Purpose: Access to player according to id and returns information
    // Parameters:
    //      id - the player's id
    // Return: The information of the player
    // *******************************************************************
    async findPlayerById(id) {
        // Find the player in the database from their id
        const player = await this.read('Players', [{ column: 'id', value: id }], '*');
        // If the player exists
        if (player.length > 0) {
            return player[0];
        }
        else {
            return undefined;
        }
    }

    // *******************************************************************
    // Name: Find Player By Email
    // Purpose: Access to player according to email and returns information
    // Parameters:
    //      email - the player's email
    // Return: The information of the player
    // *******************************************************************
    async findPlayerByEmail(email) {
        // Find the player in the database from their email
        const player = await this.read('Players', [{ column: 'email', value: email }], '*');
        // If the player exists
        if (player.length > 0) {
            return player[0];
        }
        else {
            return undefined;
        }
    }

    // *******************************************************************
    // Name: Find Player By Username
    // Purpose: Used to avoid the same username or to get information using their username
    // Parameters:
    //      username - the username to be tested
    // Return: The information of the player
    // *******************************************************************
    async findPlayerByUsername(username) {
        // Find the player in the database from their username
        const player = await this.read('Players', [{ column: 'username', value: username }], '*');
        // If the player exists
        if (player.length > 0) {
            return player[0];
        }
        else {
            return undefined;
        }
    }

    // *******************************************************************
    // Name: Update Player Points
    // Purpose: Updates player's total points
    // Parameters:
    //      username - the player's username
    //      tp - the total points from the game they just played
    // Return: The player's total points
    // *******************************************************************
    async updatePlayerPoints(username, tp) {
        // Gets the player's current total points
        const player = await this.read('Players', [{ column: 'username', value: username }], 'totalPoints');
        // If the player exists
        if (player[0]) {
            // Add their old total to the new total that was passed
            const newPoints = parseInt(player[0].totalPoints) + tp;
            // Update the table with their new username
            const updated = await this.update('Players', [
                { column: 'totalPoints', value: newPoints }],
                [{ column: 'username', value: username }]);

            return updated;
        }
        else {
            return undefined;
        }
    }

    // *******************************************************************
    // <*> FRIEND FUNCTIONS <*>
    // *******************************************************************

    // *******************************************************************
    // Name: Find Friends By Player Username
    // Purpose: Finds player's friend list
    // Parameters:
    //      username - the username of the player
    // Return: The player's friend list
    // *******************************************************************
    async findFriendsByPlayerUsername(username) {
        // Finds the friends column from the database using their username
        const friends = await this.read('Players', [{ column: 'username', value: username }], 'friends');
        // If the friend list exists
        if (friends.length > 0) {
            return friends[0];
        }
        else {
            return undefined;
        }
    }

    // *******************************************************************
    // Name: Find Requests By Player Username
    // Purpose: Finds player's friend requests
    // Parameters:
    //      username - the username of the player
    // Return: The player's friend requests
    // *******************************************************************
    async findRequestsByPlayerUsername(username) {
        // Finds the friend requests column from the database using their username
        const requests = await this.read('Players', [{ column: 'username', value: username }], 'requests');
        // If there are friend requests
        if (requests.length > 0) {
            return requests[0];
        }
        else {
            return undefined;
        }
    }

    // *******************************************************************
    // Name: Add Friend By Player Username
    // Purpose: Adds a friend to the player's friend list
    // Parameters:
    //      player - the current player whose friend list we are updating
    //      friendUsername - the username of the friend
    // Return: The player's friend list
    // *******************************************************************
    async addFriendByPlayerUsername(player, friendUsername) {
        // Gets existing friends
        const friends = await this.read('Players', [{ column: 'username', value: player }], 'friends');
        // Adds the new friend to the top of the player's friend list
        let friendList = friendUsername;
        if (friends.length > 0) { 
            friendList += (' ' + friends[0].friends);
        }

        // Checks if at the end of the friendList there's a space ( Gets added after first friend )
        if (friendList.substring(friendList.length-1,friendList.length)==' ') {
            friendList = friendList.substring(0, friendList.length - 1);
        }

        // Updates the database
        const updated = await this.update('Players', [{ column: 'friends', value: friendList }], [{ column: 'username', value: player }]);
        return updated;
    }

    // *******************************************************************
    // Name: Remove Friend By Player Username
    // Purpose: Removes friend from player's friend list
    // Parameters:
    //      player - the current player whose friend list we are updating
    //      friendUsername - the username of the friend
    // Return: The player's friend list
    // *******************************************************************
    async removeFriendByPlayerUsername(player, friendUsername) {
        // Gets existing friends
        const friends = await this.read('Players', [{ column: 'username', value: player }], 'friends');

        // If the friends list is already empty does nothing
        if (friends.length == 0) {
            return;
        }

        // Splits the friends into an array of each username
        let friend_list = friends[0].friends.split(' ');

        // Get the index of where the friend's username is
        const index = friend_list.indexOf(friendUsername);
        // If the friend is in the list removes the friend
        if (index > -1) {
            friend_list.splice(index, 1);
        }

        // If the list is empty after removing the friend removes the spaces and resets the list
        if (friend_list.length == 0) {
            friend_list = '';
        }

        // Creates a new string with the friends to put into database
        const newFriends = friend_list.join(' ');

        // Updates the database
        const updated = await this.update('Players', [{ column: 'friends', value: newFriends }], [{ column: 'username', value: player }]);
        return updated;
    }

    // *******************************************************************
    // Name: Check Friend In List
    // Purpose: Checks if a friend is already in player's friend list
    // Parameters:
    //      player - the current player whose friend list we are looking through
    //      friendUsername - the username of the friend
    // Return: 1 if the friend is in list, 0 if the friend is NOT in list
    // *******************************************************************
    async checkFriendInList(player, friendUsername) {
        // Gets friend list
        const friends = await this.read('Players', [{ column: 'username', value: player }], 'friends');

        // If the friend list is empty return
        if (friends.length == 0) {
            return;
        }

        // Splits the friends into an array of each username
        let checklist = friends[0].friends.split(' ');

        // Goes through the whole array and if the friend is in the list, returns 1
        for (let i = 0; i < checklist.length; i++) {
            if (checklist[i] == friendUsername) {
                return 1;
            }
        }

        return 0;
    }

    // *******************************************************************
    // Name: Friend Request
    // Purpose: Sends friend request to the friend from the player
    // Parameters:
    //      player - the player sending the friend request
    //      friend - the player receiving the friend request
    // Return: The player's friend requests
    // *******************************************************************
    async friendRequest(player, friend) {
        // Gets existing request list of friend
        const requests = await this.read('Players', [{ column: 'username', value: friend }], 'requests');

        // Adds the player's friend request to the top of the friend's friend request list
        let friendRequest = player;
        if (requests.length > 0) {
            friendRequest += (' ' + requests[0].requests);
        }

        // Checks if at the end of the request list there's a space ( Gets added after first request )
        if (friendRequest.substring(friendRequest.length - 1, friendRequest.length) == ' ') {
            friendRequest = friendRequest.substring(0, friendRequest.length - 1);
        }

        // Updates the database
        const updated = await this.update('Players', [{ column: 'requests', value: friendRequest }], [{ column: 'username', value: friend }]);
        return updated;
    }

    // *******************************************************************
    // Name: Remove Request
    // Purpose: Removes a request from the player's request list
    // Parameters:
    //      player - the current player whose request list we are updating
    //      requestUsername - the username we are removing from the player's request list
    // Return: The player's friend request list
    // References:
    //      getting the index of the player - https://stackoverflow.com/questions/5767325/how-can-i-remove-a-specific-item-from-an-array-in-javascript#:~:text=Find%20the%20index%20of%20the,and%2For%20adding%20new%20elements.&text=The%20second%20parameter%20of%20splice%20is%20the%20number%20of%20elements%20to%20remove.
    // *******************************************************************
    async removeRequest(player, requestUsername) {
        // Gets request list
        const requests = await this.read('Players', [{ column: 'username', value: player }], 'requests');
        // Checks if the request list is empty
        if (requests.length == 0) {
            return;
        }
        // Splits the requests into an array of each username
        let request_list = requests[0].requests.split(' ');

        // Gets the index of the username in the request list
        const index = request_list.indexOf(requestUsername);
        // If the username is in the request list, removes it
        if (index > -1) {
            request_list.splice(index, 1);
        }

        // If the list is empty after removing the request removes the spaces and resets the list
        if (request_list.length == 0) { 
            request_list = '';
        }

        // Creates a new string with the requests to put into database
        const newRequests = request_list.join(' ');

        // Updates the database
        const updated = await this.update('Players', [{ column: 'requests', value: newRequests }], [{ column: 'username', value: player }]);
        return updated;
    }

    // *******************************************************************
    // Name: Check Name In Request List
    // Purpose: Checks if username is in player's request list
    // Parameters:
    //      player - the current player whose request list we are looking through
    //      otherUsername - the username we are looking for in the request list
    // Return: True, if the username is in the player's friend request list, false if the username is NOT in the player's friend request list
    // *******************************************************************
    async checkNameInRequestList(player, otherUsername) {
        // Gets request list
        const requests = await this.read('Players', [{ column: 'username', value: player }], 'requests');
        // Checks if the request list is empty
        if (requests.length == 0) { 
            return false;
        }

        // If the username is in the request list, return true
        const index = requests[0].requests.indexOf(otherUsername);
        if (index != -1) {
            return true;
        }
        // Otherwise return false
        else {
            return false;
        }
    }

    // *******************************************************************
    // <*> GAME FUNCTIONS <*>
    // *******************************************************************

    // *******************************************************************
    // Name: Create Game
    // Purpose: Creates game with default values
    // Parameters:
    //      playeramt - The amount of player's the game is starting with
    // Return: The gameid of new game
    // *******************************************************************
    async createGame(playeramt) {
        const gameid = await this.create('Games', [
            { column: 'playeramt', value: playeramt },
            { column: 'p1ones', value: '0' },
            { column: 'p1twos', value: '0' },
            { column: 'p1threes', value: '0' },
            { column: 'p1fours', value: '0' },
            { column: 'p1fives', value: '0' },
            { column: 'p1sixes', value: '0' },
            { column: 'p1threeok', value: '0' },
            { column: 'p1fourok', value: '0' },
            { column: 'p1fullhouse', value: '0' },
            { column: 'p1smstraight', value: '0' },
            { column: 'p1lgstraight', value: '0' },
            { column: 'p1yahtzee', value: '0' },
            { column: 'p1chance', value: '0' },
            { column: 'p2ones', value: '0' },
            { column: 'p2twos', value: '0' },
            { column: 'p2threes', value: '0' },
            { column: 'p2fours', value: '0' },
            { column: 'p2fives', value: '0' },
            { column: 'p2sixes', value: '0' },
            { column: 'p2threeok', value: '0' },
            { column: 'p2fourok', value: '0' },
            { column: 'p2fullhouse', value: '0' },
            { column: 'p2smstraight', value: '0' },
            { column: 'p2lgstraight', value: '0' },
            { column: 'p2yahtzee', value: '0' },
            { column: 'p2chance', value: '0' },
            { column: 'p1username', value: 'None' },
            { column: 'p2username', value: 'None' }
        ])
        return gameid;
    }

    // *******************************************************************
    // Name: Find Game List
    // Purpose: Returns list of all of the games in the database
    // Return: List of all the games
    // *******************************************************************
    async findGameList() {
        const list = await this.read('Games', [], '*');
        // Checks that the list isn't empty
        if (list.length > 0) {
            return list;
        }
        else {
            return undefined;
        }
    }

    // *******************************************************************
    // Name: Find Game By Id
    // Purpose: Accesses game according to id and returns information
    // Parameters:
    //      gameid - the game's id that we are looking up
    // Return: The game
    // *******************************************************************
    async findGameById(gameid) {
        const game = await this.read('Games', [{ column: 'gameid', value: gameid }], '*');
        // Checks if the game exists
        if (game.length > 0) {
            return game[0];
        }
        else {
            return undefined;
        }
    }

    // *******************************************************************
    // Name: Find Game By Username
    // Purpose: Returns a list of games that the player was in
    // Parameters:
    //      username - the username of the player we are searching for
    // Return: The list of games the player was in
    // *******************************************************************
    async findGameByUsername(username) {
        // Gets all the possible games
        const game_list = await this.findGameList();

        let final_list = [];
        // Goes through each game and tests if player 1 or player 2 matches the username
        //      If it does, we push the gameid, points, and the opponent's name into the list
        for (let i = 0; i < game_list.length; i++) {            
            if (await this.findPlayer1FromGameid(game_list[i].gameid) == username) {
                const points = await this.findP1PointsByGame(game_list[i], 'p1');
                final_list.push([game_list[i].gameid, points, game_list[i].p2username]);
            }
            else if (await this.findPlayer2FromGameid(game_list[i].gameid) == username) {
                const points = await this.findP2PointsByGame(game_list[i], 'p2');
                final_list.push([game_list[i].gameid,points,game_list[i].p1username]);
            }
        }
        return final_list;
    }

    // *******************************************************************
    // Name: Update Table By Id
    // Purpose: Updates game's database (the column) after each turn using the game id
    // Parameters:
    //      gameid - the game's id
    //      col - the column that's getting updated
    //      value - the points that we are using as the value for the column
    // Return: The updated game
    // *******************************************************************
    async updateTableById(gameid, col, value) {
        const updated = await this.update('Games', [
            { column: col, value: value }],
            [{ column: 'gameid', value: gameid }]);

        return updated;
    }

    // *******************************************************************
    // Name: Updated Player By Id
    // Purpose: Updates the playeramt to a specific number if using the game id (used when a player leaves or the game is reset)
    // Parameters:
    //      gameid - the game's id
    //      value - the new value of how many players
    // Return: The updated game
    // *******************************************************************
    async updatePlayerById(gameid, value) {
        const updated = await this.update('Games', [
            { column: 'playeramt', value: value }],
            [{ column: 'gameid', value: gameid }]);

        return updated;
    }

    // *******************************************************************
    // Name: Player Join
    // Purpose: After a player joins, it updates the game using the game id to add one player to the existing amount
    // Parameters:
    //      gameid - the game's id
    //      username - the username of the player that just joined
    // Return: The updated game
    // *******************************************************************
    async playerJoin(gameid, username) {
        // Gets the game using gameid
        const game = await this.read('Games', [{ column: 'gameid', value: gameid }], 'playeramt');

        // Makes sure to set the correct player to the username so it's not overwriting the player 1 or player 2
        let tempPlayer = 'p1';
        if (game[0].playeramt == 1) {
            tempPlayer = 'p2';
        }

        // Updates database with the new playeramt and the username of the correct player
        const updated = await this.update('Games', [
            { column: 'playeramt', value: game[0].playeramt + 1 },
            { column: tempPlayer + 'username', value: username }],
            [{ column: 'gameid', value: gameid }]);

        return updated;
    }

    // *******************************************************************
    // Name: Find Player 1 Points By Game
    // Purpose: Find the total amount of points for player 1 given game
    // Parameters:
    //      game - the game that was played ( includes all columns )
    // Return: The sum of all the points together
    // *******************************************************************
    async findP1PointsByGame(game) {
        const uppersum = game.p1ones + game.p1twos + game.p1threes + game.p1fours + game.p1fives + game.p1sixes;
        let sum = uppersum + game.p1threeok + game.p1fourok + game.p1fullhouse + game.p1smstraight + game.p1lgstraight + game.p1yahtzee + game.p1chance;
        // For bonus
        if (uppersum > 63) {
            sum += 35;
        }
        return sum;
    };

    // *******************************************************************
    // Name: Find Player 2 Points By Game
    // Purpose: Find the total amount of points for player 2 given game
    // Parameters:
    //      game - the game that was played ( includes all columns )
    // Return: The sum of all the points together
    // *******************************************************************
    async findP2PointsByGame(game) {
        const uppersum = game.p2ones + game.p2twos + game.p2threes + game.p2fours + game.p2fives + game.p2sixes;
        let sum = uppersum + game.p2threeok + game.p2fourok + game.p2fullhouse + game.p2smstraight + game.p2lgstraight + game.p2yahtzee + game.p2chance;
        // For bonus
        if (uppersum > 63) {
            sum += 35;
        }
        return sum;
    }

    // *******************************************************************
    // Name: Find Player 1 From Game Id
    // Purpose: Returns player 1's username using the game id
    // Parameters:
    //      gameid - the game's id
    // Return: Player 1's username
    // *******************************************************************
    async findPlayer1FromGameid(gameid) {
        const game = await this.read('Games', [{ column: 'gameid', value: gameid }], 'p1username');
        return game[0].p1username;
    }

    // *******************************************************************
    // Name: Find Player 2 From Game Id
    // Purpose: Returns player 2's username using the game id
    // Parameters:
    //      gameid - the game's id
    // Return: Player 2's username
    // *******************************************************************
    async findPlayer2FromGameid(gameid) {
        const game = await this.read('Games', [{ column: 'gameid', value: gameid }], 'p2username');
        return game[0].p2username;
    }

    // *******************************************************************
    // Name: Reset Game
    // Purpose: Resets the all columns of the game using gameid
    // Parameters:
    //      gameid - the game's id
    //      username - the username of the player that left ( to be taken out )
    // Return: The updated game
    // *******************************************************************
    async resetGame(gameid, username) {
        const game = await this.read('Games', [{ column: 'gameid', value: gameid }], '*');

        // Updates all the table columns
        let updated = await this.update('Games', [
            { column: 'playeramt', value: game[0].playeramt-1 },
            { column: 'p1ones', value: '0' },
            { column: 'p1twos', value: '0' },
            { column: 'p1threes', value: '0' },
            { column: 'p1fours', value: '0' },
            { column: 'p1fives', value: '0' },
            { column: 'p1sixes', value: '0' },
            { column: 'p1threeok', value: '0' },
            { column: 'p1fourok', value: '0' },
            { column: 'p1fullhouse', value: '0' },
            { column: 'p1smstraight', value: '0' },
            { column: 'p1lgstraight', value: '0' },
            { column: 'p1yahtzee', value: '0' },
            { column: 'p1chance', value: '0' },
            { column: 'p2ones', value: '0' },
            { column: 'p2twos', value: '0' },
            { column: 'p2threes', value: '0' },
            { column: 'p2fours', value: '0' },
            { column: 'p2fives', value: '0' },
            { column: 'p2sixes', value: '0' },
            { column: 'p2threeok', value: '0' },
            { column: 'p2fourok', value: '0' },
            { column: 'p2fullhouse', value: '0' },
            { column: 'p2smstraight', value: '0' },
            { column: 'p2lgstraight', value: '0' },
            { column: 'p2yahtzee', value: '0' },
            { column: 'p2chance', value: '0' }],
            [{ column: 'gameid', value: gameid }]);

        // Finds which player the username is 
        let player;

        if (game[0].p1username == username) {
            player = 'p1';
        }
        else if (game[0].p2username == username) {
            player = 'p2';
        }

        // Updates either player 1 or player 2 to none after they left
        updated = await this.update('Games', [
            { column: player + 'username', value: 'None' }],
            [{ column: 'gameid', value: gameid }]);

        return updated;
    }
}

module.exports = DataStore;