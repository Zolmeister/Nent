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
  inputRot: [],
  inputX: [],
  inputY: [],
  bullets: [],
  enemies: [],
  gold: (function(){
    var gld = 0
    return function(v) {
      if(v == null) return gld
      gld = v
      GAME.$gold.text('btc: '+gld)
      for(var key in GAME.upgrades) {
        var upgrade = GAME.upgrades[key]
        if(gld >= upgrade.costs[upgrade.level] && !upgrade.active) {
          // highlight DOM node
          $('.shop div[data-item=' + key +']').addClass('available')
          upgrade.active = true
        } else if (gld < upgrade.costs[upgrade.level] && upgrade.active) {
          // un-highlight DOM node
          $('.shop div[data-item=' + key +']').removeClass('available')
          upgrade.active = false
        }
      }
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
  })(),
  upgrades: {
    speed: {
      level: 0,
      costs: [50, 100, 200, 300, 500],
      action: function() {
        GAME.player.upgrade('speed')
      },
        active: false
    },
    rate: {
      level: 0,
      costs: [100, 200, 400, 800, 1600],
      action: function() {
        GAME.player.upgrade('rate')
      },
        active: false
    },
    damage: {
      level: 0,
      costs: [125, 175, 250, 500, 800],
      action: function() {
        GAME.player.upgrade('damage')
      },
        active: false
    },
    gun: {
      level: 0,
      costs: [500, 1000],
      action: function() {
        GAME.player.upgrade('gun')
      },
        active: false
    }
  },
  highScore: 0
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
  GAME.$hud = $('.hud')
  GAME.$hud.width(GAME.w)
  GAME.$hud.height(GAME.h)
  GAME.$gold = GAME.$hud.find('.gold')
  GAME.$time = GAME.$hud.find('.time')

  // initialize canvas for WebGL rendering (GLSL shaders)
  GAME.outCanv = document.getElementById('canv')
  GAME.outCanv.width = GAME.w
  GAME.outCanv.height = GAME.h
  GAME.outCanv.className = 'main-canv'

  // add initialized DOM nodes to body
  //document.body.appendChild(GAME.outCanv)
  //document.body.appendChild(GAME.hud)

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

  // initialize audio
  var music = new Audio()
  music.src='/music/ld48.ogg'
  music.loop = true
  music.volume = 0.6
  var muted = localStorage.muted === 'false' ? false : true

  if(!muted) {
    music.play()
    $('.audio-toggle').text('mute')
  } else {
    $('.audio-toggle').text('un-mute')
  }

  //initialize high score
  GAME.highScore = parseInt(localStorage.highScore, 10)
  showHighScore()

  // UI bindings
  $('.start-button').on('click', newGame)

  $('.audio-toggle').on('click', function(){
    muted = !muted
    localStorage.muted = muted
    if(muted) {
      music.pause()
      this.textContent = 'un-mute'
    } else {
      music.play()
      this.textContent = 'mute'
    }
  })

  // upgrades
  $('.shop .item').on('click', function(){

    var item = $(this)
    var upgrade = GAME.upgrades[item.data('item')]
    var level = upgrade.level

    if(level >= upgrade.costs.length) return

    var cost = upgrade.costs[level]

    // debug
    if(GAME.gold() >= cost){
      console.log('upgrading', item.data('item'))
      GAME.gold(GAME.gold() - cost)
      upgrade.action()
      upgrade.level++

      if(upgrade.level >= upgrade.costs.length) {
        $(this).find('.item-cost').text('Max')
      } else {
        $(this).find('.item-cost').text(upgrade.costs[upgrade.level]+' btc')
      }

    }

  })

  if(debug) {
    //newGame()
  }
}

function showHighScore() {
  if(!isNaN(GAME.highScore)) {
    $('.high-score').text('Best: '+GAME.highScore)
    $('.high-score').show()
  }
}

function pause() {
  // TODO: add pause menu
  GAME.glsl.stop()
  $('.overlay').fadeIn()
  GAME.$hud.fadeOut()

  if(!isNaN(GAME.highScore)) {
    GAME.highScore = Math.max(GAME.highScore, GAME.gold())
  } else {
    GAME.highScore = GAME.gold()
  }
  localStorage.highScore = GAME.highScore
  showHighScore()
}

function unpause() {
  GAME.glsl.start()
}

function newGame() {
  // hide menu
  $('.overlay').fadeOut()
  GAME.$hud.fadeIn()

  // reset all dynamic variables to default state
  GAME.gold(0)
  GAME.timer = (GAME.glsl._stopTime || 0) + 1000//1000 * 60 // 1 minute in the future
  GAME.bullets = []
  GAME.enemies = []
  GAME.bossMode(false)

  GAME.player = new Player({
    x:GAME.w/2, y:GAME.h/2, size:25, rot:.1, weapon: 0, speed: 2
  })

  GAME.spawner = new Spawner()

  unpause()
}

$(init)
