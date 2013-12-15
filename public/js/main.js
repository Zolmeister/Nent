function Enemy(config) {
  Entity.call(this, config)
  this.target = config.target
  this.toughness = config.toughness
}
Enemy.prototype = Object.create(Entity.prototype)

Enemy.prototype.physics = function() {
  var dir = dirTowards(this.target, this)
  this.x += Math.cos(dir) * this.speed
  this.y += Math.sin(dir) * this.speed
}


function Bullet(x, y, size, rot, speed) {
  Entity.call(this, x, y, size, rot, speed)
}
Bullet.prototype = Object.create(Entity.prototype)

function physics() {
  GAME.spawner.physics()
  for(var i=GAME.enemies.length-1; i>=0; i--){
    var enemy = GAME.enemies[i]
    enemy.physics()
    if(collide(enemy, GAME.player)){
      enemy.size -= .8 / enemy.toughness
      GAME.gold(GAME.gold() - 100)
    }

    for(var j=GAME.player.arm.length-1; j>=0; j--) {
      var collided = collide(enemy, GAME.player.arm[j])
      if(collided){
        enemy.size -= .5
        if(enemy.size < 10) enemy.size = 0
        //GAME.score += 20
      }
    }

    for(var j=GAME.bullets.length-1; j>=0; j--){
      var collided = collide(enemy, GAME.bullets[j])
      if(collided){
        enemy.size -= .5 / enemy.toughness
        if(enemy.size < 10) enemy.size = 0
        GAME.bullets[j].speed = Math.max(2, GAME.bullets[j].speed/1.1)
        //GAME.score += 20
      }
    }


    if(outSize(enemy, -100, -100, GAME.w + 100, GAME.h + 100) || enemy.size <= 5) {
      GAME.enemies.splice(i,1)
      GAME.gold(GAME.gold() + 100)
    }
  }

  GAME.player.physics(GAME.inputX[0], GAME.inputY[0], GAME.inputRot[0])

  for(var i=GAME.bullets.length-1; i>=0; i--){
    var bullet = GAME.bullets[i]
    bullet.physics()

    if(outSize(bullet, -100, -100, GAME.w + 100, GAME.h + 100)) {
      GAME.bullets.splice(i,1)
    }
  }
}

function paint() {
  GAME.ctx.clearRect(0, 0, GAME.w, GAME.h)

  for(var i=GAME.bullets.length-1; i>=0; i--){
    var bullet = GAME.bullets[i]
    bullet.draw(GAME.ctx)
  }
  for(var i=GAME.enemies.length-1; i>=0; i--) {
    var enemy = GAME.enemies[i]
    enemy.draw(GAME.ctx)
  }

  GAME.player.draw(GAME.ctx)
  GAME.spawner.draw(GAME.ctx)
}

var MS_PER_UPDATE = 18
var lag = 0.0
var previousTime = 0.0

function animate(time) {

  lag += time-previousTime
  previousTime = time

  var MAX_CYCLES = 20
  while (lag >= MS_PER_UPDATE && MAX_CYCLES) {
    physics()
    lag -= MS_PER_UPDATE
    MAX_CYCLES--
  }

  if(lag/MS_PER_UPDATE > 75) {
    lag = 0.0
  }

  paint()

  var tLeft = GAME.timer - time
  if (tLeft < 0) {
    tLeft = 0
    if (!GAME.bossMode()) {
      GAME.bossMode(true)
    }
  }
  var sec = Math.floor(tLeft / 1000) % 60
  sec = sec < 10 ? '0'+sec : sec
  var ms = Math.floor(tLeft / 10) % 100
  ms = ms < 10 ? '0'+ms : ms
  GAME.$time.text('00:'+sec+':'+ms)
}


