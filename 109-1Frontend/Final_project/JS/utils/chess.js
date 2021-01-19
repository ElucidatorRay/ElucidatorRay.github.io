function check_grid(X, Y) {
    return (X <= 8 && X >= 1 && Y <= 8 && Y >= 1)
}

function InArray(elem, Array) {
    for (let index = 0; index < Array.length; index++) {
        if (elem[0] == Array[index][0] && elem[1] == Array[index][1]) {
            return true
        }
    }
    return false
}

function InObj(X, Y, obj) {
    let keys = Object.keys(obj)
    for (let index = 0; index < keys.length; index++) {
        if (obj[keys[index]][1] == Y && obj[keys[index]][0] == IndexToCol[X]) {
            return true
        }
    }
    return false
}

function isEmpty(X, Y) {
    if (!InObj(X, Y, White) && !InObj(X, Y, Black)) {
        return true
    }
    return false
}

function resetClass() {
    for (let y = 8; y > 0; y--) {
        for (let x = 1; x < 9; x++) {
            let id = '#' + String(y) + IndexToCol[x]
            // 去掉所有的移動及受攻擊標籤，重新渲染
            $(id).removeClass('onmov')
            $(id).removeClass('onatk')
            // 去掉原有的棋子類別
            $(id).removeClass('king-white')
            $(id).removeClass('king-black')
            $(id).removeClass('queen-white')
            $(id).removeClass('queen-black')
            $(id).removeClass('bishop-white')
            $(id).removeClass('bishop-black')
            $(id).removeClass('knight-white')
            $(id).removeClass('knight-black')
            $(id).removeClass('rook-white')
            $(id).removeClass('rook-black')
            $(id).removeClass('pawn-white')
            $(id).removeClass('pawn-black')
        }
    }
}

function getPiece(X, Y) {
    let find = false
    let Re
    Object.keys(White).forEach((v, i) => {
        // console.log(White[v][0] == X && White[v][1] == Y)
        if (White[v][0] == X && White[v][1] == Y) {
            find = true
            Re = v
            return
        }
    })
    Object.keys(Black).forEach((v, i) => {
        if (find) {
            return
        }
        if (Black[v][0] == X && Black[v][1] == Y) {
            find = true
            Re = v
            return
        }
    })
    return Re
}

function pushArray(X, dx, Y, dy, Friend, Enemy) {
    // 合法位置
    if (check_grid(X + dx, Y + dy)) {
        // 判斷友軍、敵軍、還是沒有人
        if (InObj(X + dx, Y + dy, Friend)) {
            return false
        } else if (InObj(X + dx, Y + dy, Enemy)) {
            attack.push([X + dx, Y + dy])
            return false
        } else {
            path.push([X + dx, Y + dy])
            return true
        }
    }
}

function updatePathAtk(choose_piece, id) {
    // 檢查是否有選到棋子
    if (choose_piece == false) {
        console.log('choosen piece is false')
        return
    }
    // 分別處理不同的棋子的路徑
    path.length = 0
    attack.length = 0
    castle.length = 0
    let X = Number(ColToIndex[id[2]])
    let Y = Number(id[1])
    Friend = (whiteMove) ? White : Black
    Enemy = (whiteMove) ? Black : White
    if (choose_piece == 'king') {
        // 檢查一般移動
        for (let dx = -1; dx < 2; dx++) {
            for (let dy = -1; dy < 2; dy++) {
                pushArray(X, dx, Y, dy, Friend, Enemy)
            }
        }
        // 檢查王車易位
        if (whiteMove) {
            // 國王沒有移動過
            if (White[choose_piece].length == 3) {
                // 左邊的城堡沒有移動過，而且中間沒有其他棋子
                if (White['rook1'].length == 3 && isEmpty(X - 1, Y) && isEmpty(X - 2, Y) && isEmpty(X - 3, Y)) {
                    pushArray(X, -2, Y, 0, Friend, Enemy)
                    castle.push([X - 2, Y, 1])
                }
                // 右邊的城堡沒有移動過，而且中間沒有其他棋子
                if (White['rook2'].length == 3 && isEmpty(X + 1, Y) && isEmpty(X + 2, Y)) {
                    pushArray(X, 2, Y, 0, Friend, Enemy)
                    castle.push([X + 2, Y, 2])
                }
            }
        } else {
            // 黑棋國王沒有移動過
            if (Black[choose_piece].length == 3) {
                if (White['rook1'].length == 3 && isEmpty(X - 1, Y) && isEmpty(X - 2, Y)) {
                    pushArray(X, -2, Y, 0, Friend, Enemy)
                    castle.push([X - 2, Y, 1])
                }
                if (White['rook2'].length == 3 && isEmpty(X + 1, Y) && isEmpty(X + 2, Y) && isEmpty(X + 3, Y)) {
                    pushArray(X, 2, Y, 0, Friend, Enemy)
                    castle.push([X + 2, Y, 2])
                }
            }
        }
    }
    if (choose_piece.substr(0, choose_piece.length - 1) == 'bishop') {
        // 主教的移動
        // 右上
        for (let d = 1; d < 8; d++) {
            if (!pushArray(X, d, Y, d, Friend, Enemy)) {
                break
            }
        }
        // 右下
        for (let d = 1; d < 8; d++) {
            if (!pushArray(X, d, Y, d * -1, Friend, Enemy)) {
                break
            }
        }
        // 左上
        for (let d = 1; d < 8; d++) {
            if (!pushArray(X, d * -1, Y, d, Friend, Enemy)) {
                break
            }
        }
        // 左下
        for (let d = 1; d < 8; d++) {
            if (!pushArray(X, d * -1, Y, d * -1, Friend, Enemy)) {
                break
            }
        }
    }
    if (choose_piece.substr(0, choose_piece.length - 1) == 'rook') {
        // 城堡的移動
        // 上
        for (let d = 1; d < 8; d++) {
            if (!pushArray(X, 0, Y, d, Friend, Enemy)) {
                break
            }
        }
        // 下
        for (let d = 1; d < 8; d++) {
            if (!pushArray(X, 0, Y, d * -1, Friend, Enemy)) {
                break
            }
        }
        // 左
        for (let d = 1; d < 8; d++) {
            if (!pushArray(X, d * -1, Y, 0, Friend, Enemy)) {
                break
            }
        }
        // 右
        for (let d = 1; d < 8; d++) {
            if (!pushArray(X, d, Y, 0, Friend, Enemy)) {
                break
            }
        }
    }
    if (choose_piece.substr(0, choose_piece.length - 1) == 'queen') {
        // 右上
        for (let d = 1; d < 8; d++) {
            if (!pushArray(X, d, Y, d, Friend, Enemy)) {
                break
            }
        }
        // 右下
        for (let d = 1; d < 8; d++) {
            if (!pushArray(X, d, Y, d * -1, Friend, Enemy)) {
                break
            }
        }
        // 左上
        for (let d = 1; d < 8; d++) {
            if (!pushArray(X, d * -1, Y, d, Friend, Enemy)) {
                break
            }
        }
        // 左下
        for (let d = 1; d < 8; d++) {
            if (!pushArray(X, d * -1, Y, d * -1, Friend, Enemy)) {
                break
            }
        }
        // 上
        for (let d = 1; d < 8; d++) {
            if (!pushArray(X, 0, Y, d, Friend, Enemy)) {
                break
            }
        }
        // 下
        for (let d = 1; d < 8; d++) {
            if (!pushArray(X, 0, Y, d * -1, Friend, Enemy)) {
                break
            }
        }
        // 左
        for (let d = 1; d < 8; d++) {
            if (!pushArray(X, d * -1, Y, 0, Friend, Enemy)) {
                break
            }
        }
        // 右
        for (let d = 1; d < 8; d++) {
            if (!pushArray(X, d, Y, 0, Friend, Enemy)) {
                break
            }
        }
    }
    if (choose_piece.substr(0, choose_piece.length - 1) == 'knight') {
        console.log('knight')
        pushArray(X, 1, Y, 2, Friend, Enemy)
        pushArray(X, 1, Y, -2, Friend, Enemy)
        pushArray(X, -1, Y, 2, Friend, Enemy)
        pushArray(X, -1, Y, -2, Friend, Enemy)
        pushArray(X, 2, Y, 1, Friend, Enemy)
        pushArray(X, 2, Y, -1, Friend, Enemy)
        pushArray(X, -2, Y, 1, Friend, Enemy)
        pushArray(X, -2, Y, -1, Friend, Enemy)
    }
    if (choose_piece.substr(0, choose_piece.length - 1) == 'pawn') {
        // 判斷執棋方
        if (whiteMove) {
            // 判斷是否為第一次移動
            if (White[choose_piece].length == 3) {
                // 判斷斜前方是否有敵人
                if (InObj(X + 1, Y + 1, Black)) {
                    pushArray(X, 1, Y, 1, Friend, Enemy)
                }
                if (InObj(X - 1, Y + 1, Black)) {
                    pushArray(X, -1, Y, 1, Friend, Enemy)
                }
                // 判斷前面兩格是否有敵人
                if (!InObj(X, Y + 1, White) && !InObj(X, Y + 1, Black)) {
                    pushArray(X, 0, Y, 1, Friend, Enemy)
                }
                if (!InObj(X, Y + 2, White) && !InObj(X, Y + 2, Black)) {
                    pushArray(X, 0, Y, 2, Friend, Enemy)
                }
            } else {
                if (InObj(X + 1, Y + 1, Black)) {
                    pushArray(X, 1, Y, 1, Friend, Enemy)
                }
                if (InObj(X - 1, Y + 1, Black)) {
                    pushArray(X, -1, Y, 1, Friend, Enemy)
                }
                if (!InObj(X, Y + 1, White) && !InObj(X, Y + 1, Black)) {
                    pushArray(X, 0, Y, 1, Friend, Enemy)
                }
            }
        } else {
            if (Black[choose_piece].length == 3) {
                // 判斷斜前方是否有敵人
                if (InObj(X - 1, Y - 1, White)) {
                    pushArray(X, -1, Y, -1, Friend, Enemy)
                }
                if (InObj(X + 1, Y - 1, White)) {
                    pushArray(X, 1, Y, -1, Friend, Enemy)
                }
                // 判斷前面兩格是否有敵人
                if (!InObj(X, Y - 1, White) && !InObj(X, Y - 1, Black)) {
                    pushArray(X, 0, Y, -1, Friend, Enemy)
                }
                if (!InObj(X, Y - 2, White) && !InObj(X, Y - 2, Black)) {
                    pushArray(X, 0, Y, -2, Friend, Enemy)
                }
            } else {
                if (InObj(X - 1, Y - 1, White)) {
                    pushArray(X, -1, Y, -1, Friend, Enemy)
                }
                if (InObj(X + 1, Y - 1, White)) {
                    pushArray(X, 1, Y, -1, Friend, Enemy)
                }
                if (!InObj(X, Y - 1, White) && !InObj(X, Y - 1, Black)) {
                    pushArray(X, 0, Y, -1, Friend, Enemy)
                }
            }
        }
        // 判斷過路兵
        if (whiteMove) {
            if (White[choose_piece][1] == 5) {
                if (getPiece(IndexToCol[X + 1], Y) == En_passant && isEmpty(X + 1, Y + 1)) {
                    pushArray(X, 1, Y, 1, Friend, Enemy)
                }
                if (getPiece(IndexToCol[X - 1], Y) == En_passant && isEmpty(X - 1, Y + 1)) {
                    console.log(X - 1, Y)
                    pushArray(X, -1, Y, 1, Friend, Enemy)
                }
            }
        } else {
            if (Black[choose_piece][1] == 4) {
                if (getPiece(IndexToCol[X + 1], Y) == En_passant && isEmpty(X + 1, Y - 1)) {
                    pushArray(X, 1, Y, -1, Friend, Enemy)
                }
                if (getPiece(IndexToCol[X - 1], Y) == En_passant && isEmpty(X - 1, Y - 1)) {
                    pushArray(X, -1, Y, -1, Friend, Enemy)
                }
            }
        }

    }
}

function Promotion(choose_piece) {
    if (whiteMove) {
        if (White[choose_piece][1] == 8) {
            $('#promotion').modal('show')
            // 升變為皇后
            $('#QueenPromote').click(() => {
                let MAX = 1
                Object.keys(White).forEach((v, i) => {
                    if (v.substr(0, v.length - 1) == 'queen' && Number(v.substr(v.length - 1)) == MAX) {
                        MAX += 1
                        return
                    }
                })
                White['queen' + String(MAX)] = White[choose_piece]
                White[choose_piece] = [-1, -1]
                record += '=Q'
            })
            // 升變為騎士
            $('#KnightPromote').click(() => {
                let MAX = 1
                Object.keys(White).forEach((v, i) => {
                    if (v.substr(0, v.length - 1) == 'knight' && Number(v.substr(v.length - 1)) == MAX) {
                        MAX += 1
                        return
                    }
                })
                White['knight' + String(MAX)] = White[choose_piece]
                White[choose_piece] = [-1, -1]
                record += '=N'
            })
            // 升變為主教
            $('#BishopPromote').click(() => {
                let MAX = 1
                Object.keys(White).forEach((v, i) => {
                    if (v.substr(0, v.length - 1) == 'bishop' && Number(v.substr(v.length - 1)) == MAX) {
                        MAX += 1
                        return
                    }
                })
                White['bishop' + String(MAX)] = White[choose_piece]
                White[choose_piece] = [-1, -1]
                record += '=B'
            })
            // 升變為城堡
            $('#RookPromote').click(() => {
                let MAX = 1
                Object.keys(White).forEach((v, i) => {
                    if (v.substr(0, v.length - 1) == 'rook' && Number(v.substr(v.length - 1)) == MAX) {
                        MAX += 1
                        return
                    }
                })
                White['rook' + String(MAX)] = White[choose_piece]
                White[choose_piece] = [-1, -1]
                record += '=R'
            })
        }
    } else {
        if (Black[choose_piece][1] == 1) {
            $('#promotion').modal('show')
            // 升變為皇后
            $('#QueenPromote').click(() => {
                let MAX = 1
                Object.keys(Black).forEach((v, i) => {
                    if (v.substr(0, v.length - 1) == 'queen' && Number(v.substr(v.length - 1)) == MAX) {
                        MAX += 1
                        return
                    }
                })
                Black['queen' + String(MAX)] = Black[choose_piece]
                Black[choose_piece] = [-1, -1]
                record += '=Q'
            })
            // 升變為騎士
            $('#KnightPromote').click(() => {
                let MAX = 1
                Object.keys(Black).forEach((v, i) => {
                    if (v.substr(0, v.length - 1) == 'knight' && Number(v.substr(v.length - 1)) == MAX) {
                        MAX += 1
                        return
                    }
                })
                Black['knight' + String(MAX)] = Black[choose_piece]
                Black[choose_piece] = [-1, -1]
                record += '=N'
            })
            // 升變為主教
            $('#BishopPromote').click(() => {
                let MAX = 1
                Object.keys(Black).forEach((v, i) => {
                    if (v.substr(0, v.length - 1) == 'bishop' && Number(v.substr(v.length - 1)) == MAX) {
                        MAX += 1
                        return
                    }
                })
                Black['bishop' + String(MAX)] = Black[choose_piece]
                Black[choose_piece] = [-1, -1]
                record += '=B'
            })
            // 升變為城堡
            $('#RookPromote').click(() => {
                let MAX = 1
                Object.keys(Black).forEach((v, i) => {
                    if (v.substr(0, v.length - 1) == 'rook' && Number(v.substr(v.length - 1)) == MAX) {
                        MAX += 1
                        return
                    }
                })
                Black['rook' + String(MAX)] = Black[choose_piece]
                Black[choose_piece] = [-1, -1]
                record += '=R'
            })
        }
    }
}

function check_winner() {
    // 檢查遊戲是否結束
    if (White['king'][0] == -1 && White['king'][1] == -1) {
        $('#WIN_black').modal('show')
    }
    if (Black['king'][0] == -1 && Black['king'][1] == -1) {
        $('#WIN_white').modal('show')
    }
}
