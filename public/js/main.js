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


function animate() {
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
      GAME.gold += 100
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

  //GAME.outCtx.drawImage(GAME.canv, 0, 0, GAME.w, GAME.h, 0, 0, GAME.outCanv.width, GAME.outCanv.height)
  //GAME.outCtx.font = '16px Monospace bold'
  //GAME.hudCtx.fillStyle = '#fff'
  GAME.hudCtx.clearRect(30, 5, 120, 20)
  //GAME.hudCtx.fillStyle = '#0ff'
  GAME.hudCtx.fillText('gold: '+GAME.gold, 30, 20)
}


