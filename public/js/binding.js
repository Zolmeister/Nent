
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
