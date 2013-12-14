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
  GAME.w = 400 //window.innerWidth
  GAME.h = 200 //window.innerHeight
  GAME.canv.width = GAME.w
  GAME.canv.height = GAME.h

  GAME.ctx = GAME.canv.getContext('2d')

  GAME.outCanv = document.createElement('canvas')
  GAME.outCanv.width = GAME.w
  GAME.outCanv.height = GAME.h
  GAME.outCtx = GAME.outCanv.getContext('2d')
  document.body.appendChild(GAME.outCanv)

  GAME.player = new Player({
    x:GAME.w/2, y:GAME.h/2, size:25, weapon:0
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
  this.color = config.color || randColor()

}

var randColor = (function() {
  var i = 0
  return function() {
    i++
    var rM = (i%3==0?1:0)
    var gM = (i%3==1?1:0)
    var bM = (i%3==2?1:0)
    var r = 25 + Math.random()*30 + 150*rM+Math.random()*100*rM
    var g = 25 + Math.random()*30 +150*gM+Math.random()*100*gM
    var b = 25 + Math.random()*30 + 150*bM+Math.random()*100*bM
    return new Color().rgb(r,g,b)
  }
})()

Entity.prototype.physics = function() {
  this.x += this.speed * Math.cos(this.rot)
  this.y += this.speed * Math.sin(this.rot)
}

function getGradient(ctx, x, y, size, color ) {
  //var cX = Math.abs(this.x + Math.cos(this.rot)/2)
  //var cY = Math.abs(this.y + Math.sin(this.rot)/2)
  if(x <= 0) x = 1
  if(y <= 0) y = 1
  var grad = ctx.createRadialGradient(x, y, 1, x, y, size)
  /*var alpha = function(alpha) {
    return 'rgba('+r+','+g+','+b+','+alpha+')'
  }*/
  grad.addColorStop(0, color.alpha(.4).rgbaString())
  grad.addColorStop(0.4, color.alpha(.4).rgbaString())
  grad.addColorStop(.7, color.alpha(1).rgbaString())
  grad.addColorStop(1, color.alpha(0).rgbaString())
  return grad
}

Entity.prototype.draw = function(ctx) {
  if(this.size <= 0) return;


  ctx.fillStyle = getGradient(ctx, this.x, this.y, this.size, this.color) //'#008080'
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
  this.threshold = 210
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
    x:x, y:y, size:20, speed:5, target: GAME.player
  }))
}

Spawner.prototype.draw = function(ctx) {
  // metabolize ctx
  var data = ctx.getImageData(0, 0, GAME.w, GAME.h)
  var pix = data.data
  for(var i=0, l=pix.length; i<l; i+=4) {
    if(pix[i+3] < this.threshold) {
      pix[i+3] /= 4
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

Enemy.prototype.draw = function(ctx) {
  ctx.beginPath()
  ctx.fillStyle = getGradient(ctx, this.x, this.y, this.size, this.color)
  ctx.arc(this.x, this.y, this.size, 0, Math.PI*2)
  ctx.closePath()
  ctx.fill()
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

   if (this.weapon === 0) { return
    this.cooldown--
    if (this.cooldown <= 0) {
      this.cooldown = 10
      var speed = 5
      var size = 10
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
  if(this.weapon === 1) {
    // draw arms
    var length = 10
    var grad = ctx.createRadialGradient(this.x, this.y, 1, this.x, this.y, this.size+50)
    grad.addColorStop(0, 'rgba(55,55,255,0)')
    grad.addColorStop(.5, 'rgba(55,55,255,1)')
    grad.addColorStop(1, 'rgba(55,55,255,0)')


    var tx = Math.cos(this.rot)
    var ty = Math.sin(this.rot)

    ctx.beginPath()
    ctx.moveTo(this.x, this.y)
    var c1xy = rot(500, 0, this.rot)
    var c2xy = rot(0, -40, this.rot)
    ctx.bezierCurveTo(this.x-c1xy[0], this.y-c1xy[1],this.x-c2xy[0], this.y-c2xy[1], this.x, this.y)
    ctx.bezierCurveTo(this.x+c1xy[0], this.y+c1xy[1],this.x+c2xy[0], this.y+c2xy[1], this.x, this.y)
    //ctx.quadraticCurveTo(this.x-120*tx, this.y-70*ty, this.x-150*tx, this.y-150*ty)
    //ctx.quadraticCurveTo(this.x-180*tx, this.y-40*ty, this.x, this.y)
    //ctx.lineTo(this.x, this.y)
    ctx.fillStyle= 'rgba(55,55,255,1)'
    ctx.fill()
    ctx.closePath()
  }
}

function rot(x, y, dir) {
  /*var rotationMatrix = [
    [Math.cos(dir), -Math.sin(dir)],
    [Math.sin(dir), Math.cos(dir)]
  ]*/
  return [Math.cos(dir)*x - Math.sin(dir)*y, Math.sin(dir)*x + Math.cos(dir)*y]
}


function Bullet(x, y, size, rot, speed) {
  Entity.call(this, x, y, size, rot, speed)
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
    if(collide(enemy, GAME.player)){
      enemy.size -= .25
    }

    /*for(var j=GAME.bullets.length-1; j>=0; j--){
      var collided = collide(enemy, GAME.bullets[j])
      if(!GAME.bullets[j].used && collided){
        enemy.size -= 1
        GAME.bullets[j].used = true
        GAME.score += 20
      } else if(collided) {
        GAME.bullets[j].size -= 5
      }
    }*/

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

  GAME.outCtx.drawImage(GAME.canv, 0, 0)
  GAME.outCtx.font = '16px Monospace bold'
  GAME.outCtx.fillStyle = '#cff'
  GAME.outCtx.fillText(GAME.score, 30, 16)
}

$(init)


