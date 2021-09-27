let W= 800, H= 700;

// multiple screens
const LOADING = 0;
const MAIN_MENU = 1;
const GAME = 2; 
const SCORE_BOARD =3;
let currentScreen = LOADING; 
let gameButton; 
let scoreButton;
let exitButton; 

//sprites - ship
let shipSprite; 
let shipSize = 50
let shipSpeed = 4
let shipOffset = shipSize/2; 
let projectile= [];
let proSpeed = 5; 

//border info 
let score = 0; 
let heartSprite = [];
let heartNum = 3; 

//sprites - blob 
let greenGlob = []; 
let greenGroup;
let newGlob = []; 
let newGroup; 
let globSize = 50
let globNum = 8
let xCoord = 50
let yCoord = 50

//spacing scaled to canvas 
let border = 100; 
let scale = {
    x: (W-border)/globNum, y: H/globNum, 
}
let offset = globSize/2;

// enemy class
class Glob {
    constructor(xVal, yVal, animation) {
        this.sprite = createSprite(xVal,yVal, globSize, globSize);
        this.sprite.addSpeed(round(random(1,4)), 0);
        this.sprite.addAnimation('bounce', animation);
        this.sprite.animation.frameDelay = 8;
        //this.sprite.debug = true; 
    }
}

function preload() {
    loadImages(); 
    loadSounds(); 
    scoreBoard = loadJSON("scoreboard.json");
}

function setup() {
    createCanvas(W, H);
	setupLoadingScreen(); 
	setupMainMenuScreen();
	setupGameScreen();
    setupScoreBoard();
}
	
function draw() {
    background(20); 
    switch(currentScreen) {
		case LOADING: 
            drawLoadingScreen(); 
            break; 
        case MAIN_MENU: 
            drawMainMenuScreen(); 
            gameButton.mouseClicked(gameButtonClicked);
            scoreButton.mouseClicked(scoreButtonClicked);
            break; 
        case GAME: 
            drawGameScreen(); 
            exitButton.mouseClicked(exitButtonClicked);
            //draw sprites
			for(let i=0; i <greenGlob.length; i++){
                drawSprite(greenGlob[i].sprite); 
				drawSprite(heartSprite[i]);
			} 
            drawSprite(shipSprite);
            shipMovement();
            //draw new globs
            newGlobs();
            break; 
        case SCORE_BOARD:
            drawScoreBoard();
            exitButton.mouseClicked(exitButtonClicked);
            break;
    }
}

function loadImages() {
    //sprites images & animations 
    shipImg = loadImage('images/gamescreen/spaceship.png'); 
    glob1_Img = loadAnimation('images/gamescreen/green_frames/gblob001.png','images/gamescreen/green_frames/gblob008.png');
    glob2_Img = loadAnimation('images/gamescreen/yellow_frames/yblob001.png','images/gamescreen/yellow_frames/yblob008.png');
    heartImg = loadImage('images/gamescreen/heart.png');
    //passive sprite images
	pixelBubbleImg = loadImage('images/loadingscreen/pixel-bubble.png');
	skullImg = loadImage('images/loadingscreen/skull.png');
}

function loadSounds(){
    //sounds 
    shootSound = loadSound('sounds/shoot.mp3'); 
    destroySound = loadSound('sounds/destroy.mp3');
    hitSound = loadSound('sounds/hit_object.mp3');
    loseLifeSound= loadSound('sounds/lose_life.mp3');
    loseSound = loadSound('sounds/lose_game.mp3'); 
    winSound = loadSound('sounds/win_game.mp3'); 
    //set volume
    shootSound.setVolume(0.5); 
    destroySound.setVolume(0.5);
    hitSound.setVolume(0.3);
    loseLifeSound.setVolume(0.5);
    loseSound.setVolume(0.5);
    winSound.setVolume(0.5); 
}

function setupLoadingScreen() {
    //loading screen setup
	pixelSprite = createSprite(W/2, H/5);
	pixelSprite.addImage(pixelBubbleImg);
	skullSprite = createSprite(W/2, H-H/2.5);
	skullSprite.addImage(skullImg); 
    skullImg.resize(400,400)   
}

function setupMainMenuScreen() {
    //video
    vid = createVideo('images/mainmenuscreen/space.mp4',vidLoad);
    vid.hide();
    vid.size(W,H);
}

function setupGameScreen() {
    // ship sprite 
    let ship = {
        x: W/2+border/2, y: H-shipSize
    }
    shipSprite = createSprite(ship.x, ship.y, shipSize, shipSize )
    //shipSprite.debug = true; 
    shipSprite.addImage(shipImg);

   //glob class
    greenGroup = new Group(); 
    newGroup = new Group(); 
    for(let i = 0; i < globNum; i++) {
        greenGlob.push(new Glob(border+(i*scale.x+globSize), yCoord, glob1_Img));
        greenGlob[i].sprite.setSpeed(0,0);
        //add group
        greenGroup.add(greenGlob[i].sprite);
    }  

    //heart sprite -- player lives 
    for(let j = 0; j < heartNum; j++){
        heartSprite.push(createSprite(border/2, j*60+H-H/4, 50, 50));
        heartSprite[j].addImage(heartImg);
    } 
}

function setupScoreBoard() {
  //print(scoreBoard.scoreBoard.score)
}

function drawLoadingScreen(){ 
    background(200); 
    drawSprite(pixelSprite);
    drawSprite(skullSprite);
    //text on screen
    stroke(0);
    fill(0);
    textAlign(CENTER);
    textSize(40);
    textFont('Arial');
    textStyle(BOLD);
    text('LOADING', W/2, H*.95);
    textAlign(RIGHT);
    text('...', W*.66, H*.95);
}

function drawMainMenuScreen() {
    //video
    image(vid,0,0);
    //text on screen
    stroke(255); 
    fill(255);
    textAlign(CENTER);
    textSize(70);
    textFont('Arial');
    textStyle(BOLD);
    text('GALAGA', W/2, H/3);
    textSize(30);
    //buttons 
    exitButton = createButton('Exit Main Menu');
    exitButton.size(80,45)
    exitButton.position(10,20);
    exitButton.hide();
}

function  drawGameScreen() {
    //border line
    stroke(255)
    strokeWeight(3)
    line(border, 0, border, H);
    // text
    textAlign(CENTER);
    textSize(20);
    textFont('Calibri Light');
    textStyle(ITALIC);
    fill(255);
    text('S C O R E', border/2, 100)
    text(score, border/2, 130)
    
    if(currentScreen == GAME) {
        //glob movement 
        for(let i = 0; i < greenGlob.length; i++) {
            if(greenGlob[i].sprite.position.x > W-offset){
                hitSound.play(); 
                greenGlob[i].sprite.position.x -= 3
                greenGlob[i].sprite.position.y += globSize;
                greenGlob[i].sprite.setSpeed(round(random(1,4)), 180)
            }
            else if(greenGlob[i].sprite.position.x < border+ offset){
                hitSound.play(); 
                greenGlob[i].sprite.position.x += 3
                greenGlob[i].sprite.position.y += globSize;
                greenGlob[i].sprite.setSpeed(round(random(1,4)), 0); 
            }
            //collision detection for life removal
            if(shipSprite.collide(greenGroup,loseLife)){
                loseLifeSound.play(); 
            }
        }
    
        //new glob movement
        for(let j = 0; j < newGlob.length; j++) {
            if(newGlob[j].sprite.position.x > W-offset){
                hitSound.play(); 
                newGlob[j].sprite.position.x -= 4
                newGlob[j].sprite.position.y += globSize;
                newGlob[j].sprite.setSpeed(round(random(2,5)), 180)
            }
            else if(newGlob[j].sprite.position.x < border+ offset){
                hitSound.play(); 
                newGlob[j].sprite.position.x += 4
                newGlob[j].sprite.position.y += globSize;
                newGlob[j].sprite.setSpeed(round(random(2,5)), 0); 
            }
            //collision detection for life removal
            if(shipSprite.collide(newGroup,loseLife)){
                loseLifeSound.play(); 
            }
        }
    }

    //projectile limit
    for(let j = 0; j< projectile.length; j++){
        drawSprite(projectile[j]);
        //projectile[j].debug = true;

        //collision detection for shooting 
        if(projectile[j].collide(greenGroup, destroy)) {
            destroySound.play(); 
        }
        if(projectile[j].collide(newGroup, destroy)) {
            destroySound.play(); 
        }
    }
    //triggered when player lives == 0; 
    loseGame();
}

function  drawScoreBoard() {
    stroke(255);
    fill(255);
    textAlign(CENTER);
    textSize(40);
    textFont('Arial');
    textStyle(BOLD);
    text('SCOREBOARD', W/2, H/5);
    //draw scoreboard from JSON object properties
    for(let i=0; i<scoreBoard.scoreBoard.number.length; i++){
        text(scoreBoard.scoreBoard.number[i], W/3, H/3+i*100)
        text(scoreBoard.scoreBoard.name[i], W/2, H/3+i*100)
        text(scoreBoard.scoreBoard.score[i], W/1.5, H/3+i*100)
    }
}

function mouseClicked() {
    if(currentScreen == LOADING) {
        currentScreen = MAIN_MENU;
        // GUI element -- Button 
        gameButton = createButton('New Game');
        scoreButton = createButton('Scoreboard');
        gameButton.size(200,75)
        scoreButton.size(200,75)
        gameButton.position(W/2- gameButton.size().width/2, H-H/2);
        scoreButton.position(W/2- gameButton.size().width/2, H-H/3);
    }
}

function shipMovement() {
    if(keyIsDown(LEFT_ARROW)) {
    shipSprite.setSpeed(shipSpeed,180); 
    } 
    else if(keyIsDown(RIGHT_ARROW)) {
        shipSprite.setSpeed(shipSpeed,0);
    } else { 
        shipSprite.setSpeed(0,0); 
    }
        
    //Collision detection for ship & borders
    if(shipSprite.position.x >= W-offset) {
        shipSprite.position.x -= shipSpeed
    } else if(shipSprite.position.x <= border+offset) {
         shipSprite.position.x += shipSpeed
    }
}

//projectiles 
function keyPressed() {
    //create a projectile only on game screen
    if(currentScreen == GAME && heartNum > 0){ 
        if(keyIsPressed && keyCode == 32) {
            //projectiles 
            fill(100,0,255);
            projectile.push(createSprite(shipSprite.position.x, 
                shipSprite.position.y-shipOffset+shipSize/8, 
                shipSize/8, shipSize/3));
              
            for(let i = 0; i < projectile.length; i++){
                //set color for sprite
                projectile[i].setSpeed(proSpeed,270);
                //life of projectile in frames
                projectile[i].life = 130; 
            }
            shootSound.play(); 
        }  
    }
}

function newGlobs() {
    if(heartNum > 0){ //player lives
        //create globs after 15 seconds every 2 seconds
        if(frameCount > 900 && frameCount % 120 == 0) {
            newGlob.push(new Glob(border+globSize, yCoord, glob2_Img));
            
            //add to group 
            for(let i = 0; i < newGlob.length; i++){
                newGroup.add(newGlob[i].sprite);
            }
        }
    }
    //separate loop outside framecount
    for(let j = 0; j < newGlob.length; j++){
        drawSprite(newGlob[j].sprite) 
    } 
}

function vidLoad() {
    vid.loop(); 
    vid.volume(0);
}

function destroy(spriteA, spriteB) {
    spriteA.remove(); 
    spriteB.remove(); 
    score++; 
    if(score % 10 == 0){
        //bonus sound effect every 10 points
        winSound.play(); 
    }
}

function loseLife(spriteA, spriteB) {
    spriteA; 
    spriteB.remove();
    score--;
    heartNum--; 
    heartSprite[0].remove(); 
    if(heartNum == 1){
        heartSprite[1].remove(); 
    }
    if(heartNum == 0){
    heartSprite[2].remove(); 
    loseSound.play(); 
    }
}  

function loseGame() {
    if(heartNum == 0) {
       //change speed to 0
       shipSpeed = 0; 
        for(let i= 0; i<greenGlob.length; i++){
            greenGlob[i].sprite.setSpeed(0, 0);
        }
        for(let j= 0; j<newGlob.length; j++){
            newGlob[j].sprite.setSpeed(0, 0); 
        } 
        // text
        textAlign(CENTER);
        textSize(40);
        textFont('Calibri Light');
        textStyle(NORMAL);
        fill(255);
        text('Game Over!', W/2+border/2, H/3);
    }
}

function gameButtonClicked() {
    currentScreen = GAME; 
    gameButton.hide();
    scoreButton.hide(); 
    exitButton.show(); 
    //add speed
    for(let i= 0; i<greenGlob.length; i++){
        greenGlob[i].sprite.addSpeed(round(random(1,4)), 0);
    }
    for(let j= 0; j<newGlob.length; j++){
        newGlob[j].sprite.addSpeed(round(random(1,4)), 0);
    } 
}

function scoreButtonClicked() {
    currentScreen = SCORE_BOARD; 
    gameButton.hide();
    scoreButton.hide(); 
    exitButton.show(); 
}

function exitButtonClicked() {
    currentScreen = MAIN_MENU;
    exitButton.hide(); 
    gameButton.show();
    scoreButton.show(); 
    //change speed to 0
    for(let i= 0; i<greenGlob.length; i++){
        greenGlob[i].sprite.setSpeed(0, 0);
    }
    for(let j= 0; j<newGlob.length; j++){
        newGlob[j].sprite.setSpeed(0, 0); 
    }
}
