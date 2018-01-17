// Create the canvas and set it up
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// the variables we'll be using
const TREE_WIDTH = 144;
const TREE_HEIGHT = 144;
const SKIER_WIDTH = 47;
const SKIER_HEIGHT = 93;
let animationState = 0; // 3 animation frames
let skierImages = [];
let powerups = [];
let powerupsOnScreen = [];
let activePowerup = "";
let skierReady = false;
let score = 0;
let highScore = 0;
let trees = [];
let SHIELD_WIDTH = 119;

// time since last game loop iteration
let timeOfLastIteration = 0;
let timeOfCurrentIteration = 0;

function loadSkierSprite(paths){
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

let skierImagePaths = ["images/scaled/skier1.png", "images/scaled/skier2.png", "images/scaled/skier3.png"];
loadSkierSprite(skierImagePaths);

// shield powerup image
let shieldReady = false;
let shieldImage = new Image();
shieldImage.onload = function() {
    powerups.push({
        image: shieldImage,
        type: "shield"
    });

    shieldReady = true;
}
shieldImage.src = "images/originals/shield.png";

// Tree (obstacle) image
let treeReady = false;
const treeImage = new Image();
treeImage.onload = function () {
    treeReady = true;
};
treeImage.src = "images/scaled/tree.png";

// Tree (obstacle) image
let brokenTreeRightReady = false;
const brokenTreeRightImage = new Image();
brokenTreeRightImage.onload = function () {
    brokenTreeRightReady = true;
};
brokenTreeRightImage.src = "images/scaled/brokenTreeRight.png";

// Tree (obstacle) image
let brokenTreeLeftReady = false;
const brokenTreeLeftImage = new Image();
brokenTreeLeftImage.onload = function () {
    brokenTreeLeftReady = true;
};
brokenTreeLeftImage.src = "images/scaled/brokenTreeLeft.png";

// default values of game objects
let skier = {
    speed: 10, // movement in pixels per second
    x: canvas.width / 2,
    y: 100,
    isCollided: false,
    timeSinceLastAnimation: 0,
    image: new Image(),
    timeSinceLastCrash: 0,
    treesAvoided: 0,
    hasPowerup: false,
    powerup: {}
};

let everythingIsReady = function() {
    return skierReady && treeReady && shieldReady && brokenTreeLeftReady && brokenTreeRightReady
}

let generateTrees = function(numOfTrees) {
    
    // give them a default value
    for (let i=0; i < numOfTrees; i++) {
        trees.push({
            x: getRandomInt(0, window.innerWidth),
            y: getRandomInt(0, window.innerHeight) + window.innerHeight,
            image: treeImage
        });
    }
}

let checkForCollision = function(delta) {
    let hasCollidedThisInstance = false;

    for (tree of trees) {

        if ( // If player runs into tree
            skier.x <= (tree.x + TREE_WIDTH - 20)
            && skier.x >= tree.x
            && skier.y <= (tree.y + (TREE_HEIGHT / 2))
            && skier.y >= tree.y + 30
        ) {
            if (!skier.hasPowerup) {
                skier.speed = 0;
                skier.isCollided = true;
                hasCollidedThisInstance = true;
                skier.treesAvoided = 0;
                console.log("collision");
            } else if (skier.hasPowerup && skier.powerup.type == "shield") {
                
                let isOnRightSide = skier.x >= tree.x + TREE_WIDTH / 2
                if (isOnRightSide) {
                    tree.image = brokenTreeLeftImage;
                } else {
                    tree.image = brokenTreeRightImage;
                }
            }
        }
    };

    for (powerup of powerupsOnScreen) {

        if ( // If player runs into tree
            skier.x <= (powerup.x + TREE_WIDTH - 20)
            && skier.x >= powerup.x
            && skier.y <= (powerup.y + (TREE_HEIGHT / 2))
            && skier.y >= powerup.y + 30
        ) {
            // if already has powerup
            if (!skier.hasPowerup) {
                skier.powerup.image = powerup.image;
                skier.powerup.type = powerup.type;
                skier.hasPowerup = true;
                skier.powerup.duration = 5; // seconds

                ctx.fillStyle = "rgb(250, 195, 0)";
                ctx.font = "24px Courier New";
            }

            console.log("powerup gained");
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
            tree.image = treeImage;

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

    ctx.fillStyle = "rgb(250, 195, 0)";
    ctx.font = "24px Courier New";
    ctx.fillText("Press S to submit your high score", window.innerWidth - 500, 30);
}

let drawGameObjects = function() {
    ctx.drawImage(skier.image, skier.x, skier.y);

    trees.forEach(function(tree) {
        ctx.drawImage(tree.image, tree.x, tree.y);
    });

    powerupsOnScreen.forEach(function(powerup) {
        ctx.drawImage(powerup.image, powerup.x, powerup.y);
    });

    if (skier.hasPowerup && skier.powerup.type == "shield") {
        ctx.drawImage(skier.powerup.image, skier.x - SHIELD_WIDTH / 2 + 20, skier.y - 10);
    }
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

let updatePowerUps = function(delta) {
    // 1% chance of powerup
    if (Math.ceil(Math.random() * 100) == 1) {
        let randNum = getRandomInt(0, powerups.length - 1);

        powerupsOnScreen.push({
            image: powerups[randNum].image,
            type: powerups[randNum].type,
            x: getRandomInt(0, window.innerWidth),
            y: window.innerHeight
        });
    }

    powerupsOnScreen = powerupsOnScreen.filter(powerupImage => powerupImage.y >= 0);
    powerupsOnScreen.forEach(function(powerupImage) {
        powerupImage.y -= skier.speed;
    });

    skier.powerup.duration -= delta;

    if (skier.hasPowerup) {
        ctx.fillStyle = "rgb(250, 195, 0)";
        ctx.font = "24px Courier New";
        ctx.fillText("Power up: " + Math.round(skier.powerup.duration) + " s", window.innerWidth - 500, 55);
    }

    if (skier.powerup.duration <= 0) {
        skier.hasPowerup = false;
        skier.powerup = {};
    };
}

let submitScore = function() {
    // TODO: implement loading high scores also

}

let playGame = function() {
    if (everythingIsReady() && !document.hidden) {
        // get seconds between the last two animation calls
        timeOfCurrentIteration = Date.now();
        let delta = (timeOfCurrentIteration - timeOfLastIteration) / 1000;

        // make canvas blank before drawing again
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        checkForCollision(delta);

        updateTrees();

        updatePowerUps(delta);

        drawGameObjects();

        drawScores();

        // reset timeOfLastIteration
        timeOfLastIteration = timeOfCurrentIteration;
    }

    // call this function again ASAP
    requestAnimationFrame(playGame);
};

document.addEventListener('keydown', function(e) {
    // S key
    if (e.which == 83) {
        let submitScore = confirm("Do you want to submit your high score?");

        if (submitScore) {
            submitScore();
        }
    }
});

// if we move our mouse, this will call the "update" function
document.addEventListener('mousemove', function() {
    // move the skier left and right
    skier.x = event.clientX - (SKIER_WIDTH / 2);
    skier.y = event.clientY - (SKIER_HEIGHT / 2);
});

// give it a default value
timeOfLastIteration = Date.now();
generateTrees(7);

playGame();


