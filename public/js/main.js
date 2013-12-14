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
  bullets: []
}

function init() {
  // add canvas
  GAME.canv = document.createElement('canvas')
  GAME.w = 600 //window.innerWidth
  GAME.h = 400 //window.innerHeight
  GAME.canv.width = GAME.w
  GAME.canv.height = GAME.h

  GAME.ctx = GAME.canv.getContext('2d')
  document.body.appendChild(GAME.canv)


  GAME.player = new Player(GAME.w/2, GAME.h/2, 10, 0, 0)
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

function Enemy(x, y, size, vx, vy) {
  Entity.call(this, x, y, size, null, vx, vy)
}

function Player(x, y, size, rot, vx, vy, weapon) {
  Entity.call(this, x, y, size, rot, vx, vy)
  this.weapon = weapon || 0
  this.cooldown = 0
}

Player.prototype = Object.create(Entity.prototype)

Player.prototype.draw = function(ctx) {
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

Player.prototype.physics = function(dx, dy, dr) {
  this.x += dx
  this.y += dy

  this.rot += dr

   if (this.weapon === 0) {
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

Bullet.prototype.physics = function() {
  this.x += this.vx //*Math.cos(this.rot)
  this.y += this.vy //*Math.sin(this.rot)
}

function animate() {
  requestAnimationFrame(animate)
  GAME.ctx.fillStyle = '#111'
  GAME.ctx.fillRect(0, 0, GAME.w, GAME.h)
  GAME.player.physics(GAME.inputX, GAME.inputY, GAME.inputRot)
  GAME.player.draw(GAME.ctx)
  _.each(GAME.bullets, function(bullet) {
    bullet.physics()
    bullet.draw(GAME.ctx)
  })


}

$(init)


window.onkeydown = function(e) {
  // TODO: fix this horrible code...
  if(Object.keys(GAME.moveKeys).indexOf(''+e.which) !== -1) {
    var dir = GAME.moveKeys[e.which]

    if(dir[0]) {
      GAME.inputX = dir[0]
    }

    if(dir[1]) {
      GAME.inputY = dir[1]
    }

  } else if (Object.keys(GAME.rotKeys).indexOf(''+e.which) !== -1) {
    GAME.inputRot = GAME.rotKeys[e.which]
  }
  //console.log(GAME.inputX, GAME.inputY, GAME.inputRot)
}

window.onkeyup = function(e) {
  if(Object.keys(GAME.moveKeys).indexOf(''+e.which) !== -1) {
    var dir = GAME.moveKeys[e.which]

    if(dir[0] === GAME.inputX) {
      GAME.inputX = 0
    }

    if(dir[1] === GAME.inputY) {
      GAME.inputY = 0
    }

  } else if (Object.keys(GAME.rotKeys).indexOf(''+e.which) !== -1) {
    GAME.inputRot = 0
  }
  //console.log(GAME.inputX, GAME.inputY, GAME.inputRot)

}
