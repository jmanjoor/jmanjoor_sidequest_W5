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
  levelIndex = constrain(i, 0, allLevelsData.levels.length - 1);
  level = LevelLoader.fromLevelsJson(allLevelsData, levelIndex);

  player = new BlobPlayer();
  player.spawnFromLevel(level);

  cam.x = player.x - width / 2;
  cam.y = 0;
  cam.clampToWorld(level.w, level.h);

  levelCompleteTimer = 0;
  gameFinished = false;
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

  // --- game state ---
  player.update(level);
  level.updateCollectibles(player);

  // fall death -> respawn
  if (player.y - player.r > level.deathY) {
    respawnHere();
  }

  // --- completion rule: ALL collected + REACH end zone ---
  const allCollected = level.collectedCount >= level.collectCountTarget;
  const reachedEnd = level.playerInEndZone(player);

  if (allCollected && reachedEnd) {
    levelCompleteTimer++;

    if (levelCompleteTimer > 45) {
      if (levelIndex < allLevelsData.levels.length - 1) {
        loadLevel(levelIndex + 1);
        return;
      } else {
        gameFinished = true;
        return;
      }
    }
  } else {
    levelCompleteTimer = 0;
  }

  // --- camera (calmer after all collected) ---
  const calm = allCollected;
  cam.followSideScrollerX(player.x, level.camLerp, calm);
  cam.y = 0;
  cam.clampToWorld(level.w, level.h);

  // --- draw ---
  cam.begin();
  level.drawWorld();
  player.draw(level.theme.blob);
  cam.end();

  // HUD
  fill(0);
  noStroke();
  text(level.name + " (Example 5)", 10, 18);
  text("A/D or ←/→ move • Space/W/↑ jump • Fall = respawn", 10, 36);
  text("camLerp(JSON): " + level.camLerp + "  world.w: " + level.w, 10, 54);
  text(
    "collected: " + level.collectedCount + "/" + level.collectCountTarget,
    10,
    72,
  );
  text("Goal: dark strip at far right → enter after collecting all", 10, 90);
  text("Press K to respawn if stuck", 10, 108);
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
    loadLevel(levelIndex);
    return false;
  }

  return false;
}
