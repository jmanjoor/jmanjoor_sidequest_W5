let gameFinished = false;

const VIEW_W = 800;
const VIEW_H = 480;

let allLevelsData;
let levelIndex = 0;

let level;
let player;
let cam;

let levelCompleteTimer = 0;

function preload() {
  // SAFE: no query string
  allLevelsData = loadJSON("levels.json");
}

function setup() {
  createCanvas(VIEW_W, VIEW_H);
  textFont("sans-serif");
  textSize(14);

  cam = new Camera2D(width, height);
  loadLevel(0);
}

function loadLevel(i) {
  const levels = allLevelsData?.levels;

  if (!Array.isArray(levels)) {
    console.error("levels.json failed to load:", allLevelsData);
    gameFinished = true;
    return;
  }

  if (i < 0 || i >= levels.length) {
    gameFinished = true;
    return;
  }

  levelIndex = i;
  level = LevelLoader.fromLevelsJson(allLevelsData, levelIndex);

  player = new BlobPlayer();
  player.spawnFromLevel(level);

  cam.x = player.x - width / 2;
  cam.y = 0;
  cam.clampToWorld(level.w, level.h);

  levelCompleteTimer = 0;
  gameFinished = false;

  console.log("Loaded:", levelIndex, level.name, "levels:", levels.length);
}

function respawnHere() {
  player.spawnFromLevel(level);
  cam.x = player.x - width / 2;
  cam.y = 0;
  cam.clampToWorld(level.w, level.h);
  levelCompleteTimer = 0;
}

function draw() {
  if (gameFinished) {
    background(240);
    fill(0);
    text("Finished ✅", 10, 18);
    text("Press R to restart", 10, 36);
    return;
  }

  player.update(level);
  level.updateCollectibles(player);

  if (player.y - player.r > level.deathY) {
    respawnHere();
  }

  const allCollected = level.collectedCount >= level.collectCountTarget;
  const reachedEnd = level.playerInEndZone(player);

  if (allCollected && reachedEnd) {
    levelCompleteTimer++;

    if (levelCompleteTimer > 45) {
      if (levelIndex + 1 < allLevelsData.levels.length) {
        loadLevel(levelIndex + 1);
        return;
      } else {
        alert("Game Over 🎉 Thanks for playing");
        gameFinished = true;
        noLoop();
        return;
      }
    }
  } else {
    levelCompleteTimer = 0;
  }

  const look = player.vx * 25; // pushes camera in direction of movement
  cam.followSideScrollerX(player.x, level.camLerp, allCollected, 0.35, look);
  cam.y = 0;
  cam.clampToWorld(level.w, level.h);

  cam.begin();
  level.drawWorld();
  player.draw(level.theme.blob);
  cam.end();

  fill(0);
  noStroke();
  text(
    `${level.name} | idx ${levelIndex}/${allLevelsData.levels.length - 1}`,
    10,
    18,
  );
  text("A/D or ←/→ move • Space/W/↑ jump • Fall = respawn", 10, 36);
  text(
    `collected: ${level.collectedCount}/${level.collectCountTarget}`,
    10,
    54,
  );
  text("Goal: dark strip at far right → enter after collecting all", 10, 72);
  text("Press K to respawn if stuck • R to restart level", 10, 90);
}

function keyPressed() {
  if (key === " " || key === "W" || key === "w" || keyCode === UP_ARROW) {
    player.tryJump();
    return false;
  }

  if (key === "k" || key === "K") {
    respawnHere();
    return false;
  }

  if (key === "r" || key === "R") {
    if (gameFinished) loadLevel(0);
    else loadLevel(levelIndex);
    return false;
  }

  return false;
}
