// *******************************************************************
// GAME FUNCTIONS
// Functions that don't require socket
// *******************************************************************

// <*> MEMBERS <*>
var dice = [
    [0, false],
    [0, false],
    [0, false],
    [0, false],
    [0, false]
];
var buttonChoice;
var possiblePoints;
var winner = 0;
var counter = 0;
var timesRolled = 0;
var hintCounter = 0;
// Current player (starts with p1)
player = 'p1';

// <*> FUNCTIONS <*>
// *******************************************************************
// Name: Save Dice
// Purpose: If a dice is clicked it is saved and will not change if the dice are re-rolled
// Parameters:
//      id - the dice that was clicked ( whether it was dice1, dice2, ... )
// *******************************************************************
const saveDice = async (id) => {
    // Gets the button element
    const btn = document.getElementById(id+'img');
    // Gets the corrected dice id number
    const index = parseInt(id[1]) - 1;

    // Depending on the current color of the button it will switch to either be saved or unsaved

    if (!btn.classList.contains('saveDice')) {
        btn.classList.add('saveDice');
        dice[index][1] = true;
    }
    else if (btn.classList.contains('saveDice')) {
        btn.classList.remove('saveDice');
        dice[index][1] = false;
    }
/*
    if (btn.style.background == 'lightgray') {
        btn.style.background = 'red';
        dice[index][1] = true;
    }
    else if (btn.style.background == 'red') { 
        btn.style.background = 'lightgray';
        dice[index][1] = false;
    }*/
};

// *******************************************************************
// Name: Roll Dice
// Purpose: Depending on if the dice is not being saved, it will randomly change the value to between 1-6 inclusive
// *******************************************************************
const rollDice = async () => {
    // Updates the amount of times rolled
    timesRolled++;

    // Checks to make sure that the player rolled before allowing them to save dice or ask for hint
    if (timesRolled > 0) {
        document.getElementById('d1').disabled = false;
        document.getElementById('d2').disabled = false;
        document.getElementById('d3').disabled = false;
        document.getElementById('d4').disabled = false;
        document.getElementById('d5').disabled = false;
        document.getElementById('hintbtn').disabled = false;
    }

    // Updates the dice array to contain random numbers if they are not being saved
    for (var i = 0; i < 5; i++) {
        if (dice[i][1] == false) {
            dice[i][0] = Math.round(Math.random() * 5)+1;
        }
    
    }
    // Calls function to update the dice values on the screen
    updateDice();

    // After the player has rolled 3 times, the button is disabled so they can't continue to roll
    if (timesRolled >= 3) {
        document.getElementById('rollbtn').disabled = true;
    }
};

// *******************************************************************
// Name: Reset Dice
// Purpose: Resets the dice after turns to have default value of 0
// *******************************************************************
const resetDice = async () => {
    // Iterates through the dice array and switches them to not being saved and their value is 0
    const diceList = ['d1img', 'd2img', 'd3img', 'd4img', 'd5img'];
    for (var i = 0; i < 5; i++) {
        dice[i][1] = false;
        dice[i][0] = 0;
        let btn = document.getElementById(diceList[i]);
        btn.classList.remove('saveDice');
    };
    // Calls function to update the dice values on the screen
    updateDice();
    // Resets number of times rolled for next turn
    timesRolled = 0;
};

// *******************************************************************
// Name: Update Dice
// Purpose: Updates each dice on the page with it's assigned value
// *******************************************************************
const updateDice = async () => {
    const imageNames = ['d1img', 'd2img', 'd3img', 'd4img', 'd5img'];
    // Goes through each dice and depending on the value, will update the image source
    for (let i = 0; i < 5; i++) {
        switch (dice[i][0]) {
            case 1:
                document.getElementById(imageNames[i]).src = '\\images\\dice-1.png';
                break;
            case 2:
                document.getElementById(imageNames[i]).src = '\\images\\dice-2.png';
                break;
            case 3:
                document.getElementById(imageNames[i]).src = '\\images\\dice-3.png';
                break;
            case 4:
                document.getElementById(imageNames[i]).src = '\\images\\dice-4.png';
                break;
            case 5:
                document.getElementById(imageNames[i]).src = '\\images\\dice-5.png';
                break;
            case 6:
                document.getElementById(imageNames[i]).src = '\\images\\dice-6.png';
                break;
            default:
                document.getElementById(imageNames[i]).src = '\\images\\dice-1.png';
        }
    }
};

// *******************************************************************
// Name: Check Winner
// Purpose: Checks to see if the set amount of turns has passed and compares each players totals
// Parameters:
//      player - the current player
//      p2total - player 2's total ( passed because the table wasn't being updated in time )
// *******************************************************************
const checkWinner = async (player, p2total) => { 
    // Counter is upped everytime a turn passes
    counter += 1;
    // Checks that 13 turns have passed ( every column in filled in ) and it's the end of the second player's turn
    if (counter == 2 && player == 'p2') {
        // Gets player 1's total from the total on screen
        p1total = parseInt(document.getElementById('p1total').innerHTML);

        // Determines the winner
        if (p1total > p2total) {
            winner = 2;
        }
        else if (p1total < p2total) {
            winner = 1;
        }
        else {
            winner = 3;
        }
    }
};

// *******************************************************************
// Name: Hint Popup
// Purpose: Finds the highest number of possible points depending on the current dice and updates the hint popup
// Reference:
//      use await keyword when calling madechoice function since it's a promise - https://stackoverflow.com/questions/71786191/how-to-get-result-from-a-promise-object
// *******************************************************************
const hintpopup = async () => {
    // Checks that the player only can use 3 hints per game
    if (hintCounter > 3) { 
        document.getElementById('hintParagraph').innerHTML = 'No hints left!';
    }
    else {
        hintCounter += 1;
        // Creates two lists: one for the table names and one for the official names
        const list = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes', 'threeok', 'fourok', 'fullhouse', 'smstraight', 'lgstraight', 'yahtzee', 'chance'];
        const displayList = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes', 'three of a kind', 'four of a kind', 'fullhouse', 'small straight', 'large straight', 'yahtzee', 'chance'];
        // Initializes variables
        var max = 0;
        var choice = 'one';

        // Iterates through each list element and get's the sum for each choice and to get the max
        for (let i = 0; i < list.length; i++) {
            var temp = await madeChoice(list[i], 1);
            // Makes sure that it's the max and that it's something that hasn't already been chosen
            if (max < temp && document.getElementById(player + list[i]).style.color != 'red') { 
                max = temp;
                choice = displayList[i];
            }
        }

        // Updates the hint popup to contain the column name and displays the max amount of points
        document.getElementById('hintParagraph').innerHTML = "Choose " + choice + " to get " + max + " points!";
    }
};

// *******************************************************************
// Name: Popup
// Purpose: Creates the popup on screen
// *******************************************************************
const popup = async (id) => {
    if (id == 'hintPopup') {
        hintpopup();
    }
    document.getElementById(id).classList.add('show');
};

// *******************************************************************
// Name: Close Popup
// Purpose: Closes the popup on screen and takes players to lobby
// *******************************************************************
const closePopup = async (id) => {
    document.getElementById(id).classList.remove('show');

    if (id = 'gameWinner') {
        location.assign('/');
    }
};

// *******************************************************************
// Name: Made Choice
// Purpose: Once the player has made their choice, it will update the choice variable and find the possible points
// Parameters:
//      id - the column in the table that the player chose
//      flag - depending on a 0 or 1 it will either update the game or just return the sum value
// Return: Either nothing or the sum depending on the flag's value
// *******************************************************************
const madeChoice = async (id, flag = 0) => {
    // Initializing variables
    buttonChoice = id;
    var sum = 0;

    // GIANT switch statement for each of the different columns to get the corresponding sum
    switch (buttonChoice) {
        // For ones through sixes just add up the sum of each dice if the number is equal to the correct column
        case 'ones':
            for (let i = 0; i < 5; i++) {
                if (dice[i][0] == 1) {
                    sum += 1;
                }
            }
            break;
        case 'twos':
            for (let i = 0; i < 5; i++) {
                if (dice[i][0] == 2) {
                    sum += 2;
                }
            }
            break;
        case 'threes':
            for (let i = 0; i < 5; i++) {
                if (dice[i][0] == 3) {
                    sum += 3;
                }
            }
            break;
        case 'fours':
            for (let i = 0; i < 5; i++) {
                if (dice[i][0] == 4) {
                    sum += 4;
                }
            }
            break;
        case 'fives':
            for (let i = 0; i < 5; i++) {
                if (dice[i][0] == 5) {
                    sum += 5;
                }
            }
            break;
        case 'sixes':
            for (let i = 0; i < 5; i++) {
                if (dice[i][0] == 6) {
                    sum += 6;
                }
            }
            break;
        // Checks that there are AT LEAST three of the same kind before adding the dice
        case 'threeok':
            count = 1;
            var kind;
            for (let i = 0; i < 5; i++) {
                kind = dice[i][0];
                for (let j = i + 1; j < 5; j++) {
                    if (kind == dice[j][0]) {
                        count++;
                    }
                }
                if (count < 3) {
                    count = 1;
                }
            }
            if (count >= 3) {
                for (let i = 0; i < 5; i++) {
                    sum += dice[i][0];
                }
            }
            break;
        // Checks that there are AT LEAST four of the same kind before adding the dice
        case 'fourok':
            count = 1;
            var kind;
            for (let i = 0; i < 5; i++) {
                kind = dice[i][0];
                for (let j = i + 1; j < 5; j++) {
                    if (kind == dice[j][0]) {
                        count++;
                    }
                }
                if (count < 4) {
                    count = 1;
                }
            }
            if (count >= 4) {
                for (let i = 0; i < 5; i++) {
                    sum += dice[i][0];
                }
            }
            break;
        // Checks that there is three of the same kind and two of a different kind
        case 'fullhouse':
            count = 0;
            kind1 = 0;
            for (let i = 0; i < 5; i++) {
                kind = dice[i][0];
                for (let j = i; j < 5; j++) {
                    if (kind == dice[j][0]) {
                        count++;
                    }
                }
                if (count == 3) {
                    kind1 = kind;
                }
                else {
                    count = 0;
                }
            }
            if (kind1 != 0) {
                count = 0;
                for (let i = 0; i < 5; i++) {
                    kind = dice[i][0];
                    if (kind != kind1) {
                        for (let j = i; j < 5; j++) {
                            if (kind == dice[j][0]) {
                                count++;
                            }
                        }
                        if (count == 2) {
                            sum = 25;
                        }
                        else {
                            count = 0;
                        }
                    }
                }
            }
            break;
        // Checks that the dice have a combination of at least four consecutive numbers
        case 'smstraight':
            tempDice = [];
            for (let i = 0; i < 5; i++) {
                tempDice[i] = dice[i][0];
            }
            if (tempDice.includes(3) && tempDice.includes(4)) {
                if ((tempDice.includes(1) && tempDice.includes(2)) || (tempDice.includes(2) && tempDice.includes(5)) || (tempDice.includes(5) && tempDice.includes(6))) {
                    sum = 30;
                }
            }
            break;
        // Checks that the dice are only consecutive numbers
        case 'lgstraight':
            tempDice = [];
            for (let i = 0; i < 5; i++) {
                tempDice[i] = dice[i][0];
            }
            if ((tempDice.includes(2) && tempDice.includes(3) && tempDice.includes(4) && tempDice.includes(5)) && (tempDice.includes(1) || tempDice.includes(6))) {
                sum = 40;
            }
            break;
        // Checks that the dice are all the same kind
        case 'yahtzee':
            var kind = dice[0][0];
            var yflag = 1;
            for (let i = 1; i < 5; i++) {
                if (kind != dice[i][0]) {
                    yflag = 0;
                }
            }
            if (yflag) {
                sum = 50;
            }
            break;
        // Adds up all the dice
        case 'chance':
            sum = dice[0][0] + dice[1][0] + dice[2][0] + dice[3][0] + dice[4][0];
            break;
        default:
            sum = 0;
    }

    // If this function was called by the pug page it just updates the game for the players
    if (flag == 0) {
        document.getElementById('possiblePoints').innerHTML = sum;
        possiblePoints = sum;
    }
    // Otherwise it was just used to get the sum so it will return that
    else {
        return sum;
    }
};