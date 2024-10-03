// Database design updated from web application design project
const assert = require('assert');
const sqlite = require('sqlite-async');
class DataStore {
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

    //---------------------------
    // PLAYER DB
    // Creates login for player
    async createPlayer(email, username, password) {
        const id = await this.create('Players', [
            { column: 'email', value: email },
            { column: 'username', value: username },
            { column: 'password', value: password },
            { column: 'totalPoints', value: '0' }
        ])
        return id;
    }

    // Updates player's total points
    async updatePlayerPoints(username, tp) {
        const player = await this.read('Players', [{ column: 'username', value: username }], 'totalPoints');
        if (player[0]) {
            const newPoints = parseInt(player[0].totalPoints) + tp;
            const updated = await this.update('Players', [
                { column: 'totalPoints', value: newPoints }],
                [{ column: 'username', value: username }]);

            return updated;
        }
        else {
            return undefined;
        }
    }

    // Returns all of the players in the database
    async findPlayerList() {
        const list = await this.read('Players', [], '*');
        if (list.length > 0) {
            return list;
        }
        else {
            return undefined;
        }
    }

    // Access to player according to id and returns information
    async findPlayerById(id) {
        const player = await this.read('Players', [{ column: 'id', value: id }], '*');
        if (player.length > 0) {
            return player[0];
        }
        else {
            return undefined;
        }
    }

    // Access to player according to email and returns information
    async findPlayerByEmail(email) {
        const player = await this.read('Players', [{ column: 'email', value: email }], '*');
        if (player.length > 0) {
            return player[0];
        }
        else {
            return undefined;
        }
    }

    // Used to avoid the same username
    async findPlayerByUsername(username) {
        const player = await this.read('Players', [{ column: 'username', value: username }], '*');
        if (player.length > 0) {
            return player[0];
        }
        else {
            return undefined;
        }
    }

    //---------------------------
    // GAME DB
    // Creates game with default values
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

    // Returns a list of games that username was in
    async findGameByUsername(username) {
        const game_list = await this.findGameList();
        let final_list = [];
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

    // Find the total amount of points for player 1 given game
    async findP1PointsByGame(game) {
        const uppersum = game.p1ones + game.p1twos + game.p1threes + game.p1fours + game.p1fives + game.p1sixes;
        let sum = uppersum + game.p1threeok + game.p1fourok + game.p1fullhouse + game.p1smstraight + game.p1lgstraight + game.p1yahtzee + game.p1chance;
        // For bonus
        if (uppersum > 63) {
            sum += 35;
        }
        return sum;
    };

    // Find the total amount of points for player 2 given game
    async findP2PointsByGame(game) {
        const uppersum = game.p2ones + game.p2twos + game.p2threes + game.p2fours + game.p2fives + game.p2sixes;
        let sum = uppersum + game.p2threeok + game.p2fourok + game.p2fullhouse + game.p2smstraight + game.p2lgstraight + game.p2yahtzee + game.p2chance;
        // For bonus
        if (uppersum > 63) {
            sum += 35;
        }
        return sum;
    }

    // Access to game according to id and returns information
    async findGameById(gameid) {
        const game = await this.read('Games', [{ column: 'gameid', value: gameid }], '*');
        if (game.length > 0) {
            return game[0];
        }
        else {
            return undefined;
        }
    }

    // Using the id, finds how many players are in the game
    async findGamePlayeramtById(gameid) {
        const game = await this.read('Games', [{ column: 'gameid', value: gameid }], '*');
        if (game.length > 0) {
            console.log(game[0]);
            return game[0];
        }
        else {
            return undefined;
        }
    }

    // Returns all of the games in the database
    async findGameList() {
        const list = await this.read('Games', [], '*');
        if (list.length > 0) {
            return list;
        }
        else {
            return undefined;
        }
    }

    // Returns player 1's username using the game id
    async findPlayer1FromGameid(gameid) {
        const game = await this.read('Games', [{ column: 'gameid', value: gameid }], 'p1username');

        return game[0].p1username;
    }

    // Returns player 2's username using the game id
    async findPlayer2FromGameid(gameid) {
        const game = await this.read('Games', [{ column: 'gameid', value: gameid }], 'p2username');

        return game[0].p2username;
    }

    // After a play joins, it updates the game using the game id to add one player to the existing amount
    async playerJoin(gameid, username) { 
        const game = await this.read('Games', [{ column: 'gameid', value: gameid }], 'playeramt');

        let tempPlayer = 'p1';
        if (game[0].playeramt == 1) {
            tempPlayer = 'p2';
        }
        const updated = await this.update('Games', [
            { column: 'playeramt', value: game[0].playeramt + 1 },
            { column: tempPlayer + 'username', value: username }],
            [{ column: 'gameid', value: gameid }]);

        return updated;
    }

    // Updates the playeramt to a specific number if using the game id (used when a player leaves or the game is reset)
    async updatePlayerById(gameid, value) {
        const updated = await this.update('Games', [
            { column: 'playeramt', value: value }],
            [{ column: 'gameid', value: gameid }]);

        return updated;
    }

    // Updates games database (the column) after each turn using the game id
    async updateTableById(gameid, col, value) {
        const updated = await this.update('Games', [
            { column: col, value: value }],
            [{ column: 'gameid', value: gameid }]);

        return updated;
    }

    // Resets the gameid
    async resetGame(gameid) {
        const updated = await this.update('Games', [
            { column: 'playeramt', value: 1 },
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

        return updated;
    }
}

module.exports = DataStore;