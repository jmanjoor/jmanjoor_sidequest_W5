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

    // --- End zone (finish area) ---
    // Default: last 120px of the world
    this.endZone = levelJson.endZone ?? {
      x: this.w - 140,
      y: 0,
      w: 140,
      h: this.h,
    };

    // --- Collectibles (deterministic via seed) ---
    const cData = levelJson.collectibles ?? { count: 8, seed: 3025 };
    this.collectSeed = cData.seed ?? 3025;
    this.collectCountTarget = cData.count ?? 8;

    this.collectibles = [];
    this.collectedCount = 0;

    this._spawnCollectibles();
  }

  _spawnCollectibles() {
    this.collectibles = [];
    this.collectedCount = 0;

    randomSeed(this.collectSeed);
    const shapes = ["circle", "square", "triangle", "star"];

    // Prefer “reachable-ish” platforms: not tiny, not extremely high
    let candidates = this.platforms.filter((p) => p.w >= 90 && p.y >= 260);
    if (candidates.length === 0) candidates = this.platforms;

    for (let i = 0; i < this.collectCountTarget; i++) {
      const plat = random(candidates);

      const x = random(plat.x + 28, plat.x + plat.w - 28);
      const y = plat.y - 26; // consistently just above platform

      const shape = random(shapes);
      const col = color(random(60, 200), random(60, 200), random(60, 200));
      col.setAlpha(210);

      this.collectibles.push({ x, y, r: 12, shape, col, collected: false });
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

  playerInEndZone(player) {
    const p = {
      x: player.x - player.r,
      y: player.y - player.r,
      w: player.r * 2,
      h: player.r * 2,
    };
    const z = this.endZone;
    return (
      p.x < z.x + z.w && p.x + p.w > z.x && p.y < z.y + z.h && p.y + p.h > z.y
    );
  }

  drawWorld() {
    background(this.theme.bg);

    // platforms
    push();
    rectMode(CORNER);
    noStroke();
    fill(this.theme.platform);
    for (const p of this.platforms) rect(p.x, p.y, p.w, p.h);
    pop();

    // end zone hint (subtle)
    push();
    noStroke();
    const pulse = 30 + sin(frameCount * 0.04) * 20;
    fill(0, 0, 0, pulse);
    rect(this.endZone.x, this.endZone.y, this.endZone.w, this.endZone.h);
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
      } else {
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
  }
}
