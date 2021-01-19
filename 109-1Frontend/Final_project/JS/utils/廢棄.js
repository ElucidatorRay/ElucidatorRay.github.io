function updateGam_odd(obj) {
    // 創建新的棋盤
    let $content = $('<div>').addClass('chess-board')
    for (let y = 8; y > 0; y--) {
        // 創建新的row
        let $row = $('<div>').addClass('row')
        for (let x = 1; x < 9; x++) {
            // 創建新的col
            let $col = $('<div>').attr('id', String(y) + IndexToCol[x]);
            $col.addClass('col')
            // 依據位置改變棋盤網格底部的顏色
            if (y % 2 == 0) {
                if (x % 2 == 0) {
                    $col = $col.addClass('black')
                } else {
                    $col = $col.addClass('white')
                }
            } else {
                if (x % 2 == 0) {
                    $col = $col.addClass('white')
                } else {
                    $col = $col.addClass('black')
                }
            }
            // 加入網格尺寸的屬性
            $col.addClass('chess-grid')
            // 判斷有無棋子
            Object.keys(White).forEach((v, i) => {
                if (ColToIndex[White[v][0]] == x && White[v][1] == y) {
                    let piece = (v == 'king') ? v : v.substr(0, v.length - 1)
                    $col.addClass(piece + '-white')
                }
            })
            Object.keys(Black).forEach((v, i) => {
                if (ColToIndex[Black[v][0]] == x && Black[v][1] == y) {
                    let piece = (v == 'king') ? v : v.substr(0, v.length - 1)
                    $col.addClass(piece + '-black')
                }
            })
            // 判斷被攻擊或在移動路徑上
            if (InArray([x, y], path)) {
                $col.addClass('onmov')
            }
            if (InArray([x, y], attack)) {
                $col.addClass('onatk')
            }
            // 將此欄(col)加入列(row)中
            $row.append($col)
        }
        $content.append($row)
    }
    obj.append($content)
}