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
      square.appendChild(piece);
      square.addEventListener('click', selectPiece)
    }
    board.appendChild(square);
  })
});

function renderPiece(rowIndex, colIndex) {
  const initialRowPositions = [0, 1, 6, 7]
  if(initialRowPositions.includes(rowIndex)){

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

    if(rowIndex === 0) {
      piece.innerHTML = blackPieces[colIndex]
      piece.setAttribute('data-piece', 'blackPieces[colIndex]')
    }

    if(rowIndex === 1) {
      piece.innerHTML = black.pawn;
      piece.setAttribute('data-piece', black.pawn);
    }

    if(rowIndex === 7) {
      piece.innerHTML = whitePieces[colIndex]
      piece.setAttribute('data-piece', whitePieces[colIndex]);
    }

    if(rowIndex === 6) {
      piece.innerHTML = whites.pawn
      piece.setAttribute('data-piece', whites.pawn);
    }

    piece.setAttribute('id', `r${rowIndex}_c${colIndex}`);

    return piece;
  }

  return null
}

let removeListener;



function possibleMoves(piece, position) {
  const pieceType = piece.getAttribute("data-piece");

  if(pieceType == whites.pawn) {
    const row = position.split('_')[0]
    const col = position.split('_')[1]
    
    // check if pawn is from starting
    if(row == 'r6') {
      for(let x = 1; x <= 2; x++) {
        const square = document.querySelector(`[data-index='r${6 - x}_${col}']`);
        const highlight = document.createElement('div');
        highlight.classList.add('highlight')

        square.appendChild(highlight)
        square.addEventListener('click', (e) => movePiece(e, piece));
      }
    } else {
      const square = document.querySelector(`[data-index='r${row[1] - 1}_${col}']`);
      const highlight = document.createElement('div');
      highlight.classList.add('highlight')

      square.appendChild(highlight)
      square.addEventListener('click', (e) => movePiece(e, piece));
    }
  }

  if(piece == whites.rook) {

  }

  if(piece == whites.bishop) {

  }

  if(piece == whites.king) {

  } 

  if(piece == whites.queen) {

  }
  
  if(piece == black.pawn) {

  }

  if(piece == black.rook) {

  }

  if(piece == black.bishop) {

  }

  if(piece == black.king) {

  } 

  if(piece == black.queen) {

  }
  
}

function movePiece(e, piece) {
  const square = e.currentTarget;

  const dataIndex = square.getAttribute('data-index');

  console.log('movepeice',dataIndex)
  piece.style = {}
  piece.setAttribute('id', dataIndex)
  square.appendChild(piece);

  const squares = document.querySelectorAll('[data-index]');

  squares.forEach((sq) => {
    sq.style = {};
    if (sq.childNodes[0] && sq.childNodes[0].getAttribute("class") == 'highlight'){
      sq.removeChild(sq.childNodes[0])
      sq.removeEventListener('click', (e) => movePiece(e, piece));
    }
  })

  removeListener();
  square.addEventListener('click', selectPiece);
}

function selectPiece(evnt) {

  console.log(evnt.currentTarget)

  const square = evnt.currentTarget

  const position = evnt.currentTarget.getAttribute("data-index");
  
  const piece = document.querySelector(`#${position}`);

  possibleMoves(piece, position)

  function mouseMoveHandler(e) {
    grabPiece(e, square)
  }

  removeListener = () => document.removeEventListener('mousemove', mouseMoveHandler)

  document.addEventListener('mousemove', mouseMoveHandler);

  document.addEventListener('keydown', function releasePiece(e) {
    if(e.key === "Escape") {
      document.removeEventListener('keydown', releasePiece);
      document.removeEventListener('mousemove', mouseMoveHandler);
      piece.style = {}

      const squares = document.querySelectorAll('[data-index]')

      squares.forEach((sq) => {
        sq.style = {};
        if (sq.childNodes[0] && sq.childNodes[0].getAttribute("class") == 'highlight'){
          sq.removeChild(sq.childNodes[0])
          sq.removeEventListener('click', (e) => movePiece(e, piece));
        }
      })

      square.addEventListener('click', selectPiece);
    }
  })

  function grabPiece(e, square) {
    square.removeEventListener('click', selectPiece)
    piece.style.position = 'absolute';
    piece.style.cursor = 'move'
    piece.style.cursor = 'grab'
    piece.style['pointer-events'] = 'none'
    piece.style.left = `${e.pageX - 50}px`
    piece.style.top = `${e.pageY - 50}px`
  }
}