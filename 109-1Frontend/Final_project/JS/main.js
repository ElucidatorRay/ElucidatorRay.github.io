var White = {}
var Black = {}
var path = []
var attack = []
var castle = []
var En_passant = []
var isEN = []
var ColToIndex = { 'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8 }
var IndexToCol = { 1: 'a', 2: 'b', 3: 'c', 4: 'd', 5: 'e', 6: 'f', 7: 'g', 8: 'h' }
var NameToSimp = { 'king': 'K', 'queen': 'Q', 'bishop': 'B', 'rook': 'R', 'knight': 'N', 'pawn': '' }

var choose_piece = false
var whiteMove = true
var step = 0
var record = ''

function initPiece(String) {
    let temp = {}
    temp['king'] = (String == 'W') ? ['e', 1, true] : ['d', 8, true]
    temp['queen1'] = (String == 'W') ? ['d', 1] : ['e', 8]
    temp['bishop1'] = (String == 'W') ? ['c', 1] : ['c', 8]
    temp['bishop2'] = (String == 'W') ? ['f', 1] : ['f', 8]
    temp['knight1'] = (String == 'W') ? ['b', 1] : ['b', 8]
    temp['knight2'] = (String == 'W') ? ['g', 1] : ['g', 8]
    temp['rook1'] = (String == 'W') ? ['a', 1, true] : ['a', 8, true]
    temp['rook2'] = (String == 'W') ? ['h', 1, true] : ['h', 8, true]
    temp['pawn1'] = (String == 'W') ? ['a', 2, true] : ['a', 7, true]
    temp['pawn2'] = (String == 'W') ? ['b', 2, true] : ['b', 7, true]
    temp['pawn3'] = (String == 'W') ? ['c', 2, true] : ['c', 7, true]
    temp['pawn4'] = (String == 'W') ? ['d', 2, true] : ['d', 7, true]
    temp['pawn5'] = (String == 'W') ? ['e', 2, true] : ['e', 7, true]
    temp['pawn6'] = (String == 'W') ? ['f', 2, true] : ['f', 7, true]
    temp['pawn7'] = (String == 'W') ? ['g', 2, true] : ['g', 7, true]
    temp['pawn8'] = (String == 'W') ? ['h', 2, true] : ['h', 7, true]
    return temp
}
function initGame() {
    White = initPiece('W')
    Black = initPiece('B')
    console.log('initialize chess!')
    var test = 0
}
function showEndMsg() {
    if (White['king'] == [-1, -1]) {
        let modal = $(`#${'黑棋贏了'}`)[0]
        let bModal = new bootstrap.Modal(modal, {
            backdrop: 'static',
            keyboard: false
        })
        bModal.show()
    } else {
        let modal = $(`#${'白棋贏了'}`)[0]
        let bModal = new bootstrap.Modal(modal, {
            backdrop: 'static',
            keyboard: false
        })
        bModal.show()
    }
}
function Click() {
    record = ''
    for (let y = 8; y > 0; y--) {
        for (let x = 1; x < 9; x++) {
            let id = '#' + String(y) + IndexToCol[x]
            $(id).click(() => {
                console.log(id + ' is clicked')
                // 判斷是選擇要移動的棋子還是要移動的位置
                if (!choose_piece) {
                    // 判斷可不可以選取該格子的棋子
                    if ((whiteMove && InObj(x, y, Black)) || (!whiteMove && InObj(x, y, White)) || (!InObj(x, y, White) && !InObj(x, y, Black))) {
                        return
                    }
                    choose_piece = getPiece(id[2], id[1])
                    updatePathAtk(choose_piece, id)
                    updateGame()
                    // 如果不能移動，不選擇該棋子
                    if (path.length == 0 && attack.length == 0) {
                        choose_piece = false
                    }
                } else {
                    // 判斷執棋方
                    if (whiteMove) {
                        // 如果又選擇白棋，重製選擇的棋子，讓玩家重選
                        if (InObj(x, y, White)) {
                            path.length = 0
                            attack.length = 0
                            choose_piece = false
                            updateGame()
                            return
                        }
                        // 判斷是哪一種格子
                        if (InArray([x, y], path)) {
                            let Ori = White[choose_piece]
                            En_passant = []
                            White[choose_piece] = [id[2], Number(id[1])]
                            record = NameToSimp[choose_piece.substr(0, choose_piece.length - 1)] + Ori[0] + String(Ori[1])
                            record += White[choose_piece][0] + String(White[choose_piece][1])
                            // 判斷特殊情況(白方入堡)
                            if (castle.length != 0) {
                                if (White[choose_piece][0] == 'g' && White[choose_piece][1] == 1) {
                                    White['rook2'] = ['f', 1]
                                    record = 'O-O'
                                } else if (White[choose_piece][0] == 'c' && White[choose_piece][1] == 1) {
                                    White['rook1'] = ['d', 1]
                                    record = 'O-O-O'
                                }
                            }
                            // 判斷特殊情況(過路兵)
                            if (choose_piece.substr(0, choose_piece.length - 1) == 'pawn') {
                                // 將自己初次移動的兵放入En_passant
                                if (White[choose_piece][1] == 4 && Ori[1] == 2) {
                                    En_passant = choose_piece
                                } else {
                                    En_passant = []
                                }
                                // 判斷這次移動是否為吃過路兵
                                if (choose_piece.substr(0, choose_piece.length - 1) == 'pawn') {
                                    // 左方的過路兵
                                    if (ColToIndex[Ori[0]] - 1 == ColToIndex[White[choose_piece][0]] && Ori[1] + 1 == White[choose_piece][1]) {
                                        let A = getPiece(IndexToCol[ColToIndex[Ori[0]] - 1], Ori[1])
                                        Black[A] = [-1, -1]
                                        En_passant = []
                                        record += 'x' + White[choose_piece][0] + String(White[choose_piece][1])
                                    }
                                    // 右方的過路兵
                                    if (ColToIndex[Ori[0]] + 1 == ColToIndex[White[choose_piece][0]] && Ori[1] + 1 == White[choose_piece][1]) {
                                        let A = getPiece(IndexToCol[ColToIndex[Ori[0]] + 1], Ori[1])
                                        Black[A] = [-1, -1]
                                        En_passant = []
                                        record += 'x' + White[choose_piece][0] + String(White[choose_piece][1])
                                    }
                                } else {
                                    En_passant = []
                                }
                            } else {
                                En_passant = []
                            }
                            // 判斷特殊情況(升變)
                            if (choose_piece.substr(0, choose_piece.length - 1) == 'pawn') {
                                Promotion(choose_piece)
                            }
                        } else if (InArray([x, y], attack)) {
                            Black[getPiece(id[2], id[1])] = [-1, -1]
                            White[choose_piece] = [id[2], Number(id[1])]
                            record = NameToSimp[choose_piece.substr(0, choose_piece.length - 1)] + Ori[0] + String(Ori[1])
                            record += 'x' + White[choose_piece][0] + String(White[choose_piece][0][1])
                        } else {
                            return
                        }
                        path.length = 0
                        attack.length = 0
                        choose_piece = false
                        whiteMove = false
                        step += 1
                        $('#step').text(' ' + String(step) + ' ')
                        $('#turn').text('黑方')
                        updateGame()
                        check_winner()
                        let $record = $('<p>').text(record)
                        $('#ChessRecord').append($record)
                        record = ''
                        return
                    } else if (!whiteMove) {
                        if (InObj(x, y, Black)) {
                            path.length = 0
                            attack.length = 0
                            choose_piece = false
                            updateGame()
                            return
                        }
                        if (InArray([x, y], path)) {
                            let Ori = Black[choose_piece]
                            En_passant = []
                            Black[choose_piece] = [id[2], Number(id[1])]
                            record = NameToSimp[choose_piece.substr(0, choose_piece.length - 1)] + Ori[0] + String(Ori[1])
                            record += Black[choose_piece][0] + String(Black[choose_piece][1])
                            // 判斷特殊情況(黑方入堡)
                            if (castle.length != 0) {
                                if (Black[choose_piece][0] == 'f' && Black[choose_piece][1] == 8) {
                                    Black['rook2'] = ['e', 8]
                                    record = 'O-O-O'
                                } else if (Black[choose_piece][0] == 'b' && Black[choose_piece][1] == 8) {
                                    Black['rook1'] = ['c', 8]
                                    record = 'O-O'
                                }
                            }
                            // 判斷特殊情況(過路兵)
                            if (choose_piece.substr(0, choose_piece.length - 1) == 'pawn') {
                                // 將自己初次移動的兵放入En_passant
                                if (Black[choose_piece][1] == 5 && Ori[1] == 7) {
                                    En_passant = choose_piece
                                }
                                // 判斷這次移動是否為吃過路兵
                                if (choose_piece.substr(0, choose_piece.length - 1) == 'pawn') {
                                    // 左方的過路兵
                                    if (ColToIndex[Ori[0]] - 1 == ColToIndex[Black[choose_piece][0]] && Ori[1] - 1 == Black[choose_piece][1]) {
                                        // console.log(Ori[1])
                                        // console.log(IndexToCol[ColToIndex[Ori[0]] - 1])
                                        let A = getPiece(IndexToCol[ColToIndex[Ori[0]] - 1], Ori[1])
                                        White[A] = [-1, -1]
                                        En_passant = []
                                        record = NameToSimp[choose_piece.substr(0, choose_piece.length - 1)] + Ori[0] + String(Ori[1])
                                        record += 'x' + Black[choose_piece][0] + String(Black[choose_piece][1])
                                    }
                                    // 右方的過路兵
                                    if (ColToIndex[Ori[0]] + 1 == ColToIndex[Black[choose_piece][0]] && Ori[1] - 1 == Black[choose_piece][1]) {
                                        let A = getPiece(IndexToCol[ColToIndex[Ori[0]] + 1], Ori[1])
                                        White[A] = [-1, -1]
                                        En_passant = []
                                        record = NameToSimp[choose_piece.substr(0, choose_piece.length - 1)] + Ori[0] + String(Ori[1])
                                        record += 'x' + Black[choose_piece][0] + String(Black[choose_piece][1])
                                    }
                                }
                            } else {
                                En_passant = []
                            }
                            // 判斷特殊情況(升變)
                            if (choose_piece.substr(0, choose_piece.length - 1) == 'pawn') {
                                Promotion(choose_piece)
                            }
                        } else if (InArray([x, y], attack)) {
                            White[getPiece(id[2], id[1])] = [-1, -1]
                            Black[choose_piece] = [id[2], Number(id[1])]
                            En_passant = []
                            record = NameToSimp[choose_piece.substr(0, choose_piece.length - 1)] + Ori[0] + String(Ori[1])
                            record += 'x' + Black[choose_piece][0] + String(Black[choose_piece][1])
                        } else {
                            return
                        }
                        path.length = 0
                        attack.length = 0
                        choose_piece = false
                        whiteMove = true
                        step += 1
                        $('#step').text(' ' + String(step) + ' ')
                        $('#turn').text('白方')
                        updateGame()
                        check_winner()
                        let $record = $('<p>').text(record)
                        $('#ChessRecord').append($record)
                        record = ''
                        return
                    }
                }
            })
        }
    }
}

function updateGame() {
    resetClass()
    for (let y = 8; y > 0; y--) {
        for (let x = 1; x < 9; x++) {
            let id = '#' + String(y) + IndexToCol[x]
            // 按照現在的棋子排列加入類別
            Object.keys(White).forEach((v, i) => {
                if (ColToIndex[White[v][0]] == x && White[v][1] == y) {
                    let piece = (v == 'king') ? v : v.substr(0, v.length - 1)
                    $(id).addClass(piece + '-white')
                }
            })
            Object.keys(Black).forEach((v, i) => {
                if (ColToIndex[Black[v][0]] == x && Black[v][1] == y) {
                    let piece = (v == 'king') ? v : v.substr(0, v.length - 1)
                    $(id).addClass(piece + '-black')
                }
            })
            // 按照現在移動、攻擊陣列加入類別
            if (InArray([x, y], path)) {
                $(id).addClass('onmov')
            }
            if (InArray([x, y], attack)) {
                $(id).addClass('onatk')
            }
        }
    }
}

$(() => {
    // 網頁打開時即初始化遊戲物件
    initGame()
    // 執棋由白方開始，從第一手開始下
    $('#turn').text('白方')
    $('#step').text(' ' + String(step) + ' ')

    // 當"開始遊戲"被按下，進行運算及渲染
    $("#start").on('click', () => {
        // 跳轉到遊戲區塊
        (() => {
            $('a[href="#game"]')[0].click()
        })()
        // 取得點擊資訊
        Click()
    })
})