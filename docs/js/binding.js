
window.onkeydown = function(e) {
  // TODO: fix this horrible code...
  if(Object.keys(GAME.moveKeys).indexOf(''+e.which) !== -1) {
    var dir = GAME.moveKeys[e.which]

    if(dir[0] && GAME.inputX.indexOf(dir[0]) === -1) {
      GAME.inputX.unshift(dir[0])
    }

    if(dir[1] && GAME.inputY.indexOf(dir[1]) === -1) {
      GAME.inputY.unshift(dir[1])
    }

  } else if (Object.keys(GAME.rotKeys).indexOf(''+e.which) !== -1) {
    if(GAME.inputRot.indexOf(GAME.rotKeys[e.which]) === -1)
      GAME.inputRot.unshift(GAME.rotKeys[e.which])
  }
  //console.log(GAME.inputX, GAME.inputY, GAME.inputRot)
}

window.onkeyup = function(e) {
  if(Object.keys(GAME.moveKeys).indexOf(''+e.which) !== -1) {
    var dir = GAME.moveKeys[e.which]

    if (GAME.inputX.indexOf(dir[0]) !== -1) {
      GAME.inputX.splice(GAME.inputX.indexOf(dir[0]), 1)
    }
    if (GAME.inputY.indexOf(dir[1]) !== -1) {
      GAME.inputY.splice(GAME.inputY.indexOf(dir[1]), 1)
    }

  } else if (Object.keys(GAME.rotKeys).indexOf(''+e.which) !== -1) {
    if (GAME.inputRot.indexOf(GAME.rotKeys[e.which]) !== -1) {
      GAME.inputRot.splice(GAME.inputRot.indexOf(GAME.rotKeys[e.which]), 1)
    }
  }
  //console.log(GAME.inputX, GAME.inputY, GAME.inputRot)

}
