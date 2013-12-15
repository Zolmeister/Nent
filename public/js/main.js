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


function Bullet(x, y, size, rot, speed) {
  Entity.call(this, x, y, size, rot, speed)
}
Bullet.prototype = Object.create(Entity.prototype)


function animate(time) {
  //requestAnimationFrame(animate)
  //GAME.outCtx.fillStyle = '#090909'
  //GAME.ctx.fillStyle='#111'
  GAME.ctx.clearRect(0, 0, GAME.w, GAME.h)
  //GAME.outCtx.fillRect(0, 0, GAME.w, GAME.h)

  GAME.spawner.physics()
  for(var i=GAME.enemies.length-1; i>=0; i--){
    var enemy = GAME.enemies[i]
    enemy.physics()
    if(collide(enemy, GAME.player)){
      enemy.size -= .8
      //GAME.score -= 400
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
        enemy.size -= .5
        if(enemy.size < 10) enemy.size = 0
        GAME.bullets[j].speed = Math.max(2, GAME.bullets[j].speed/1.1)
        //GAME.score += 20
      }
    }

    enemy.draw(GAME.ctx)
    if(outSize(enemy, -100, -100, GAME.w + 100, GAME.h + 100) || enemy.size <= 5) {
      GAME.enemies.splice(i,1)
      GAME.gold(GAME.gold() + 100)
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



  // clear gold
  /*GAME.hudCtx.clearRect(30, 5, 120, 20)
  GAME.hudCtx.clearRect(30, 5, 1200, 200)

  GAME.hudCtx.fillText('gold: ' + GAME.gold, 30, 20)
  var tLeft = GAME.timer - time
  if (tLeft < 0) tLeft = 0
  var sec = Math.floor(tLeft / 1000) % 60
  sec = sec < 10 ? '0'+sec : sec
  var ms = Math.floor(tLeft / 10) % 100
  ms = ms < 10 ? '0'+ms : ms
  GAME.hudCtx.fillText('Time: 00:' + sec + ':' + ms, 50, 50)*/
}


