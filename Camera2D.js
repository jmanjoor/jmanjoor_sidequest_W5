class Camera2D {
  constructor(viewW, viewH) {
    this.viewW = viewW;
    this.viewH = viewH;
    this.x = 0;
    this.y = 0;
  }
  followSideScrollerX(targetX, lerpAmt, calm = false) {
    const desired = targetX - this.viewW / 2;
    const amt = calm ? lerpAmt * 0.4 : lerpAmt;
    this.x = lerp(this.x, desired, amt);

    this.x += sin(frameCount * 0.002) * 0.2;
  }

  clampToWorld(worldW, worldH) {
    const maxX = max(0, worldW - this.viewW);
    const maxY = max(0, worldH - this.viewH);
    this.x = constrain(this.x, 0, maxX);
    this.y = constrain(this.y, 0, maxY);
  }

  begin() {
    push();
    translate(-this.x, -this.y);
  }
  end() {
    pop();
  }
}
