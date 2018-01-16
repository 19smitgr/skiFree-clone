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

function loadImages(paths){
    paths.forEach(function(path) {
        let img = new Image();
        img.onload = function() {
            skierImages.push(img);

            // if all images are loaded
            if (skierImages.length == paths.length) {
                console.log("ffff")
                skierReady = true;
                skier.image = skierImages[animationState];
                console.log(skierImages[animationState]);
            }
        }
        img.src = path;
    });
}

skierImagePaths = ["images/scaled/skier1.png", "images/scaled/skier2.png", "images/scaled/skier2.png"];
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
    y: canvas.height / 2,
    isCollided: false,
    timeSinceLastAnimation: 0,
    image: new Image()
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

    now = Date.now();
    delta = (now - then) / 1000;
    changeAnimation(delta);
    then = now;

    ctx.drawImage(skier.image, skier.x, skier.y);
    ctx.drawImage(treeImage, tree.x, tree.y);

    // call this function again ASAP
    requestAnimationFrame(playGame);
};

let changeAnimation = function(delta) {
    skier.timeSinceLastAnimation += delta;
    console.log(delta)
    if (skier.timeSinceLastAnimation >= .100 + skier.speed / 1000) {
        if (animationState < 2) {
            animationState++;
        } else {
            animationState = 0;
        }
        
        skier.image = skierImages[animationState];
        skier.timeSinceLastAnimation = 0;
    }
}

then = Date.now();
playGame();




