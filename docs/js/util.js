function rot(x, y, dir) {
  /*var rotationMatrix = [
    [Math.cos(dir), -Math.sin(dir)],
    [Math.sin(dir), Math.cos(dir)]
  ]*/
  return [Math.cos(dir)*x - Math.sin(dir)*y, Math.sin(dir)*x + Math.cos(dir)*y]
}

var randColor = (function() {
  var i = 0
  return function() {
    i++
    var rM = (i%3==0?1:0)
    var gM = (i%3==1?1:0)
    var bM = (i%3==2?1:0)
    var solidM = 15
    var solidD = 150
    var deltaM = 100
    var deltaD = 100
    var r = solidM + Math.random()*solidD + deltaM*rM+Math.random()*deltaD*rM
    var g = solidM + Math.random()*solidD + deltaM*gM+Math.random()*deltaD*gM
    var b = solidM + Math.random()*solidD + deltaM*bM+Math.random()*deltaD*bM
    return new Color().rgb(r,g,b)
  }
})()


function getGradient(ctx, x, y, size, color ) {

  var grad = ctx.createRadialGradient(x, y, 1, x, y, size)

  grad.addColorStop(0, color.alpha(0).rgbaString())
  grad.addColorStop(.4, color.alpha(1).rgbaString())
  grad.addColorStop(1, color.alpha(0).rgbaString())
  return grad
}

function dirTowards(to, from) {
  return Math.atan2(to.y-from.y, to.x-from.x)
}


function outSize(enemy, x,y,w,h) {
  if (enemy.x - enemy.size < x || enemy.x + enemy.size > w+100 ||
        enemy.y - enemy.size < y || enemy.y + enemy.size > h+100) {
      return true
    }
  return false
}

function collide(a, b) {
  return distance(a, b) <= a.size + b.size
}

function distance(a, b) {
  return Math.sqrt(Math.pow(a.x-b.x, 2) + Math.pow(a.y - b.y, 2))
}
