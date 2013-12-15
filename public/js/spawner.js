function Spawner() {
  this.frame = 0
  this.threshold = 220
  this.bossMode = false
}

Spawner.prototype.physics = function() {
  if (!this.bossMode  && this.frame % 100 === 0) {
    this.spawn()
  }

  this.frame++
}

Spawner.prototype.spawn = function(size, speed, toughness) {
  size = size || 20
  speed = speed || 5
  toughness = toughness || 1

  var x, y
  if(Math.random() > .5) {
    // top or bottom side
    y = Math.random() > .5 ? GAME.h : -20
    x = Math.floor(Math.random() * GAME.w)
  } else {
    // left or right size
    x = Math.random() > .5 ? GAME.w : -20
    y = Math.floor(Math.random() * GAME.h)
  }

  GAME.enemies.push(new Enemy({
    x:x, y:y, size:size, speed:speed, target: GAME.player, toughness: toughness
  }))
}

Spawner.prototype.draw = function(ctx) {
  // This is no logner used, as the processing is done on the GPU via fragment shader
  return

  // metabolize ctx
  var data = ctx.getImageData(0, 0, GAME.w, GAME.h)
  var pix = data.data
  for(var i=0, l=pix.length; i<l; i+=4) {
    if(pix[i+3] < this.threshold) {
      pix[i+3] /= 6
      if(pix[i+3] > this.threshold/4) {
        pix[i+3] = 0
      }
    }
  }
  ctx.putImageData(data, 0, 0)
}

Spawner.prototype.enableBossMode = function() {
  this.bossMode = true
  this.spawn(100, null, 20)
}
