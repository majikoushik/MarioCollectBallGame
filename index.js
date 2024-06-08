// Collect The Square game

// Get a reference to the canvas DOM element
var canvas = document.getElementById('canvas');
// Get the canvas drawing context
var context = canvas.getContext('2d');
canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.9;

// Your score
var score = 0;

// Properties for your square
var x = 50; // X position
var y = 100; // Y position
var speed = 6; // Distance to move each frame
var sideLength = 50; // Length of each side of the square

// Flags to track which keys are pressed
var down = false;
var up = false;
var right = false;
var left = false;

// Properties for the target square
var targetX = 0;
var targetY = 0;
var targetLength = 25;
var targetHitSoundObj;
var backgroundSoundObj;

var backgroundImage = new Image();
backgroundImage.src = "backgroundImage.png";

var targetImage = new Image();
targetImage.src = "pokeball.png";
var targetPositionXInImage = Math.floor(Math.random() * 4) + 0;// get position from 0-4
const targetImageSize = 33;
const targetScale = 2;

var characterImage = new Image();
characterImage.src = "Character.png";
var characterScale = 4;
var characterWidth = 16;
var characterHeight = 18;
var characterPositionYInImage = 0;
const cycleLoopForPositionX = [0, 1, 0, 2];
var currentLoopIndex = 0;

class sound {
    constructor(src, volume) {
        this.sound = document.createElement("audio");
        this.sound.src = src;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        this.sound.volume = volume;
        document.body.appendChild(this.sound);
        this.play = function () {
            this.sound.play();
        };
        this.stop = function () {
            this.sound.pause();
        };
        this.refresh = function () {
            this.sound.currentTime = 0;
        }
    }
}

// Determine if number a is within the range b to c (exclusive)
function isWithin(a, b, c) {
    return (a > b && a < c);
}

// Countdown timer (in seconds)
var countdown = 30;
// ID to track the setTimeout
var id = null;
var reAnimId = null;

// Listen for keydown events
canvas.addEventListener('keydown', function (event) {
    event.preventDefault();
    if (event.keyCode === 40) { // DOWN
        down = true;
    }
    if (event.keyCode === 38) { // UP
        up = true;
    }
    if (event.keyCode === 37) { // LEFT
        left = true;
    }
    if (event.keyCode === 39) { // RIGHT
        right = true;
    }
});

// Listen for keyup events
canvas.addEventListener('keyup', function (event) {
    event.preventDefault();
    if (event.keyCode === 40) { // DOWN
        down = false;
    }
    if (event.keyCode === 38) { // UP
        up = false;
    }
    if (event.keyCode === 37) { // LEFT
        left = false;
    }
    if (event.keyCode === 39) { // RIGHT
        right = false;
    }
});

// Show the start menu
function menu() {
    erase();
    context.fillStyle = '#000000';
    context.font = '36px Arial';
    context.textAlign = 'center';
    context.fillText('Collect the Square!', canvas.width / 2, canvas.height / 4);
    context.font = '24px Arial';
    context.fillText('Click to Start', canvas.width / 2, canvas.height / 2);
    context.font = '18px Arial'
    context.fillText('Use the arrow keys to move', canvas.width / 2, (canvas.height / 4) * 3);
    // Start the game on a click
    canvas.addEventListener('click', startGame);
}

// Start the game
function startGame() {
    countdown = 30;
    score = 0;
    // Reduce the countdown timer ever second
    id = setInterval(function () {
        countdown--;
    }, 1000)
    // Stop listening for click events
    canvas.removeEventListener('click', startGame);
    // Put the target at a random starting point
    moveTarget();
    // Kick off the draw loop
    draw();
    backgroundSoundObj = new sound("sounds/main-theme.mp3", 0.3);
    backgroundSoundObj.play();
    targetHitSoundObj = new sound("sounds/pickup.mp3", 0.6);

}

// Show the game over screen
function endGame() {
    // Stop the countdown
    clearInterval(id);
    // Display the final score
    erase();
    backgroundSoundObj.stop();
    context.fillStyle = '#000000';
    context.font = '24px Arial';
    context.textAlign = 'center';
    context.fillText('Final Score: ' + score, canvas.width / 2, canvas.height / 2);
    context.font = '18px Arial';
    context.fillText('Click to Refresh', canvas.width / 2, (canvas.height / 4) * 3);
    canvas.addEventListener('click', startGame);
    window.cancelAnimationFrame(reAnimId);
}

// Move the target square to a random position
function moveTarget() {
    targetX = Math.round(Math.random() * canvas.width - targetLength);
    targetY = Math.round(Math.random() * canvas.height - targetLength)
}

// Clear the canvas
function erase(withImage = false) {
    if (withImage) {
        context.fillStyle =  context.createPattern(backgroundImage, "repeat");;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fill();
    } else {
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
}


// The main draw loop
function draw() {
    erase(true);
    // Move the square
    if (down) {
        y += speed;
        characterPositionYInImage = 0;
        currentLoopIndex++;
    }
    if (up) {
        y -= speed;
        characterPositionYInImage = 1;
        currentLoopIndex++;
    }
    if (right) {
        x += speed;
        characterPositionYInImage = 3;
        currentLoopIndex++;
    }
    if (left) {
        x -= speed;
        characterPositionYInImage = 2;
        currentLoopIndex++;
    }
    if (currentLoopIndex >= cycleLoopForPositionX.length) {
        currentLoopIndex = 0;
      }
    // Keep the square within the bounds
    if (y + sideLength > canvas.height) {
        y = canvas.height - sideLength;
    }
    if (y < 0) {
        y = 0;
    }
    if (x < 0) {
        x = 0;
    }
    if (x + sideLength > canvas.width) {
        x = canvas.width - sideLength;
    }
    // Collide with the target
    if (((isWithin(targetX, x, x + sideLength) || isWithin(targetX + targetLength, x, x + sideLength))) && // X
        ((isWithin(targetY, y, y + sideLength) || isWithin(targetY + targetLength, y, y + sideLength)))) { // Y
        // Respawn the target 
        targetHitSoundObj.stop();
        targetHitSoundObj.refresh();
        targetHitSoundObj.play();
        targetPositionXInImage = Math.floor(Math.random() * 4) + 0;
        moveTarget();
        // Increase the score
        score++;

    }
    // Draw the square
    // context.fillStyle = '#FF0000';
    // context.fillRect(x, y, sideLength, sideLength);

    //Draw the character
    context.drawImage(characterImage, cycleLoopForPositionX[currentLoopIndex] * characterWidth, characterPositionYInImage * characterHeight, characterWidth, characterHeight, x, y, characterWidth * characterScale, characterHeight * characterScale);
    
    // Draw the target 
    // context.fillStyle = '#00FF00';
    // context.fillRect(targetX, targetY, targetLength, targetLength);

   
    context.drawImage(targetImage, targetPositionXInImage*targetImageSize, 0, targetLength, targetLength, targetX , targetY , targetLength * targetScale, targetLength * targetScale);
    // Draw the score and time remaining
    context.fillStyle = 'white';
    context.font = '24px Arial';
    context.textAlign = 'left';
    context.fillText('Score: ' + score, 10, 24);
    context.fillText('Time Remaining: ' + countdown, 10, 50);
    // End the game or keep playing
    if (countdown <= 0) {
        endGame();
    } else {
        reAnimId = window.requestAnimationFrame(draw);
    }
}

// Start the game
menu();
canvas.focus();