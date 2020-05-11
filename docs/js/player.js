function Player(config) {
  Entity.call(this, config)
  this.weapon = config.weapon || 0
  this.reloadTime = config.reloadTime || 18
  this.damage = config.damage || 10
  this.guns = config.guns || 1
  this.cooldown = 0
  this.arm = []
  if(this.weapon === 1) {
    for(var i=0;i<16;i++){
      this.arm.push(new Entity({x: this.x, y:this.y, size: 12}))
    }
  }
}
Player.prototype = Object.create(Entity.prototype)

Player.prototype.physics = function(dx, dy, dr) {
  var deltaX = 0
  var deltaY = 0

  if(dx && dy) {
    deltaX += Math.sqrt(2)/2 * this.speed * dx
    deltaY += Math.sqrt(2)/2 * this.speed * dy
  } else if (dx) {
    deltaX += this.speed * dx
  } else if (dy) {
    deltaY += this.speed * dy
  }

  this.x += deltaX
  this.y += deltaY


  if(this.x - this.size < 0 || this.x+this.size > GAME.w){
    this.x -= deltaX
  }

  if(this.y - this.size < 0 || this.y+this.size > GAME.h){
    this.y -= deltaY
  }

  if(dr)
    this.rot += dr

  if (this.weapon === 0) {
    this.cooldown--
    if (this.cooldown <= 0) {
      this.cooldown = this.reloadTime
      var speed = 4
      var size = this.damage
      _.each([this.rot, this.rot+.6, this.rot-.6].slice(0, this.guns),function(rot) {
        var x = this.x + Math.cos(rot) * speed * 8
        var y = this.y + Math.sin(rot) * speed * 8
        GAME.bullets.push(new Bullet({
          x: x, y:y, size:size, rot:rot, speed:speed
        }))
      }.bind(this))
    }
  }
  if (this.weapon === 1) {
    for(var i=0;i<this.arm.length;i++) {
      var rDelta = this.i
      var tx = Math.cos(this.rot)
      var ty = Math.sin(this.rot)
      var p = i-this.arm.length/2

      var sign = p < 0 ? -1 : 1

      this.rot+=Math.PI/20*sign*Math.sin(GAME.spawner.frame/100)
      this.arm[i].x = this.x+28*p*tx
      this.arm[i].y = this.y+28*p*ty
    }

  }
}

Player.prototype.draw = function(ctx) {
  Entity.prototype.draw.call(this, ctx)
  if(this.weapon === 0) {
    ctx.lineWidth = 5
    ctx.strokeStyle = this.color.hexString()
    ctx.beginPath()
    _.each([this.rot, this.rot+.6, this.rot-.6].slice(0, this.guns),function(rot) {
      ctx.moveTo(this.x, this.y)
      ctx.lineTo(this.x+this.size/2*Math.cos(rot), this.y+this.size/2*Math.sin(rot))
      ctx.moveTo(this.x, this.y)
      ctx.lineTo(this.x-this.size/2*Math.cos(rot), this.y-this.size/2*Math.sin(rot))
    }.bind(this))

    /*ctx.moveTo(this.x, this.y)
    ctx.lineTo(this.x+this.size/2*Math.cos(this.rot+.1), this.y+this.size/2*Math.sin(this.rot+2))
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(this.x+this.size/2*Math.cos(this.rot-2), this.y+this.size/2*Math.sin(this.rot-2))*/
    ctx.stroke()
  }
  else if(this.weapon === 1) {

    // arms are made up of points
    for(var i=0;i<this.arm.length;i++) {
      var p = i-this.arm.length/2
      if(p <= 1 && p >=-1) continue
      this.arm[i].draw(ctx)
    }


  }
}

Player.prototype.upgrade = function(type) {
  if(type === 'speed') {
    this.speed += .05
  } else if(type === 'rate') {
    this.reloadTime -= 2
  } else if(type === 'damage') {
    this.damage += 1
  } else if(type === 'gun') {
    this.guns += 1
  }
}
