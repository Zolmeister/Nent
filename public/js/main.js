GAME = {
  moveKeys: {
    65: [-1, null], //'left',
    87: [null, -1], //'up',
    68: [ 1, null], //'right',
    83: [null, 1], //'down',
    37: [-1, null], //'left',
    38: [null, -1], //'up',
    39: [ 1, null], //'right',
    40: [null, 1], //'down'
  },
  rotKeys: {
    74: -.1,
    75: .1
  },
  inputRot: 0,
  inputX: 0,
  inputY: 0,
  bullets: [],
  enemies: []
}

function init() {
  // add canvas
  GAME.canv = document.createElement('canvas')
  GAME.w = 600 //window.innerWidth
  GAME.h = 400 //window.innerHeight
  GAME.canv.width = GAME.w
  GAME.canv.height = GAME.h

  GAME.ctx = GAME.canv.getContext('2d')

  GAME.outCanv = document.createElement('canvas')
  GAME.outCanv.width = GAME.w
  GAME.outCanv.height = GAME.h
  GAME.outCtx = GAME.outCanv.getContext('2d')
  document.body.appendChild(GAME.outCanv)


  GAME.player = new Player(GAME.w/2, GAME.h/2, 10, 0, 0)
  GAME.spawner = new Spawner()
  requestAnimationFrame(animate)
}


function Entity(x, y, size, rot, vx, vy) {
  this.x = x || 0
  this.y = y || 0
  this.size = size || 10
  this.rot = rot || 0
  this.vx = vx || 0
  this.vy = vy || 0
}

Entity.prototype.physics = function() {
  this.x += this.vx
  this.y += this.vy
}

Entity.prototype.draw = function(ctx) {
  ctx.fillStyle = '#008080'
  ctx.beginPath()
  ctx.arc(this.x, this.y, this.size, 0, Math.PI*2, true)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(this.x, this.y)
  ctx.lineTo(this.x+10*Math.cos(this.rot), this.y+10*Math.sin(this.rot))
  ctx.closePath()
  ctx.stroke()
}

function Spawner() {
  this.frame = 0
  this.threshold = 150
  GAME.enemies.push(new Enemy(10, 10, 10, null, 0, 0))
  GAME.enemies.push(new Enemy(20, 20, 10, null, 0, 0))
  GAME.enemies.push(new Enemy(30, 30, 10, null, 0, 0))
}

Spawner.prototype.physics = function() {
  if (this.frame % 20 === 0) {
    this.spawn()
  }

  this.frame++
}

Spawner.prototype.spawn = function() {
  GAME.enemies.push(new Enemy(0, 0, 20, null, Math.random(), Math.random()))
}

Spawner.prototype.draw = function(ctx) {
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

function Enemy(x, y, size, rot, vx, vy) {
  Entity.call(this, x, y, size, rot, vx, vy)
}
Enemy.prototype = Object.create(Entity.prototype)

Enemy.prototype.draw = function(ctx) {
  ctx.beginPath()
  var grad = ctx.createRadialGradient(this.x, this.y, 1, this.x, this.y, this.size)
  //grad.addColorStop(0, 'rgba(' + colors.r +',' + colors.g + ',' + colors.b + ',1)')
  //grad.addColorStop(1, 'rgba(' + colors.r +',' + colors.g + ',' + colors.b + ',0)')
  grad.addColorStop(0, 'rgba(255,55,255,1)')
  grad.addColorStop(1, 'rgba(255,55,255,0)')
  ctx.fillStyle = grad
  ctx.arc(this.x, this.y, this.size, 0, Math.PI*2)
  ctx.closePath()
  ctx.fill()
}


function Player(x, y, size, rot, vx, vy, weapon) {
  Entity.call(this, x, y, size, rot, vx, vy)
  this.weapon = weapon || 0
  this.cooldown = 0
}
Player.prototype = Object.create(Entity.prototype)

Player.prototype.physics = function(dx, dy, dr) {
  this.x += dx
  this.y += dy
  if(this.x - this.size < 0 || this.x+this.size > GAME.w){
    this.x -= dx
  }
  if(this.y - this.size < 0 || this.y+this.size > GAME.h){
    this.y -= dy
  }
  this.rot += dr

   if (this.weapon === 0) { return
    this.cooldown--
    if (this.cooldown <= 0) {
      this.cooldown = 10
      GAME.bullets.push(new Bullet(this.x, this.y, 10, this.rot, 5*Math.cos(this.rot), 5*Math.sin(this.rot)))
    }
  }
}

function Bullet(x, y, size, rot, vx, vy) {
  Entity.call(this, x, y, size, null, vx, vy)
}
Bullet.prototype = Object.create(Entity.prototype)

Bullet.prototype.draw = function(ctx) {
  ctx.strokeStyle = '#71eeb8'
  ctx.beginPath()
  ctx.moveTo(this.x, this.y)
  ctx.lineTo(this.x+this.vx, this.y+this.vy)
  ctx.closePath()
  ctx.stroke()
}

/*Bullet.prototype.physics = function() {
  this.x += this.vx
  this.y += this.vy
}*/

function animate() {
  requestAnimationFrame(animate)
  GAME.outCtx.fillStyle = '#111'
  GAME.ctx.clearRect(0, 0, GAME.w, GAME.h)
  GAME.outCtx.fillRect(0, 0, GAME.w, GAME.h)

  GAME.spawner.physics()
  _.each(GAME.enemies, function(enemy) {
    enemy.physics()
    enemy.draw(GAME.ctx)
  })
  GAME.spawner.draw(GAME.ctx)

  GAME.player.physics(GAME.inputX, GAME.inputY, GAME.inputRot)
  GAME.player.draw(GAME.ctx)
  _.each(GAME.bullets, function(bullet) {
    bullet.physics()
    bullet.draw(GAME.ctx)
  })

  GAME.outCtx.drawImage(GAME.canv, 0, 0)
}

$(init)


