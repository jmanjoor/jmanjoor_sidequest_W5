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

    // End zone (goal strip at far right)
    const e = levelJson.end ?? { x: this.w - 120, w: 80 };
    this.endZone = {
      x: e.x ?? this.w - 120,
      y: 0,
      w: e.w ?? 80,
      h: this.h,
    };

    // Collectibles: support BOTH formats:
    // A) array: [{x,y,shape,color}, ...]
    // B) object: {count, seed}
    const cData = levelJson.collectibles ?? { count: 8, seed: 3025 };

    this.collectibles = [];
    this.collectedCount = 0;

    // ---------- CASE A: explicit list ----------
    if (Array.isArray(cData)) {
      this.collectCountTarget = cData.length;

      for (const item of cData) {
        const shape = item.shape ?? "circle";
        const col = color(item.color ?? "#88AADD");
        col.setAlpha(210);

        this.collectibles.push({
          x: item.x,
          y: item.y,
          r: 12,
          shape,
          col,
          collected: false,
        });
      }
      return;
    }

    // ---------- CASE B: procedural ----------
    this.collectSeed = cData.seed ?? 3025;
    this.collectCountTarget = cData.count ?? 8;

    randomSeed(this.collectSeed);

    const shapes = ["circle", "square", "triangle", "star"];

    // pick “safe” platforms: wide enough + not too high
    let candidates = this.platforms.filter((p) => p.w >= 90 && p.y >= 260);
    if (candidates.length === 0) candidates = this.platforms;

    const r = 12;
    const margin = 30;

    for (let i = 0; i < this.collectCountTarget; i++) {
      const plat = random(candidates);

      // avoid placing inside end zone area
      let x = random(plat.x + margin, plat.x + plat.w - margin);
      if (x > this.endZone.x - 40) x = this.endZone.x - 60;

      // always just above platform surface (reachable + visible)
      const y = plat.y - (r + 10);

      const shape = random(shapes);
      const col = color(random(60, 200), random(60, 200), random(60, 200));
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

  playerInEndZone(player) {
    // player is a circle, endZone is a rect
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

    // end zone strip
    push();
    noStroke();
    fill(30, 30, 30, 35);
    rect(this.endZone.x, 0, this.endZone.w, this.endZone.h);
    pop();

    // collectibles
    for (const it of this.collectibles) {
      if (it.collected) continue;

      push();
      translate(it.x, it.y);

      const a = 160 + sin(frameCount * 0.02) * 60;
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
