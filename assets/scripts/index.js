// let container = document.querySelector('.container')
let board = document.querySelector('#board')
let rows = new Array(8).fill('r');
let column = new Array(8).fill('c');
let posiblemoves;
const whites = {
    king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙',
}
const black = {
    king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟︎',
}

let SELECTED_PIECE = null;
let STARTING_SQR = null;
let CAPTURED_PIECES = [];
let PLAYER_TURN = 'white';
let isEnPassant = false;
let enPassantTarget = null;

function renderPiece(rowIndex, colIndex) {

  /* initial definition array  
    0 -> represents black special pieces starting row
    1 -> represents black pawns starting row
    6 -> represents white pawns starting row
    7 -> represents white special pieces starting row
  */

  const initialRowPositions = [0, 1, 6, 7]
  if(initialRowPositions.includes(rowIndex)){

  // create a piece element, this will be move between squares
  const piece = document.createElement('span');
    piece.classList.add('piece')
    const blackPieces = {
      0: black.rook, 
      1: black.knight,
      2: black.bishop, 
      3: black.queen,
      4: black.king, 
      5: black.bishop, 
      6: black.knight,
      7: black.rook, 
    }

    const whitePieces = {
      0: whites.rook, 
      1: whites.knight,
      2: whites.bishop, 
      3: whites.queen,
      4: whites.king, 
      5: whites.bishop, 
      6: whites.knight,
      7: whites.rook, 
    }

    // check which piece will go to certain squares
    if(rowIndex === 0) {
      piece.innerHTML = blackPieces[colIndex]
      piece.setAttribute('data-color', 'black')
      piece.setAttribute('data-piece', blackPieces[colIndex])
    }

    if(rowIndex === 1) {
      piece.innerHTML = black.pawn;
      piece.setAttribute('data-color', 'black')
      piece.setAttribute('data-piece', black.pawn);
    }

    if(rowIndex === 7) {
      piece.innerHTML = whitePieces[colIndex]
      piece.setAttribute('data-color', 'white')
      piece.setAttribute('data-piece', whitePieces[colIndex]);
    }

    if(rowIndex === 6) {
      piece.innerHTML = whites.pawn
      piece.setAttribute('data-color', 'white')
      piece.setAttribute('data-piece', whites.pawn);
    }

    piece.setAttribute('id', `r${rowIndex}_c${colIndex}`);

    return piece;
  }

  return null
}


function initGame() {
  rows.forEach((row, rowIndex)=> {
    column.forEach((col, colIndex) => {
      
      const piece = renderPiece(rowIndex, colIndex);
      const color = () => {
        if(rowIndex % 2 === 0) {
          return colIndex % 2 === 0 ? 'white' : 'black';
        }
        return colIndex % 2 === 0 ? 'black' : 'white';
      }
      const square = document.createElement('div');
      
      square.setAttribute('data-index', `${row}${rowIndex}_${col}${colIndex}`);
      square.classList.add('cell');
      square.classList.add(color());
      if(piece) {
        
        const pieceColor = piece.getAttribute('data-color')
        square.appendChild(piece);
        if(pieceColor === PLAYER_TURN) {
          square.addEventListener('click', selectPiece)
        }
      }
      board.appendChild(square);
    })
  });
}

// function to help for checkubg pieceType and check possible moves to delete
function possibleMoves(piece, position) {
  const pieceType = piece.getAttribute("data-piece");
  const pieceColor = piece.getAttribute("data-color");
  const row = position.split('_')[0]
  const col = position.split('_')[1]

  if(pieceType == whites.pawn || pieceType == black.pawn) {
    PawnPossibleMoves(row, col);
  }

  if(pieceType == whites.rook || pieceType == black.rook) {
    straightMove(row, col, pieceType, pieceColor);
  }

  if(pieceType == whites.bishop || pieceType == black.bishop) {
    diagonalMove(row, col, pieceType, pieceColor);
  }

  if(pieceType == whites.king || pieceType == black.king) {
    straightMove(row, col, pieceType, pieceColor);
    diagonalMove(row, col, pieceType, pieceColor);
  } 

  if(pieceType == whites.queen || pieceType == black.queen) {
    straightMove(row, col, pieceType, pieceColor);
    diagonalMove(row, col, pieceType, pieceColor);
  }

  if(pieceType == whites.knight || pieceType == black.knight) {
    knightMove(row, col)
  }
}

function selectPiece(e) {
  const square = e.currentTarget;

  const position = square.getAttribute('data-index');
  const piece = document.querySelector(`#${position}`);

  possibleMoves(piece, position)

  STARTING_SQR = square;
  SELECTED_PIECE = piece;

  document.addEventListener('mousemove', movePiece);
}

function movePiece(e) {
  const squares = document.querySelectorAll('[data-index]');
  squares.forEach((sq) => {
    sq.removeAttribute("style");
    if (sq.childNodes[0] && sq.childNodes[0].getAttribute("class") == 'piece'){
      sq.removeEventListener('click', selectPiece);
    }
  })
  SELECTED_PIECE.style.position = 'absolute';
  SELECTED_PIECE.style.cursor = 'move'
  SELECTED_PIECE.style.cursor = 'grabbing'
  SELECTED_PIECE.style['pointer-events'] = 'none'
  SELECTED_PIECE.style.left = `${e.pageX - 25}px`
  SELECTED_PIECE.style.top = `${e.pageY - 25}px`
}

function wouldEnPassant(targetSquare, startingRow) {
  const position = targetSquare.getAttribute('data-index');
  const row = position.split('_')[0];
  const col = position.split('_')[1];

  const leftSquare = document.querySelector(`[data-index=${row}_c${parseInt(col[1]) - 1}]`);
  const rightSquare = document.querySelector(`[data-index=${row}_c${parseInt(col[1]) + 1}]`);
  if(startingRow == 'r1' || startingRow == 'r6') {
    // check if there's an adjacent piece to target square;
    if(leftSquare?.childNodes[0]) {
      const pieceOnLeft = leftSquare.childNodes[0];
      const pieceType = pieceOnLeft.getAttribute('data-piece');
      const pieceOnLeftColor = pieceOnLeft.getAttribute('data-color');
      const pawnPiece = [whites.pawn, black.pawn]

      if(pawnPiece.includes(pieceType) && pieceOnLeftColor !== PLAYER_TURN) {
        isEnPassant = true;
      }
    }

    if(rightSquare?.childNodes[0]) {
      const pieceOnRight = rightSquare.childNodes[0];
      const pieceType = pieceOnRight.getAttribute('data-piece');
      const pieceOnRightColor = pieceOnRight.getAttribute('data-color');
      const pawnPiece = [whites.pawn, black.pawn]

      if(pawnPiece.includes(pieceType) && pieceOnRightColor !== PLAYER_TURN) {
        isEnPassant = true;
      }
    }
  }
}

function dropPiece(e) {
  const targetSquare = e.currentTarget;

  capturePiece(targetSquare, SELECTED_PIECE);
  const pieceData = SELECTED_PIECE.getAttribute('data-piece');
  const startingPostiion = SELECTED_PIECE.getAttribute('id');
  const startingRow = startingPostiion.split('_')[0];

  if(pieceData == whites.pawn || pieceData == black.pawn) {
    promotePawn(targetSquare, SELECTED_PIECE);
    wouldEnPassant(targetSquare, startingRow)
  }

  targetSquare.appendChild(SELECTED_PIECE);
  const position = targetSquare.getAttribute('data-index');
  targetSquare.removeEventListener('click', dropPiece);

  SELECTED_PIECE.removeAttribute("style");
  SELECTED_PIECE.setAttribute('id', position);
  document.removeEventListener('mousemove', movePiece);

  const squares = document.querySelectorAll('[data-index]');

  switchTurn();

  squares.forEach((sq) => {
    sq.removeAttribute("style");
    if (sq.childNodes[0] && sq.childNodes[0].getAttribute("class") == 'highlight'){
      sq.removeChild(sq.childNodes[0])
      sq.removeEventListener('click', selectPiece);
    }
    if (sq.childNodes[0] && sq.childNodes[0].getAttribute("class") == 'piece'){
      if(sq.childNodes[0].getAttribute("data-color") === PLAYER_TURN) {
        sq.addEventListener('click', selectPiece)
      }
    }
  })

  SELECTED_PIECE = null;
}

function capturePiece(targetSquare, newPiece) {
  const piece = targetSquare.childNodes[0];

  if(isEnPassant && enPassantTarget) {
    CAPTURED_PIECES.push(piece.getAttribute('data-piece'));
    enPassantTarget.removeChild(enPassantTarget.childNodes[0]);

    isEnPassant = false;
    enPassantTarget = null;
  }

  const attribute = targetSquare.childNodes[0].getAttribute('class');
  if(attribute == 'piece') {
    CAPTURED_PIECES.push(piece.getAttribute('data-piece'))
    targetSquare.replaceChild(newPiece, piece);
  }
}

function promotePawn(targetSquare, piece) {
  const position = targetSquare.getAttribute('data-index');
  const row = position.split('_')[0];
  
  if(row == 'r0' || row == 'r7') {
    console.log('pawn ready for promotion');
  }
}

function switchTurn() {
  const prevPlayer = PLAYER_TURN;
  const newPlayer = prevPlayer == 'white' ? 'black' : 'white';
  PLAYER_TURN = newPlayer
}

function PawnPossibleMoves(row, col) {
  const direction = (x, num = row[1]) => (PLAYER_TURN == 'white' ? parseInt(num) - x : parseInt(num) + x);
  
  // check if pawn is from starting row
  // if from starting row, add ability for pawn to moves 2 squares
  if(row == 'r6' || row == 'r1') {
    const leftDiagSqr = getTargetSquare(direction(1), col[1] - 1);
    const rightDiagSqr = getTargetSquare(direction(1), parseInt(col[1]) + 1);

    if(leftDiagSqr?.childNodes[0]) {
      highlightPossibleSquare(leftDiagSqr)
    }

    if(rightDiagSqr?.childNodes[0]) {
      highlightPossibleSquare(rightDiagSqr)
    }

    const startingRow = PLAYER_TURN === 'white' ? 6 : 1;

    for(let x = 1; x <= 2; x++) {
      const square = getTargetSquare(direction(x, startingRow), col[1]);

      if(!square.childNodes[0]) {
        highlightPossibleSquare(square)
      }
    }
  } else {
    const square = getTargetSquare(direction(1), col[1]);

    const leftDiagSqr = getTargetSquare(direction(1), col[1] - 1);
    const rightDiagSqr = getTargetSquare(direction(1), parseInt(col[1]) + 1);
    const left = getTargetSquare(row[1], col[1] - 1);
    const right = getTargetSquare(row[1], parseInt(col[1]) + 1);

    if(leftDiagSqr?.childNodes[0] || (left?.childNodes[0] && isEnPassant) ) {
      highlightPossibleSquare(leftDiagSqr)
      enPassantTarget = left;
    }
    
    if(rightDiagSqr?.childNodes[0] || (right?.childNodes[0] && isEnPassant)) {
      highlightPossibleSquare(rightDiagSqr);
      enPassantTarget = right;
    }

    if(!square.childNodes[0]) {
      highlightPossibleSquare(square)
    }
  }
}

// function helper to highlight possible moves and 
// add click listener to drop piece on that square
function highlightPossibleSquare(square) {
  const highlight = document.createElement('div');
  highlight.classList.add('highlight');

  square.appendChild(highlight)
  square.addEventListener('click', dropPiece);
}

// NOTE: break -> forcibly stops the loop;
function diagonalMove(row, col, piece, color) {
  let cUpRight = parseInt(col[1]) + 1;
  let cUpLeft = parseInt(col[1]) - 1;
  let cRight = parseInt(col[1]) + 1;
  let cLeft = parseInt(col[1]) - 1;

  if(piece == whites.king || 
    piece == black.king) {
      const upperLeftSqr = getTargetSquare(row[1] - 1, cUpLeft);
      const upperRightSqr = getTargetSquare(row[1] - 1, cUpRight);
      const lowerLeftSqr = getTargetSquare(parseInt(row[1]) + 1, cLeft);
      const lowerRightSqr = getTargetSquare(parseInt(row[1]) + 1, cRight);

      if(upperLeftSqr && wouldCapture(upperLeftSqr)) {
        highlightPossibleSquare(upperLeftSqr)
      }

      if(upperRightSqr && wouldCapture(upperRightSqr)) {
        highlightPossibleSquare(upperRightSqr)
      }

      if(lowerLeftSqr && wouldCapture(lowerLeftSqr)) {
        highlightPossibleSquare(lowerLeftSqr)
      }

      if(lowerRightSqr && wouldCapture(lowerRightSqr)) {
        highlightPossibleSquare(lowerRightSqr)
      }
    }
  else {
    for(let r = row[1] - 1; r >= 0; r--) {
      const upperLeftSqr = getTargetSquare(r, cUpLeft);

      if(upperLeftSqr && isBlocked(color, upperLeftSqr)) {
        if(upperLeftSqr && wouldCapture(upperLeftSqr)) {
          highlightPossibleSquare(upperLeftSqr)
        }
        // if piece is blocked by a piece break/stop the loop;
        break;
      }

      if(upperLeftSqr && wouldCapture(upperLeftSqr)) {
        highlightPossibleSquare(upperLeftSqr)
      }

      cUpLeft--
    }

    for(let r = row[1] - 1; r >= 0; r--) {
      const upperRightSqr = getTargetSquare(r, cUpRight);
      if(upperRightSqr && isBlocked(color, upperRightSqr)) {
        if(upperRightSqr && wouldCapture(upperRightSqr)) {
          highlightPossibleSquare(upperRightSqr)
        }
        break;
      }

      if(upperRightSqr && wouldCapture(upperRightSqr)) {
        highlightPossibleSquare(upperRightSqr)
      }

      cUpRight++
    }

    // ======= lower side of origin square =======
    for(let r = parseInt(row[1]) + 1; r <= 7; r++) {
      const lowerLeftSqr = getTargetSquare(r, cLeft);

      if(lowerLeftSqr && isBlocked(color, lowerLeftSqr)) {
        if(lowerLeftSqr && wouldCapture(lowerLeftSqr)) {
          highlightPossibleSquare(lowerLeftSqr)
        }
        break;
      }

      if(lowerLeftSqr && wouldCapture(lowerLeftSqr)) {
        highlightPossibleSquare(lowerLeftSqr)
      }

      cLeft--
    }

    for(let r = parseInt(row[1]) + 1; r <= 7; r++) {
      const lowerRightSqr = getTargetSquare(r, cRight);
      if(lowerRightSqr && isBlocked(color, lowerRightSqr)) {
        if(lowerRightSqr && wouldCapture(lowerRightSqr)) {
          highlightPossibleSquare(lowerRightSqr)
        }
        break;
      }

      if(lowerRightSqr && wouldCapture(lowerRightSqr)) {
        highlightPossibleSquare(lowerRightSqr)
      }

      cRight++
    }
  }
}

function straightMove(row, col, piece, color) {
  if(piece == whites.king || 
    piece == black.king) {
      const upperSquare = getTargetSquare(row[1] - 1, col[1]);

      if(upperSquare && wouldCapture(upperSquare)) {
        highlightPossibleSquare(upperSquare)
      }
      const lowerSquare = getTargetSquare(parseInt(row[1]) + 1, col[1]);
  
      if(lowerSquare && wouldCapture(lowerSquare)) {
        highlightPossibleSquare(lowerSquare)
      }
      const left = getTargetSquare(row[1], col[1] - 1);
  
      if(left && wouldCapture(left)) {
        highlightPossibleSquare(left)
      }
      const right = getTargetSquare(row[1], parseInt(col[1]) + 1);
  
      if(right && wouldCapture(right)) {
        highlightPossibleSquare(right)
      }
    }
  else {
    for(let r = row[1] - 1; r >= 0; r--) {
      const upperSquare = getTargetSquare(r, col[1]);

      if(isBlocked(color, upperSquare)) {
        if(wouldCapture(upperSquare)) {
          highlightPossibleSquare(upperSquare)
        }
        break;
      }

      if(upperSquare) {
        highlightPossibleSquare(upperSquare)
      }
    }

    for(let r = parseInt(row[1]) + 1; r <= 7; r++) {
      const lowerSquare = getTargetSquare(r, col[1]);

      if(isBlocked(color, lowerSquare)) {
        if(wouldCapture(lowerSquare)) {
          highlightPossibleSquare(lowerSquare)
        }
        break;
      }

      if(lowerSquare) {
        highlightPossibleSquare(lowerSquare)
      }
    }

    for(let c = col[1] - 1; c >= 0; c--) {
      const left = getTargetSquare(row[1], c);

      if(isBlocked(color, left)) {
        if(wouldCapture(left)) {
          highlightPossibleSquare(left)
        }
        break;
      }

      if(left) {
        highlightPossibleSquare(left)
      }
    }

    for(let c = parseInt(col[1]) + 1; c <= 7; c++) {
      const right = getTargetSquare(row[1], c);

      if(isBlocked(color, right)) {
        if(wouldCapture(right)) {
          highlightPossibleSquare(right)
        }
        break;
      }

      if(right) {
        highlightPossibleSquare(right)
      }
    }
  }
}

function knightMove(row, col) {
  const r = parseInt(row[1]);
  const c = parseInt(col[1]);
  const upperRightSqr = getTargetSquare(r + 2, c + 1);
  const upperLeftSqr = getTargetSquare(r + 2, c - 1);
  const lowerRightSqr = getTargetSquare(r - 2, c + 1);
  const lowerLeftSqr = getTargetSquare(r - 2, c - 1);

  const upperRightSqr2 = getTargetSquare(r + 1, c + 2);
  const upperLeftSqr2 = getTargetSquare(r + 1, c - 2);
  const lowerRightSqr2 = getTargetSquare(r - 1, c + 2);
  const lowerLeftSqr2 = getTargetSquare(r - 1, c - 2);

  if(upperRightSqr && wouldCapture(upperRightSqr)) highlightPossibleSquare(upperRightSqr);
  if(upperLeftSqr && wouldCapture(upperLeftSqr)) highlightPossibleSquare(upperLeftSqr);
  if(lowerRightSqr && wouldCapture(lowerRightSqr)) highlightPossibleSquare(lowerRightSqr);
  if(lowerLeftSqr && wouldCapture(lowerLeftSqr)) highlightPossibleSquare(lowerLeftSqr);

  if(upperRightSqr2 && wouldCapture(upperRightSqr2)) highlightPossibleSquare(upperRightSqr2);
  if(upperLeftSqr2 && wouldCapture(upperLeftSqr2)) highlightPossibleSquare(upperLeftSqr2);
  if(lowerRightSqr2 && wouldCapture(lowerRightSqr2)) highlightPossibleSquare(lowerRightSqr2);
  if(lowerLeftSqr2 && wouldCapture(lowerLeftSqr2)) highlightPossibleSquare(lowerLeftSqr2);
}

// checker if a piece can capture a piece 
// check if piece color of target piece if opposite of player can capture
function wouldCapture(targetSquare) {
  if(targetSquare.childNodes[0]) {
    return targetSquare.childNodes[0].getAttribute('data-color') !== PLAYER_TURN;
  }
  console.log('would capture')

  return !targetSquare.childNodes[0]
}

function getTargetSquare(row, col) {
  return document.querySelector(`[data-index='r${row}_c${col}']`);
}

// checker if a piece path is blocked by another piece
// to prevent SELECTED_PIECE from jumping behind pieces
function isBlocked(color, targetSquare) {
  let targetColor;
  if(targetSquare.childNodes[0]) {
    targetColor = targetSquare.childNodes[0].getAttribute('data-color');
  }

  if(color == targetColor || targetSquare.childNodes[0]?.getAttribute('class') === 'piece') {
    return true
  }
  return false
}

initGame();