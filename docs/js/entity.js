function Entity(config) {
  //x, y, size, rot, speed, color
  this.x = config.x || 0
  this.y = config.y || 0
  this.size = config.size || 10
  this.rot = config.rot || 0
  this.speed = config.speed || 0
  this.color = config.color || randColor().lighten(0.2)
}

Entity.prototype.physics = function() {
  this.x += this.speed * Math.cos(this.rot)
  this.y += this.speed * Math.sin(this.rot)
}

Entity.prototype.draw = function(ctx) {
  if(this.size <= 0) return;

  ctx.fillStyle = getGradient(ctx, this.x, this.y, this.size*2.1, this.color, this.opacity)
  ctx.beginPath()
  ctx.arc(this.x, this.y, this.size*2.1, 0, Math.PI*2, true)
  ctx.closePath()
  ctx.fill()
}
