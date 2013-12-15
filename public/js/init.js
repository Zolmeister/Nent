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
  })(),
  timer: 0,
  bossMode: (function() {
    var mode = false
    return function(v) {
      if (v == null) return mode
      mode = v
      if(mode) {
        GAME.spawner.enableBossMode()
      }
    }
  })()
}

function init() {

  // viewport size
  GAME.w = 700
  GAME.h = 500

  // add main hidden canvas for rendering (until I can move everything into a shader...)
  GAME.canv = document.createElement('canvas')
  GAME.canv.width = GAME.w
  GAME.canv.height = GAME.h

  GAME.ctx = GAME.canv.getContext('2d')
  GAME.ctx.lineCap = 'round'

  // initialize head-up display
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


  // initialize canvas for WebGL rendering (GLSL shaders)
  GAME.outCanv = document.createElement('canvas')
  GAME.outCanv.width = GAME.w
  GAME.outCanv.height = GAME.h
  GAME.outCanv.className = 'main-canv'

  // add initialized DOM nodes to body
  document.body.appendChild(GAME.outCanv)
  document.body.appendChild(GAME.hud)

  if (!Glsl.supported()) alert("WebGL is not supported.")

  // initialize GLSL renderer, in a paused state
  GAME.glsl = Glsl({
    canvas: GAME.outCanv,
    fragment: $('#fragment').text(),
    variables: {
      canv: GAME.canv
    },
    update: function(time, delta) {
      if(time === 0) return

      animate(time)
      this.sync('canv')
    }
  })

  // UI bindings
  $('.start-button').on('click', newGame)
}

function pause() {
  // TODO: add pause menu
  GAME.glsl.stop()
}

function unpause() {
  GAME.glsl.start()
}

function newGame() {
  // hide menu
  $('.overlay').hide()

  // reset all dynamic variables to default state
  GAME.gold(0)
  GAME.timer = 1000 //1000 * 60 // 1 minute in the future
  GAME.bullets = []
  GAME.enemies = []

  GAME.player = new Player({
    x:GAME.w/2, y:GAME.h/2, size:25, rot:.1, weapon: 0, speed: 5
  })

  GAME.spawner = new Spawner()

  unpause()
}

$(init)
