// src/canvas/animator.js
export class Animator {
  constructor(frames, fps = 6) {
    this.frames = frames
    this.frameDuration = 1000 / fps
    this.elapsed = 0
    this.index = 0
  }

  tick(deltaMs) {
    this.elapsed += deltaMs
    if (this.elapsed >= this.frameDuration) {
      this.elapsed -= this.frameDuration
      this.index = (this.index + 1) % this.frames.length
    }
  }

  currentFrame() {
    return this.frames[this.index]
  }

  reset() {
    this.index = 0
    this.elapsed = 0
  }
}
