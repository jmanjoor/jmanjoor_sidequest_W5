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
  gameFinished = false; // ✅ whenever we load a level, we're not "finished"

  levelIndex = constrain(i, 0, allLevelsData.levels.length - 1);
  level = LevelLoader.fromLevelsJson(allLevelsData, levelIndex);

  player = new BlobPlayer();
  player.spawnFromLevel(level);

  cam.x = player.x - width / 2;
  cam.y = 0;
  cam.clampToWorld(level.w, level.h);

  levelCompleteTimer = 0; // ✅ reset on every level load
}

function respawnHere() {
  player.spawnFromLevel(level);
  cam.x = player.x - width / 2;
  cam.y = 0;
  cam.clampToWorld(level.w, level.h);
  levelCompleteTimer = 0;
}

function draw() {
  // ✅ If game is finished, show calm end screen and STOP.
  if (gameFinished) {
    background(level?.theme?.bg ?? "#F0F0F0");
    fill(0);
    noStroke();
    text("All discoveries found 🌿", 10, 18);
    text("Press R to replay from Level 1", 10, 36);
    return;
  }

  // --- game state ---
  player.update(level);
  level.updateCollectibles(player);

  // respawn if blob falls below death line
  if (player.y - player.r > level.deathY) {
    respawnHere();
  }

  // --- level completion → auto advance ---
  if (level.collectedCount >= level.collectCountTarget) {
    levelCompleteTimer++;

    // little pause for calm pacing
    if (levelCompleteTimer > 75) {
      // ✅ If there is another level, go to it
      if (levelIndex < allLevelsData.levels.length - 1) {
        loadLevel(levelIndex + 1);
        return;
      }

      // ✅ Otherwise, we finished the last level. End calmly.
      gameFinished = true;
      return;
    }
  } else {
    levelCompleteTimer = 0;
  }

  // --- camera (calmer after completion) ---
  const calm = level.collectedCount >= level.collectCountTarget;
  cam.followSideScrollerX(player.x, level.camLerp, calm);
  cam.y = 0;
  cam.clampToWorld(level.w, level.h);

  // --- draw world ---
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
    "platforms: " +
      level.platforms.length +
      " start: " +
      level.start.x +
      "," +
      level.start.y,
    10,
    72,
  );
  text("cam: " + cam.x + ", " + cam.y, 10, 90);

  const p0 = level.platforms[0];
  if (p0) text(`p0: x=${p0.x} y=${p0.y} w=${p0.w} h=${p0.h}`, 10, 108);

  text(
    "collected: " + level.collectedCount + "/" + level.collectCountTarget,
    10,
    126,
  );
  text("Press K to respawn if stuck", 10, 144);
}

function keyPressed() {
  // jump
  if (key === " " || key === "W" || key === "w" || keyCode === UP_ARROW) {
    if (!gameFinished) player.tryJump();
    return false;
  }

  // manual respawn
  if (key === "k" || key === "K") {
    if (!gameFinished) respawnHere();
    return false;
  }

  // restart game (from level 1) if finished, otherwise restart current level
  if (key === "r" || key === "R") {
    if (gameFinished) {
      loadLevel(0);
    } else {
      loadLevel(levelIndex);
    }
    return false;
  }

  return false;
}
