
// FUNCTIONS THAT DON'T REQUIRE SOCKET

// Variables that are used in client code
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

// If a dice is clicked it is saved and will not change if the dice are re-rolled
const saveDice = async (id) => {
    const btn = document.getElementById(id);
    const index = parseInt(id[1]) - 1;
    if (btn.style.background == 'lightgray') {
        btn.style.background = 'red';
        dice[index][1] = true;
    }
    else if (btn.style.background == 'red') { 
        btn.style.background = 'lightgray';
        dice[index][1] = false;
    }
};

// Resets the dice after turns to have default value
const resetDice = async () => {
    timesRolled = 0;
    for (var i = 0; i < 5; i++) {
        dice[i][1] = false;
        dice[i][0] = 0;
    };
    updateDice();
};

// If the dice is not being saved, it will randomly change the value to between 1-6 inclusive
const rollDice = async () => {
    timesRolled++;
    if (timesRolled > 0) {
        document.getElementById('d1').disabled = false;
        document.getElementById('d2').disabled = false;
        document.getElementById('d3').disabled = false;
        document.getElementById('d4').disabled = false;
        document.getElementById('d5').disabled = false;
        document.getElementById('hintbtn').disabled = false;
    }

    for (var i = 0; i < 5; i++) {
        if (dice[i][1] == false) {
            dice[i][0] = Math.round(Math.random() * 5)+1;
        }
    
    }

    updateDice();

    if (timesRolled >= 3) {
        document.getElementById('rollbtn').disabled = true;
    }
};

// Updates each dice on the page with it's assigned value
const updateDice = async () => {
    document.getElementById('d1').innerHTML = dice[0][0];
    document.getElementById('d2').innerHTML = dice[1][0];
    document.getElementById('d3').innerHTML = dice[2][0];
    document.getElementById('d4').innerHTML = dice[3][0];
    document.getElementById('d5').innerHTML = dice[4][0];
};

// After they make a choice it will find how many points are possible from the choice and the current dice and then displays the points to the user
const madeChoice = async (id,flag=0) => {
    buttonChoice = id;
    var sum = 0;
    switch (buttonChoice) {
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
        case 'lgstraight':
            tempDice = [];
            for (let i = 0; i < 5; i++) {
                tempDice[i] = dice[i][0];
            }
            if ((tempDice.includes(2) && tempDice.includes(3) && tempDice.includes(4) && tempDice.includes(5)) && (tempDice.includes(1) || tempDice.includes(6))) {
                sum = 40;
            }
            break;
        case 'yahtzee':
            var kind = dice[0][0];
            var flag = 1;
            for (let i = 1; i < 5; i++) {
                if (kind != dice[i][0]) {
                    flag = 0;
                }
            }
            if (flag) {
                sum = 50;
            }
            break;
        case 'chance':
            sum = dice[0][0] + dice[1][0] + dice[2][0] + dice[3][0] + dice[4][0];
            break;
        default:
            sum = 0;
    }

    

    if (flag == 0) {
        document.getElementById('possiblePoints').innerHTML = sum;
        possiblePoints = sum;
    }
    else {
        return sum;
    }
};

// Checks to see if the set amount of turns has passed and compares each players totals
const checkWinner = async (player, p2total) => { 
    counter += 1;
    if (counter == 13 && player == 'p2') {
        p1total = parseInt(document.getElementById('p1total').innerHTML);
        if (p1total > p2total) {
            winner = 1;
        }
        else if (p1total < p2total) {
            winner = 2;
        }
        else {
            winner = 3;
        }
    }
};

// for await using madechoice function since it's a promise https://stackoverflow.com/questions/71786191/how-to-get-result-from-a-promise-object
const hintpopup = async () => {
    if (hintCounter > 3) { 
        document.getElementById('hintParagraph').innerHTML = 'No hints left!';
    }
    else {
        hintCounter += 1;
        const list = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes', 'threeok', 'fourok', 'fullhouse', 'smstraight', 'lgstraight', 'yahtzee', 'chance'];
        const displayList = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes', 'three of a kind', 'four of a kind', 'fullhouse', 'small straight', 'large straight', 'yahtzee', 'chance'];
        var max = 0;
        var choice = 'one';
        for (let i = 0; i < list.length; i++) {
            var temp = await madeChoice(list[i], 1);
            if (max < temp && document.getElementById(player + list[i]).style.color != 'red') { 
                max = temp;
                choice = displayList[i];
            }
        }

        document.getElementById('hintParagraph').innerHTML = "Choose " + choice + " to get " + max + " points!";
    }
};

const popup = async (id) => {
    if (id == 'hintPopup') {
        hintpopup();
    }
    document.getElementById(id).classList.add('show');
}
const closePopup = async (id) => {
    document.getElementById(id).classList.remove('show');
}