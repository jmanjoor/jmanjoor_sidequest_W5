class WorldLevel {
  constructor(levelJson) {
    this.name = levelJson.name ?? "Level";

    this.theme = Object.assign(
      { bg: "#F0F0F0", platform: "#C8C8C8", blob: "#1478FF" },
      levelJson.theme ?? {},
    );

    // Physics knobs
    this.gravity = levelJson.gravity ?? 0.65;
    this.jumpV = levelJson.jumpV ?? -11.0;

    // Camera knob
    this.camLerp = levelJson.camera?.lerp ?? 0.12;

    // World size + death line
    this.w = levelJson.world?.w ?? 2400;
    this.h = levelJson.world?.h ?? 360;
    this.deathY = levelJson.world?.deathY ?? this.h + 200;

    // Start
    this.start = Object.assign({ x: 80, y: 220, r: 26 }, levelJson.start ?? {});

    // Platforms
    this.platforms = (levelJson.platforms ?? []).map(
      (p) => new Platform(p.x, p.y, p.w, p.h),
    );

    // Collectibles config (from JSON)
    const cData = levelJson.collectibles ?? { count: 8, seed: 3025 };
    this.collectCountTarget = cData.count ?? 8;
    this.collectSeed = cData.seed ?? 3025;

    this.collectibles = [];
    this.collectedCount = 0;

    this._generateCollectibles();
  }

  _generateCollectibles() {
    randomSeed(this.collectSeed);

    const shapes = ["circle", "square", "triangle", "star"];

    // Choose platforms that are reachable-ish:
    // - wide enough to land on
    // - not super high (small y means higher up)
    // - not the bottom "trap" floor if you have one
    let candidates = this.platforms.filter(
      (p) => p.w >= 110 && p.y >= 220 && p.y <= 420,
    );
    if (candidates.length === 0) candidates = this.platforms;

    this.collectibles = [];
    this.collectedCount = 0;

    for (let i = 0; i < this.collectCountTarget; i++) {
      const plat = random(candidates);

      const r = 12;
      const x = random(plat.x + 30, plat.x + plat.w - 30);
      const y = plat.y - (r + 10); // always just above the platform

      const shape = random(shapes);

      const col = color(random(70, 200), random(70, 200), random(70, 200));
      col.setAlpha(210);

      this.collectibles.push({
        x,
        y,
        r,
        shape,
        col,
        collected: false,
      });
    }
  }

  updateCollectibles(player) {
    for (const it of this.collectibles) {
      if (it.collected) continue;

      const d = dist(player.x, player.y, it.x, it.y);
      if (d < player.r + it.r) {
        it.collected = true;
        this.collectedCount++;
      }
    }
  }

  drawWorld() {
    background(this.theme.bg);

    push();
    rectMode(CORNER);
    noStroke();

    // platforms
    fill(this.theme.platform);
    for (const p of this.platforms) {
      rect(p.x, p.y, p.w, p.h);
    }

    // collectibles
    for (const it of this.collectibles) {
      if (it.collected) continue;

      push();
      translate(it.x, it.y);

      const a = 150 + sin(frameCount * 0.02) * 60; // calm pulse
      const c = color(it.col);
      c.setAlpha(a);
      fill(c);
      noStroke();

      if (it.shape === "circle") {
        ellipse(0, 0, it.r * 2);
      } else if (it.shape === "square") {
        rectMode(CENTER);
        rect(0, 0, it.r * 2, it.r * 2);
      } else if (it.shape === "triangle") {
        triangle(0, -it.r, -it.r, it.r, it.r, it.r);
      } else if (it.shape === "star") {
        beginShape();
        for (let k = 0; k < 10; k++) {
          const ang = (k / 10) * TAU - HALF_PI;
          const rad = k % 2 === 0 ? it.r : it.r * 0.45;
          vertex(cos(ang) * rad, sin(ang) * rad);
        }
        endShape(CLOSE);
      }

      pop();
    }

    pop();
  }
}
