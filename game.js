// Create the canvas and set it up
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// the variables we'll be using
const TREE_WIDTH = 144;
const TREE_HEIGHT = 144;
const SKIER_WIDTH = 47;
let animationState = 0; // 3 animation frames
let skierImages = [];
let skierReady = false;
let score = 0;
let highScore = 0;
let trees = [];

// time since last game loop iteration
let timeOfLastIteration = 0;
let timeOfCurrentIteration = 0;

function loadImages(paths){
    paths.forEach(function(path) {
        let img = new Image();
        img.onload = function() {
            skierImages.push(img);

            // if all images are loaded
            if (skierImages.length == paths.length) {
                skierReady = true;
                skier.image = skierImages[animationState];
            }
        }
        img.src = path;
    });
}

skierImagePaths = ["images/scaled/skier1.png", "images/scaled/skier2.png", "images/scaled/skier3.png"];
loadImages(skierImagePaths);

// Tree (obstacle) image
let treeReady = false;
const treeImage = new Image();
treeImage.onload = function () {
    treeReady = true;
};
treeImage.src = "images/scaled/tree.png";

// default values of game objects
let skier = {
    speed: 30, // movement in pixels per second
    x: canvas.width / 2,
    y: 50,
    isCollided: false,
    timeSinceLastAnimation: 0,
    image: new Image(),
    timeSinceLastCrash: 0,
    treesAvoided: 0
};

let generateTrees = function(numOfTrees) {
    
    // give them a default value
    for (let i=0; i < numOfTrees; i++) {
        trees.push({
            x: getRandomInt(0, window.innerWidth),
            y: getRandomInt(0, window.innerHeight)
        });
    }
}

// if we move our mouse, this will call the "update" function
document.addEventListener('mousemove', function() {
    // move the skier left and right
    skier.x = event.clientX - (SKIER_WIDTH / 2);
});

let checkForCollision = function(delta) {
    let hasCollidedThisInstance = false;

    for (tree of trees) {

        if ( // If player runs into tree
            skier.x <= (tree.x + TREE_WIDTH - 20)
            && skier.x >= tree.x
            && skier.y <= (tree.y + (TREE_HEIGHT / 2))
            && skier.y >= tree.y + 30
        ) {
            skier.speed = 0;
            skier.isCollided = true;
            hasCollidedThisInstance = true;
            skier.treesAvoided = 0;

            console.log("collision");
        }
    };

    if (!hasCollidedThisInstance && skier.isCollided) {
        skier.isCollided = false;
        skier.speed = 10;
    }

    // if the variable is still set to true, but is no longer colliding
    if (!skier.isCollided) {
        updateScores();
        updateSkierSpeed();
        changeAnimation(delta);
    }

}

let updateScores = function() {
    score = skier.treesAvoided;

    // high score is whichever one is higher: score or highScore
    highScore = Math.max(score, highScore)
}

let updateTrees = function() {
    trees.forEach(function(tree) {
        // if the tree is at the top of the page, move back to the bottom
        if (tree.y <= 0 - TREE_HEIGHT) {
            tree.y = window.innerHeight;
            tree.x = getRandomInt(0, window.innerWidth); 

            skier.treesAvoided++;
        } else {
            // move the tree closer to the player
            tree.y -= skier.speed;
        }
    });
}

let updateSkierSpeed = function() {

    // some math that you might not understand 
    // (ask if you want to know how it works)

    if (skier.speed != 0) {
        skier.speed += Math.floor((1 / skier.speed) * 75) / 100;
    }
}

let drawScores = function(delta) {
    ctx.fillStyle = "rgb(250, 195, 0)";
    ctx.font = "24px Courier New";
    ctx.fillText("High Score: " + highScore, 38, 30);

    ctx.fillStyle = "rgb(250, 195, 0)";
    ctx.font = "24px Courier New";
    ctx.fillText("Score: " + score, 38, 55);
}

let drawGameObjects = function() {
    ctx.drawImage(skier.image, skier.x, skier.y);

    trees.forEach(function(tree) {
        ctx.drawImage(treeImage, tree.x, tree.y);
    });
}

let changeAnimation = function(delta) {
    skier.timeSinceLastAnimation += delta;

    // animation speed gets quicker as skier.speed increases
    if (skier.timeSinceLastAnimation >= .100 - skier.speed / 1000) {
        if (animationState < 2) {
            animationState++;
        } else {
            animationState = 0;
        }
        
        skier.image = skierImages[animationState];
        skier.timeSinceLastAnimation = 0;
    }
}

let playGame = function() {

    // get seconds between the last two animation calls
    timeOfCurrentIteration = Date.now();
    let delta = (timeOfCurrentIteration - timeOfLastIteration) / 1000;

    // make canvas blank before drawing again
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    checkForCollision(delta);

    updateTrees();

    drawGameObjects();

    drawScores();

    // reset timeOfLastIteration
    timeOfLastIteration = timeOfCurrentIteration;

    // call this function again ASAP
    requestAnimationFrame(playGame);
};

// give it a default value
timeOfLastIteration = Date.now();
generateTrees(7);
playGame();


