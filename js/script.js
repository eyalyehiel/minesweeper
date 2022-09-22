'use strict'

var gLevel
var gBoard
var gGame
var gFirstClick
var gTimerInterval


function initGame() {

    gLevel = { SIZE: 4, MINES: 2 }
    gBoard = buildBoard()
    console.table(gBoard)
    gFirstClick = true

    gGame = {
        isOn: true,
        lives: 3,
        hintMode: false,
        hintCount: 3,
        safeClicks: 3,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }

    var elHintSpan = document.querySelector('.hints-counter')
    elHintSpan.innerText = gGame.hintCount
    var elSafeClickSpan = document.querySelector('.safe-click-counter')
    elSafeClickSpan.innerText = gGame.safeClicks

    renderBoard(gBoard)

}

//building Modal
function buildBoard() {
    var board = []


    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []

        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }

    return board

}

// updates the minesAroundCount
function updateMinesNegsCount(board) {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j].minesAroundCount = setMinesNegsCount(board, i, j)
        }

    }
}

// adding mines to the board
function setMines(i, j) {
    var mineCount = gLevel.MINES
    while (mineCount > 0) {
        var pos = getRandomPos(gBoard)
        if (pos.i === i && pos.j === j) continue
        gBoard[pos.i][pos.j].isMine = true
        // gBoard[pos.i][pos.j].isShown = true
        mineCount--
    }

}

function renderBoard(board) {
    var elTableBody = document.querySelector('tbody')
    var strHTML = ''

    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>\n`

        for (var j = 0; j < board.length; j++) {

            strHTML += `\t<td class="cell c${i}-${j}" onmousedown="WhichButton(event, this, ${i}, ${j})"></td>\n`
        }

        strHTML += `</tr>\n`
    }
    console.log(strHTML);
    elTableBody.innerHTML = strHTML

}


function cellClicked(elCell, i, j) {
    if (!gGame.isOn) return

    if (gFirstClick) {
        gFirstClick = false
        setMines(i, j)
        updateMinesNegsCount(gBoard)
        startTimer()
    }

    if(gBoard[i][j].isMine && gBoard[i][j].isShown) return

    if(gGame.hintMode) {
        if(!gBoard[i][j].isShown) {
            revealCells(i,j)
            setTimeout(revealCells,1000,i,j)
        }
        var elIcon = document.querySelector('.icon-btn')
        elIcon.style.backgroundImage = "url('img/happiness.png')"
        gGame.hintMode = false
        return
    }

    if (gBoard[i][j].isMine) {
        if (gGame.lives > 0) {
            var hearts = document.querySelectorAll('.heart')
            var currHeart = hearts[gGame.lives - 1]
            currHeart.style.backgroundImage = "url('img/heart-lost.png')"
            currHeart.classList.remove('beat')
            gBoard[i][j].isShown = true
            gGame.lives--
            elCell.classList.add('mine')
        }
        if (gGame.lives === 0) {
            revealAllMines()
            checkGameOver(true)
            elCell.classList.add('mine')
            return
        }
        return
    }

    if (gBoard[i][j].minesAroundCount > 0) {
        gBoard[i][j].isShown = true
        elCell.classList.remove('cell')
        elCell.classList.remove('flag')
        elCell.classList.add('clickedCell')
        elCell.innerText = gBoard[i][j].minesAroundCount ? gBoard[i][j].minesAroundCount : ''
        if(gBoard[i][j].minesAroundCount === 1) elCell.style.color = 'blue'
        if(gBoard[i][j].minesAroundCount === 2) elCell.style.color = 'green'
        if(gBoard[i][j].minesAroundCount > 2) elCell.style.color = 'red'
        gGame.shownCount++
    } else {
        expandShown(i, j)
    }

    checkGameOver()

}

// marking a cell
function cellMarked(elCell, i, j) {
    if (!gGame.isOn) return

    elCell.classList.add('flag')
    gBoard[i][j].isMarked = true

    if (gBoard[i][j].isMine) gGame.markedCount++
    checkGameOver()
}


//check minesAroundCount
function setMinesNegsCount(board, rowIdx, colIdx) {
    var minesCount = 0

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (i === rowIdx && j === colIdx) continue

            var currCell = board[i][j]
            if (currCell.isMine) minesCount++
        }
    }
    return minesCount
}

// get random positin in the board
function getRandomPos(board) {
    var emptyCells = []

    for (var i = 0; i < board.length; i++) {

        for (var j = 0; j < board.length; j++) {

            var currCell = board[i][j]
            if (!currCell.isMine) emptyCells.push({ i, j })
        }

    }

    var idx = getRandomInt(0, emptyCells.length)
    return emptyCells[idx]
}

// detect if player clicked right or left button than excute function
function WhichButton(event, elCell, i, j) {

    if (event.button === 0) cellClicked(elCell, i, j)
    else if (event.button === 2) cellMarked(elCell, i, j)

}

//check if the game is done
function checkGameOver() {
    var elIcon = document.querySelector('.icon-btn')

    if (gGame.lives === 0) {
        gGame.isOn = false
        elIcon.style.backgroundImage = "url('img/mind-blown.png')"
        clearInterval(gTimerInterval)
    }
    console.log(gGame.markedCount)
    console.log(gGame.shownCount);
    if (gGame.markedCount === gLevel.MINES &&
        gGame.shownCount === gLevel.SIZE * gLevel.SIZE - gLevel.MINES) {
        clearInterval(gTimerInterval)
        gGame.isOn = false
        console.log('You won')
        elIcon.style.backgroundImage = "url('img/star.png')"
    }
}
//when cell is clicked show his negs that are not mines
function expandShown(rowIdx, colIdx) {

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            var currCell = gBoard[i][j]

            if (!currCell.isMine && !currCell.isShown && !currCell.isMarked) {
                var elCurrCell = document.querySelector(`.c${i}-${j}`)
                currCell.isShown = true
                elCurrCell.classList.remove('cell')
                elCurrCell.classList.add('clickedCell')
                gGame.shownCount++
                elCurrCell.innerText = currCell.minesAroundCount ? currCell.minesAroundCount : ''
                if(currCell.minesAroundCount === 1) elCurrCell.style.color = 'blue'
                if(currCell.minesAroundCount === 2) elCurrCell.style.color = 'green'
                if(currCell.minesAroundCount > 2) elCurrCell.style.color = 'red'

            }
        }
    }
}
// changes the difficulty of the game
function changeDifficulty(size, mines) {
    var elIcon = document.querySelector('.icon-btn')
    elIcon.style.backgroundImage = "url('img/happiness.png')"

    var hearts = document.querySelectorAll('.heart')
    for (var i = 0; i < 3; i++) {
        var currHeart = hearts[i]
        currHeart.style.backgroundImage = "url('img/heart.png')"
        currHeart.classList.add('beat')
    }

    
    gLevel = { SIZE: size, MINES: mines }
    gBoard = buildBoard()
    console.table(gBoard)
    gFirstClick = true
    gGame.hintCount = 3
    clearInterval(gTimerInterval)
    gGame = {
        isOn: true,
        hintMode: false,
        lives: 3,
        hintCount: 3,
        safeClicks: 3,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }

    var elHintSpan = document.querySelector('.hints-counter')
    elHintSpan.innerText = gGame.hintCount
    var elSafeClickSpan = document.querySelector('.safe-click-counter')
    elSafeClickSpan.innerText = gGame.safeClicks
    renderBoard(gBoard)
}

// reavel all mine
function revealAllMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine) {
                var elCurrCell = document.querySelector(`.c${i}-${j}`)
                elCurrCell.classList.add('mine')
            }
        }
    }
}

// get a safe click
function getSafeClick() {
    if(!gGame.isOn) return
    if(gGame.safeClicks === 0) return

    var pos = getEmptyCell(gBoard)
    var elCell = document.querySelector(`.c${pos.i}-${pos.j}`)
    elCell.classList.toggle('mark')
    setTimeout(() => {
        elCell.classList.toggle('mark')

    },3000)
    gGame.safeClicks--

    var elSafeClickSpan = document.querySelector('.safe-click-counter')
    elSafeClickSpan.innerText = gGame.safeClicks
}

// get hint
function getHint() {
    if(!gGame.isOn) return
    if(gGame.hintCount === 0) return

    var elIcon = document.querySelector('.icon-btn')
    elIcon.style.backgroundImage = "url('img/lamp.png')"
    gGame.hintMode = true
    gGame.hintCount-- 
    var elHintSpan = document.querySelector('.hints-counter')
    elHintSpan.innerText = gGame.hintCount

}

// show time 
function startTimer() {
    var elTimeSpan = document.querySelector('.show-time')
    var start = Date.now()

    gTimerInterval = setInterval(function () {
        var currTs = Date.now()

        var secs = parseInt((currTs - start) / 1000)
        var ms = (currTs - start) - secs * 1000
        ms = '000' + ms

        ms = ms.substring(ms.length - 3, ms.length)

        elTimeSpan.innerText = `\n ${secs}:${ms}`
    }, 100)
}
// restart the game
function restartGame() {
    changeDifficulty(gLevel.SIZE, gLevel.MINES)
}

//reveal cell when its hint mode
function revealCells(rowIdx,colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            
            var currCell = gBoard[i][j]
            var elCurrCell = document.querySelector(`.c${i}-${j}`)
                if(currCell.isMine) {
                    elCurrCell.classList.toggle('mine')
                } else if(!currCell.isShown) {
                    elCurrCell.classList.toggle('cell')
                    elCurrCell.classList.toggle('clickedCell')
                    // elCurrCell.innerText = currCell.minesAroundCount ? currCell.minesAroundCount : ''    
                }
        }
    }
}

// get empty cell unrevealed
function getEmptyCell(board) {
    var emptyCells = []

    for (var i = 0; i < board.length; i++) {

        for (var j = 0; j < board.length; j++) {

            var currCell = board[i][j]
            if (!currCell.isShown && !currCell.isMine) emptyCells.push({ i, j })
        }

    }

    var idx = getRandomInt(0, emptyCells.length)
    return emptyCells[idx]
}

document.addEventListener("contextmenu", function (event) { event.preventDefault(); }, false);
