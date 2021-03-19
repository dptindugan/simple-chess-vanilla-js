let container = document.querySelector('.container')
let row = [];
let column = [];
let posiblemoves;
const whites = {
    king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙',
}
const black = {
    king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟︎',
}

const BoardSquareNum = 120;
