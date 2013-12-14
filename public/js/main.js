debug = false
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
  GAME.w = 400*2 //window.innerWidth
  GAME.h = 200*2 //window.innerHeight
  GAME.canv.width = GAME.w
  GAME.canv.height = GAME.h

  GAME.ctx = GAME.canv.getContext('2d')

  GAME.outCanv = document.createElement('canvas')
  GAME.outCanv.width = GAME.w/2
  GAME.outCanv.height = GAME.h/2
  GAME.outCtx = GAME.outCanv.getContext('2d')
  document.body.appendChild(GAME.outCanv)

  GAME.player = new Player({
    x:GAME.w/2, y:GAME.h/2, size:50, weapon:0
  })

  GAME.spawner = new Spawner()
  requestAnimationFrame(animate)
}


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


  if(debug) {
    ctx.beginPath()
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(this.x+this.size*Math.cos(this.rot), this.y+this.size*Math.sin(this.rot))
    ctx.closePath()
    ctx.stroke()
  }
}

function Spawner() {
  this.frame = 0
  this.threshold = 220
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

  GAME.enemies.push(new Enemy({
    x:x, y:y, size:40, speed:5, target: GAME.player
  }))
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

function Enemy(config) {
  Entity.call(this, config)
  this.target = config.target
}
Enemy.prototype = Object.create(Entity.prototype)

Enemy.prototype.physics = function() {
  var dir = dirTowards(this.target, this)
  this.x += 1*Math.cos(dir)
  this.y += Math.sin(dir)
}


function Player(config) {
  Entity.call(this, config)
  this.weapon = config.weapon || 0
  this.cooldown = 0
}
Player.prototype = Object.create(Entity.prototype)

Player.prototype.physics = function(dx, dy, dr) {
  // TODO: fix player movement to be constant speed, intead of faster diagonals
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
       var size = 15
       GAME.bullets.push(new Bullet({
         x:this.x, y:this.y, size:size, rot:this.rot, speed:speed
       }))
       GAME.bullets.push(new Bullet({
         x:this.x, y:this.y, size:size, rot:this.rot+2, speed:speed
       }))
       GAME.bullets.push(new Bullet({
         x:this.x, y:this.y, size:size, rot:this.rot-2, speed:speed
       }))
     }
  }
}

Player.prototype.draw = function(ctx) {
  Entity.prototype.draw.call(this, ctx)
  if(this.weapon === 0) {
    ctx.lineWidth = 5
    ctx.strokeStyle = this.color.hexString()
    ctx.beginPath()
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(this.x+this.size/2*Math.cos(this.rot), this.y+this.size/2*Math.sin(this.rot))
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(this.x+this.size/2*Math.cos(this.rot+2), this.y+this.size/2*Math.sin(this.rot+2))
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(this.x+this.size/2*Math.cos(this.rot-2), this.y+this.size/2*Math.sin(this.rot-2))
    ctx.stroke()
  }
  else if(this.weapon === 1) {
    // draw arms
    var tx = Math.cos(this.rot)
    var ty = Math.sin(this.rot)

    ctx.beginPath()
    ctx.moveTo(this.x+this.size*Math.cos(this.rot), this.y+this.size*Math.sin(this.rot))
    ctx.lineTo(this.x+300*Math.cos(this.rot), this.y+300*Math.sin(this.rot))
    ctx.closePath()
    ctx.lineWidth = 5
    ctx.strokeStyle= 'rgba(55,55,255,1)'
    ctx.stroke()

    /*var c1xy = rot(500, 0, this.rot)
    var c2xy = rot(0, -40, this.rot)
    ctx.bezierCurveTo(this.x-c1xy[0], this.y-c1xy[1],this.x-c2xy[0], this.y-c2xy[1], this.x, this.y)
    ctx.bezierCurveTo(this.x+c1xy[0], this.y+c1xy[1],this.x+c2xy[0], this.y+c2xy[1], this.x, this.y)*/
    //ctx.quadraticCurveTo(this.x-120*tx, this.y-70*ty, this.x-150*tx, this.y-150*ty)
    //ctx.quadraticCurveTo(this.x-180*tx, this.y-40*ty, this.x, this.y)
    //ctx.lineTo(this.x, this.y)

    /*ctx.beginPath()
    ctx.moveTo(this.x+this.size*Math.cos(this.rot), this.y+this.size*Math.sin(this.rot))
    ctx.lineTo(this.x+300*Math.cos(this.rot), this.y+300*Math.sin(this.rot))
    ctx.lineWidth = 20
    ctx.strokeStyle= 'rgba(55,55,255,.8)'
    ctx.stroke()*/


  }
}

function Bullet(x, y, size, rot, speed) {
  Entity.call(this, x, y, size, rot, speed)
}
Bullet.prototype = Object.create(Entity.prototype)


function animate() {
  requestAnimationFrame(animate)
  GAME.outCtx.fillStyle = '#090909'
  GAME.ctx.clearRect(0, 0, GAME.w, GAME.h)
  GAME.outCtx.fillRect(0, 0, GAME.w, GAME.h)

  GAME.spawner.physics()
  for(var i=GAME.enemies.length-1; i>=0; i--){
    var enemy = GAME.enemies[i]
    enemy.physics()
    if(collide(enemy, GAME.player)){
      enemy.size -= .8
      GAME.score -= 400
    }

    for(var j=GAME.bullets.length-1; j>=0; j--){
      var collided = collide(enemy, GAME.bullets[j])
      if(collided){
        enemy.size -= .5
        if(enemy.size < 15) enemy.size = 0
        GAME.bullets[j].speed = Math.max(2, GAME.bullets[j].speed/1.1)
        GAME.score += 20
      }
    }

    enemy.draw(GAME.ctx)
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

  GAME.outCtx.drawImage(GAME.canv, 0, 0, GAME.w, GAME.h, 0, 0, GAME.outCanv.width, GAME.outCanv.height)
  GAME.outCtx.font = '16px Monospace bold'
  GAME.outCtx.fillStyle = '#cff'
  GAME.outCtx.fillText(GAME.score, 30, 16)
}

$(init)


