class WorldLevel {
  constructor(levelJson) {
    this.name = levelJson.name ?? "Level";

    this.theme = Object.assign(
      { bg: "#F0F0F0", platform: "#C8C8C8", blob: "#1478FF" },
      levelJson.theme ?? {},
    );

    // Physics settings from JSON
    this.gravity = levelJson.gravity ?? 0.65;
    this.jumpV = levelJson.jumpV ?? -11.0;
    this.camLerp = levelJson.camera?.lerp ?? 0.12;

    // World size + death line (Default h=600 for Level 2 visibility)
    this.w = levelJson.world?.w ?? 2400;
    this.h = levelJson.world?.h ?? 600;
    this.deathY = levelJson.world?.deathY ?? this.h + 200;

    this.start = Object.assign({ x: 80, y: 220, r: 26 }, levelJson.start ?? {});

    this.platforms = (levelJson.platforms ?? []).map(
      (p) => new Platform(p.x, p.y, p.w, p.h),
    );

    // End zone detection
    const e = levelJson.end ?? { x: this.w - 120, w: 80 };
    this.endZone = {
      x: e.x ?? this.w - 120,
      y: 0,
      w: e.w ?? 80,
      h: this.h,
    };

    const cData = levelJson.collectibles ?? { count: 8, seed: 3025 };
    this.collectibles = [];
    this.collectedCount = 0;

    if (Array.isArray(cData)) {
      // CASE A: Fixed item list
      this.collectCountTarget = cData.length;
      for (const item of cData) {
        const col = color(item.color ?? "#88AADD");
        col.setAlpha(210);
        this.collectibles.push({
          x: item.x,
          y: item.y,
          r: 12,
          shape: item.shape ?? "circle",
          col,
          collected: false,
        });
      }
    } else {
      // CASE B: Procedural items for Level 2
      this.collectSeed = cData.seed ?? 3025;
      this.collectCountTarget = cData.count ?? 8;
      randomSeed(this.collectSeed);
      const shapes = ["circle", "square", "triangle", "star"];
      let candidates = this.platforms.filter((p) => p.w >= 60);
      if (candidates.length === 0) candidates = this.platforms;

      for (let i = 0; i < this.collectCountTarget; i++) {
        const plat = random(candidates);
        let x = random(plat.x + 20, plat.x + plat.w - 20);
        if (x > this.endZone.x - 20) x = this.endZone.x - 40;
        const y = plat.y - 25;
        const col = color(random(100, 255), random(100, 255), random(100, 255));
        col.setAlpha(210);
        this.collectibles.push({
          x,
          y,
          r: 12,
          shape: random(shapes),
          col,
          collected: false,
        });
      }
    }
  }

  playerInEndZone(player) {
    return (
      player.x + player.r > this.endZone.x &&
      player.x - player.r < this.endZone.x + this.endZone.w &&
      player.y + player.r > this.endZone.y &&
      player.y - player.r < this.endZone.y + this.endZone.h
    );
  }

  updateCollectibles(player) {
    for (const it of this.collectibles) {
      if (it.collected) continue;
      if (dist(player.x, player.y, it.x, it.y) < player.r + it.r) {
        it.collected = true;
        this.collectedCount++;
      }
    }
  }

  drawWorld() {
    stroke(255, 255, 255, 20);
    strokeWeight(1);
    background(this.theme.bg);
    push();
    noStroke();
    fill(this.theme.platform);
    for (const p of this.platforms) rect(p.x, p.y, p.w, p.h);
    fill(30, 30, 30, 35);
    rect(this.endZone.x, 0, this.endZone.w, this.endZone.h);

    for (const it of this.collectibles) {
      if (it.collected) continue;
      push();
      translate(it.x, it.y);
      const c = color(it.col);
      c.setAlpha(160 + sin(frameCount * 0.02) * 60);
      fill(c);
      if (it.shape === "circle") ellipse(0, 0, 24);
      else if (it.shape === "square") {
        rectMode(CENTER);
        rect(0, 0, 24, 24);
      } else if (it.shape === "triangle") triangle(0, -12, -12, 12, 12, 12);
      else if (it.shape === "star") {
        beginShape();
        for (let k = 0; k < 10; k++) {
          let ang = (k / 10) * TAU - HALF_PI;
          let rad = k % 2 === 0 ? 12 : 5;
          vertex(cos(ang) * rad, sin(ang) * rad);
        }
        endShape(CLOSE);
      }
      pop();
    }
    pop();
  }
}
