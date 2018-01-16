// Create the canvas and set it up
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const TREE_WIDTH = 144;
const TREE_HEIGHT = 144;
const SKIER_WIDTH = 47;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Hero image
let skierReady = false;
const skierImage = new Image();
skierImage.onload = function () {
    skierReady = true;
};
skierImage.src = "images/scaled/skier3.png";

// Tree (obstacle) image
let treeReady = false;
const treeImage = new Image();
treeImage.onload = function () {
    treeReady = true;
};
treeImage.src = "images/scaled/tree.png";

// Game objects
let skier = {
    speed: 30, // movement in pixels per second
    x: canvas.width / 2,
    y: canvas.height / 2,
    isCollided: false
};

let tree = {
    x: canvas.width / 2,
    y: window.innerHeight
};

// if we move our mouse, this will call the "update" function
document.addEventListener('mousemove', function() {
    // move the skier left and right
    skier.x = event.clientX - (SKIER_WIDTH / 2);
});

let collision = function() {
    // you can really put whatever here. 
    // This code will be called after the player hits a tree

    skier.speed = 0;
    skier.isCollided = true;
    console.log("game over");
}

let checkForCollision = function() {
    // If player runs into tree, game over
    if (
        skier.x <= (tree.x + TREE_WIDTH)
        && skier.x >= tree.x
        && skier.y <= (tree.y + TREE_HEIGHT)
        && skier.y >= tree.y
    ) {
        collision();
    } else if (skier.isCollided) {
        skier.isCollided = false;
        skier.speed = 10;
    }
}

let updateTree = function() {
    // if the tree is at the top of the page, move back to the bottom
    if (tree.y <= 0) {
        tree.y = window.innerHeight;
        tree.x = getRandomInt(0, window.innerWidth); 
    } else {
        // move the tree closer to the player
        tree.y -= skier.speed;
    }
}

let updateSkierSpeed = function() {

    // some math that you might not understand 
    // (ask if you want to know how it works)

    skier.speed += Math.floor((1 / skier.speed) * 75) / 15;
}

let playGame = function() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    checkForCollision();

    updateTree();

    updateSkierSpeed();

    ctx.drawImage(skierImage, skier.x, skier.y);
    ctx.drawImage(treeImage, tree.x, tree.y);

    // call this function again ASAP
    requestAnimationFrame(playGame);
};

playGame();




