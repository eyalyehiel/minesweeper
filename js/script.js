'use strict'

var gLevel
var gBoard
var gGame
var gFirstClick
var gTimeInterval
var gTime


function initGame() {

    gLevel = { SIZE: 4, MINES: 2 }
    gBoard = buildBoard()
    console.table(gBoard)
    gFirstClick = true
    gTime = 0
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
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


    // for (var i = 0; i < gLevel.MINES; i++) {
    //     var pos = getRandomPos(board)
    //     board[pos.i][pos.j].isMine = true
    //     board[pos.i][pos.j].isShown = true
    // }

    // for (var i = 0; i < gLevel.SIZE; i++) {
    //     for (var j = 0; j < gLevel.SIZE; j++) {
    //         board[i][j].minesAroundCount = setMinesNegsCount(board, i, j)
    //     }

    // }

    return board

}

function updateMinesNegsCount(board) {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j].minesAroundCount = setMinesNegsCount(board, i, j)
        }

    }
}

function setMines(board,i,j) {
    var mineCount = gLevel.MINES

    while(mineCount > 0) {
        var pos = getRandomPos(board)
        if(pos.i === i  && pos.j === j) break
        board[pos.i][pos.j].isMine = true
        board[pos.i][pos.j].isShown = true
        mineCount--
    }

    // for (var x = 0; x < gLevel.MINES; x++) {

    //     board[pos.i][pos.j].isMine = true
    //     board[pos.i][pos.j].isShown = true
    // }
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

    if (gFirstClick) {
        gFirstClick = false
        setMines(gBoard, i, j)
        updateMinesNegsCount(gBoard)
        gTimeInterval = setInterval(startTimer, 10)
    }

    if (gBoard[i][j].isMine) {
        revealAllMines()
        // elCell.classList.remove('cell')
        elCell.classList.add('mine')
        checkGameOver(true)
        return
    }

    if(gBoard[i][j].minesAroundCount > 0) {
        gBoard[i][j].isShown = true
        elCell.classList.remove('cell')
        elCell.classList.remove('flag')
        elCell.classList.add('clickedCell')
        elCell.innerText = gBoard[i][j].minesAroundCount ? gBoard[i][j].minesAroundCount : ''
    } else {
        expandShown(i, j)
    }

    checkGameOver(false)

}

// marking a cell
function cellMarked(elCell, i, j) {
    // elCell.classList.remove('cell')
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
function checkGameOver(isLost) {
    if (isLost) {
        gGame.isOn = false
        console.log('You lost')
        clearInterval(gTimeInterval)
    }
    if (gGame.markedCount === gLevel.MINES &&
        gGame.shownCount === gLevel.SIZE * gLevel.SIZE - gLevel.MINES) {
        clearInterval(gTimeInterval)
        console.log('You won')
    }
}
//when cell is clicked show his negs that are not mines
function expandShown(rowIdx, colIdx) {

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            // if (i === rowIdx && j === colIdx) continue
            var currCell = gBoard[i][j]

            if (!currCell.isMine && !currCell.isShown && !currCell.isMarked) {
                var elCurrCell = document.querySelector(`.c${i}-${j}`)
                currCell.isShown = true
                elCurrCell.classList.remove('cell')
                // elCurrCell.classList.remove('flag')
                elCurrCell.classList.add('clickedCell')
                gGame.shownCount++
                elCurrCell.innerText = gBoard[i][j].minesAroundCount ? gBoard[i][j].minesAroundCount : ''
            }
        }
    }
}
// changes the difficulty of the game
function changeDifficulty(size, mines) {

    gLevel = { SIZE: size, MINES: mines }
    gBoard = buildBoard()
    console.table(gBoard)
    gFirstClick = true
    clearInterval(gTimeInterval)
    gTime = 0
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
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


function startTimer() {
    var elTimeSpan = document.querySelector('.time')
    gTime++
    elTimeSpan.innerHTML = gTime / 100
}
