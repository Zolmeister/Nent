debug = true
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
    74: -Math.PI/100,
    75: Math.PI/100
  },
  inputRot: 0,
  inputX: 0,
  inputY: 0,
  bullets: [],
  enemies: [],
  score: 0
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


  GAME.player = new Player(GAME.w/2, GAME.h/2, 20, 0, 0)
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
  this.x += this.vx * Math.cos(this.rot)
  this.y += this.vy * Math.sin(this.rot)
}

Entity.prototype.draw = function(ctx) {
  if(this.size <= 0) return
  var cX = Math.abs(this.x + Math.cos(this.rot)/2)
  var cY = Math.abs(this.y + Math.sin(this.rot)/2)
  var grad = ctx.createRadialGradient(cX, cY, 1, cX, cY, this.size)
  grad.addColorStop(0, 'rgba(55,55,255,1)')
  grad.addColorStop(1, 'rgba(55,55,255,0)')

  ctx.fillStyle = grad //'#008080'
  ctx.beginPath()
  ctx.arc(this.x, this.y, this.size, 0, Math.PI*2, true)
  ctx.closePath()
  ctx.fill()

  if(debug) {
    ctx.beginPath()
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(this.x+10*Math.cos(this.rot), this.y+10*Math.sin(this.rot))
    ctx.closePath()
    ctx.stroke()
  }
}

function Spawner() {
  this.frame = 0
  this.threshold = 150
}

Spawner.prototype.physics = function() {
  if (this.frame % 100 === 0) {
    this.spawn()
  }

  this.frame++
}

Spawner.prototype.spawn = function() {
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

  GAME.enemies.push(new Enemy(x, y, 20, null, 0, 0, GAME.player))
}

Spawner.prototype.draw = function(ctx) {
  // metabolize ctx
  var data = ctx.getImageData(0, 0, GAME.w, GAME.h)
  var pix = data.data
  for(var i=0, l=pix.length; i<l; i+=4) {
    if(pix[i+3] < this.threshold) {
      pix[i+3] /= 5
      if(pix[i+3] > this.threshold/4) {
        pix[i+3] = 0
      }
    }
  }
  ctx.putImageData(data, 0, 0)
}

function dirTowards(to, from) {
  return Math.atan2(to.y-from.y, to.x-from.x)
}

function Enemy(x, y, size, rot, vx, vy, target) {
  Entity.call(this, x, y, size, rot, vx, vy)
  this.target = target
}
Enemy.prototype = Object.create(Entity.prototype)

Enemy.prototype.physics = function() {
  var dir = dirTowards(this.target, this)
  this.x += 1*Math.cos(dir)
  this.y += Math.sin(dir)
}

Enemy.prototype.draw = function(ctx) {
  ctx.beginPath()
  var grad = ctx.createRadialGradient(this.x, this.y, 1, this.x, this.y, this.size)
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

   if (this.weapon === 0) {
    this.cooldown--
    if (this.cooldown <= 0) {
      this.cooldown = 10
      var speed = 5
      var size = 10
      GAME.bullets.push(new Bullet(this.x, this.y, size, this.rot, speed, speed))
      GAME.bullets.push(new Bullet(this.x, this.y, size, this.rot + 2, speed, speed))
      GAME.bullets.push(new Bullet(this.x, this.y, size, this.rot - 2, speed, speed))
    }
  }
}

function Bullet(x, y, size, rot, vx, vy) {
  Entity.call(this, x, y, size, rot, vx, vy)
}
Bullet.prototype = Object.create(Entity.prototype)

/*Bullet.prototype.draw = function(ctx) {
  var grad = ctx.createRadialGradient(this.x+20*this.vx/2, this.y+20*this.vy/2, 1, this.x+20*this.vx/2,
                                      this.y+20*this.vy/2, this.size)
  grad.addColorStop(0, 'rgba(255,55,255,1)')
  grad.addColorStop(1, 'rgba(255,55,255,0)')

  ctx.lineWidth = 5
  ctx.strokeStyle = grad //'#71eeb8'
  ctx.beginPath()
  ctx.moveTo(this.x, this.y)
  ctx.lineTo(this.x+this.size*Math.cos(this.rot), this.y+this.size*Math.sin(this.rot))
  ctx.closePath()
  ctx.stroke()
}*/

/*Bullet.prototype.physics = function() {
  this.x += this.vx * Math.cos(this.rot)
  this.y += this.vy * Math.sin(this.rot)
}*/

function outSize(enemy, x,y,w,h) {
  if (enemy.x - enemy.size < x || enemy.x + enemy.size > w+100 ||
        enemy.y - enemy.size < y || enemy.y + enemy.size > h+100) {
      return true
    }
  return false
}

function collide(a, b) {
  return distance(a, b) <= a.size //+ b.size
}

function distance(a, b) {
  return Math.sqrt(Math.pow(a.x-b.x, 2) + Math.pow(a.y - b.y, 2))
}

function animate() {
  requestAnimationFrame(animate)
  GAME.outCtx.fillStyle = '#111'
  GAME.ctx.clearRect(0, 0, GAME.w, GAME.h)
  GAME.outCtx.fillRect(0, 0, GAME.w, GAME.h)

  GAME.spawner.physics()
  for(var i=GAME.enemies.length-1; i>=0; i--){
    var enemy = GAME.enemies[i]
    enemy.physics()
    enemy.draw(GAME.ctx)
    if(collide(enemy, GAME.player)){
      enemy.size -= 2
    }
    for(var j=GAME.bullets.length-1; j>=0; j--){
      var collided = collide(enemy, GAME.bullets[j])
      if(!GAME.bullets[j].used && collided){
        enemy.size -= 2
        GAME.bullets[j].used = true
        GAME.score += 20
      } else if(collided) {
        GAME.bullets[j].size -= 5
      }
    }
    if(outSize(enemy, -100, -100, GAME.w + 100, GAME.h + 100) || enemy.size <= 5) {
      GAME.enemies.splice(i,1)
      GAME.score += 100
    }


  }

  GAME.player.physics(GAME.inputX, GAME.inputY, GAME.inputRot)
  for(var i=GAME.bullets.length-1; i>=0; i--){
    var bullet = GAME.bullets[i]
    bullet.physics()
    bullet.draw(GAME.ctx)
    if(outSize(bullet, -100, -100, GAME.w + 100, GAME.h + 100)) {
      GAME.bullets.splice(i,1)
    }
  }



  GAME.player.draw(GAME.ctx)
  GAME.spawner.draw(GAME.ctx)

  GAME.outCtx.drawImage(GAME.canv, 0, 0)
  GAME.outCtx.font = '16px Monospace bold'
  GAME.outCtx.fillStyle = '#cff'
  GAME.outCtx.fillText(GAME.score, 30, 16)
}

$(init)


