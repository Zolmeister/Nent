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
  gold: (function(){
    var gld = 0
    return function(v) {
      if(v == null) return gld
      gld = v
      GAME.$gold.textContent = 'btc: '+gld
      return gld
    }
  })()
  // gold: 0,
  // timer: 0
}

function init() {
  // add canvas
  GAME.canv = document.createElement('canvas')
  //GAME.hud = document.createElement('canvas')
  GAME.w = 700//*2 //window.innerWidth
  GAME.h = 500//*2 //window.innerHeight
  GAME.canv.width = GAME.w
  GAME.canv.height = GAME.h
  //GAME.hud.width = GAME.w
  //GAME.hud.height = GAME.h
  //GAME.hud.className = 'hud'

  GAME.ctx = GAME.canv.getContext('2d')
  GAME.ctx.lineCap = 'round'
  //GAME.hudCtx = GAME.hud.getContext('2d')
  //GAME.hudCtx.fillStyle = '#fff'
  //GAME.hudCtx.font = '16px Monospace'
  GAME.hud = document.createElement('div')
  GAME.hud.style.width = GAME.w+'px'
  GAME.hud.style.height = GAME.h+'px'
  GAME.hud.className = 'hud'
  GAME.$gold = document.createElement('div')
  GAME.$gold.className = 'gold'
  GAME.hud.appendChild(GAME.$gold)
  GAME.$timer = document.createElement('div')
  GAME.$timer.className = 'time'
  GAME.hud.appendChild(GAME.$timer)

  GAME.outCanv = document.createElement('canvas')
  GAME.outCanv.width = GAME.w
  GAME.outCanv.height = GAME.h
  GAME.outCanv.className = 'main-canv'
  //GAME.outCtx = GAME.outCanv.getContext('2d')
  document.body.appendChild(GAME.outCanv)
  document.body.appendChild(GAME.hud)
  //document.body.appendChild(GAME.canv)

  GAME.gold(0)
  GAME.timer = 1000 * 60 // 1 minute in the future

  GAME.player = new Player({
    x:GAME.w/2, y:GAME.h/2, size:25, rot:.1, weapon: 0, speed: 5
  })

  GAME.spawner = new Spawner()

  if (!Glsl.supported()) alert("WebGL is not supported.")

  GAME.glsl = Glsl({
    canvas: GAME.outCanv,
    fragment: $('#fragment').text(),
    variables: {
      time: 0,
      canv: GAME.canv
    },
    update: function(time, delta) {
      this.set('time', time)
      animate(time)
      this.sync('canv')
    }
  }).start()
}

$(init)
