/**
 * 五子棋AI算法
 * 实现了不同难度的自动对战逻辑
 */

// 游戏常量
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

// 分数常量
const FIVE = 100000;      // 连五
const OPEN_FOUR = 10000;  // 活四
const FOUR = 1000;        // 冲四
const OPEN_THREE = 1000;  // 活三
const THREE = 100;        // 冲三
const OPEN_TWO = 100;     // 活二
const TWO = 10;           // 冲二

/**
 * 获取最佳落子位置
 * @param {Array} board - 当前棋盘状态
 * @param {number} player - 当前玩家 (BLACK 或 WHITE)
 * @param {string} difficulty - 难度级别 ('easy', 'medium', 'hard')
 * @returns {Object|null} - 最佳落子位置 {row, col} 或 null
 */
function getBestMove(board, player, difficulty) {
    const opponent = player === BLACK ? WHITE : BLACK;
    const validMoves = getValidMoves(board);

    if (validMoves.length === 0) return null;

    let bestMove = null;
    let bestScore = -Infinity;

    switch (difficulty) {
        case 'medium':
            // 中等难度，随机选择高分位置
            const goodMoves = [];
            for (const move of validMoves) {
                board[move.row][move.col] = player;
                const score = evaluatePosition(board, player);
                board[move.row][move.col] = EMPTY;

                if (score > bestScore) {
                    bestScore = score;
                    goodMoves.length = 0;
                    goodMoves.push(move);
                } else if (score === bestScore) {
                    goodMoves.push(move);
                }
            }
            if (goodMoves.length > 0) {
                bestMove = goodMoves[Math.floor(Math.random() * goodMoves.length)];
            }
            break;

        case 'easy':
            // 简单难度，考虑双方2步的简单极大极小值搜索
            for (const move of validMoves) {
                board[move.row][move.col] = player;
                const myScore = evaluatePosition(board, player);
                board[move.row][move.col] = EMPTY;

                board[move.row][move.col] = opponent;
                const opponentScore = evaluatePosition(board, opponent);
                board[move.row][move.col] = EMPTY;

                const score = myScore - opponentScore * 0.8;

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            }
            break;

        case 'hard':
            // 困难难度，使用极大极小算法，搜索深度为2，Alpha-Beta剪枝，并只对前若干高分候选点进行搜索以加速
            const depth = 2; // 降低搜索深度
            // 先对所有可落子点进行静态评分，选出前N个高分点
            const moveScores = validMoves.map(move => {
                board[move.row][move.col] = player;
                const score = evaluatePosition(board, player);
                board[move.row][move.col] = EMPTY;
                return { move, score };
            });
            // 按分数降序排序
            moveScores.sort((a, b) => b.score - a.score);
            // 只对前N个高分点做极大极小搜索
            const topN = 8;
            for (let i = 0; i < Math.min(topN, moveScores.length); i++) {
                const move = moveScores[i].move;
                board[move.row][move.col] = player;
                const score = minimax(board, depth, -Infinity, Infinity, false, player, opponent);
                board[move.row][move.col] = EMPTY;

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            }
            break;
    }

    return bestMove;
}

/**
 * 获取棋盘上有效的落子位置，范围为已有子的空位置
 * @param {Array} board - 当前棋盘状态
 * @returns {Array} - 有效落子位置数组 [{row, col}, ...]
 */
function getValidMoves(board) {
    const validMoves = [];
    const BOARD_SIZE = board.length;
    
    // 只考虑已有棋子附近的空位置
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            // 如果当前位置为空
            if (board[i][j] === EMPTY) {
                // 检查周围是否有棋子
                for (let dx = -2; dx <= 2; dx++) {
                    for (let dy = -2; dy <= 2; dy++) {
                        const ni = i + dx;
                        const nj = j + dy;
                        
                        if (ni >= 0 && ni < BOARD_SIZE && nj >= 0 && nj < BOARD_SIZE) {
                            if (board[ni][nj] !== EMPTY) {
                                validMoves.push({row: i, col: j});
                                // 找到一个邻居就跳出循环
                                dx = dy = 3;
                            }
                        }
                    }
                }
            }
        }
    }
    
    // 如果没有找到邻近的空位，则返回所有空位
    if (validMoves.length === 0) {
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (board[i][j] === EMPTY) {
                    validMoves.push({row: i, col: j});
                }
            }
        }
    }
    
    return validMoves;
}

/**
 * 极大极小算法，带Alpha-Beta剪枝
 * @param {Array} board - 当前棋盘状态
 * @param {number} depth - 搜索深度
 * @param {number} alpha - Alpha值
 * @param {number} beta - Beta值
 * @param {boolean} isMaximizing - 是否为极大化方
 * @param {number} player - 当前玩家
 * @param {number} opponent - 对手
 * @returns {number} - 评分结果
 */
function minimax(board, depth, alpha, beta, isMaximizing, player, opponent) {
    const BOARD_SIZE = board.length;
    
    // 递归终止条件：达到深度或游戏结束
    if (depth === 0) {
        return evaluatePosition(board, player);
    }
    
    // 获取所有有效落子
    const validMoves = getValidMoves(board);
    
    // 没有有效落子，返回当前评分
    if (validMoves.length === 0) {
        return evaluatePosition(board, player);
    }
    
    if (isMaximizing) {
        let maxScore = -Infinity;
        
        for (const move of validMoves) {
            // 模拟落子
            board[move.row][move.col] = player;
            
            // 判断是否形成胜利
            if (checkWin(board, move.row, move.col, player)) {
                // 撤销落子
                board[move.row][move.col] = EMPTY;
                return FIVE * depth; // 越早胜利分数越高
            }
            
            // 递归搜索
            const score = minimax(board, depth - 1, alpha, beta, false, player, opponent);
            
            // 撤销落子
            board[move.row][move.col] = EMPTY;
            
            maxScore = Math.max(maxScore, score);
            alpha = Math.max(alpha, score);
            
            // Beta剪枝
            if (beta <= alpha) {
                break;
            }
        }
        
        return maxScore;
    } else {
        let minScore = Infinity;
        
        for (const move of validMoves) {
            // 模拟对手落子
            board[move.row][move.col] = opponent;
            
            // 判断对手是否胜利
            if (checkWin(board, move.row, move.col, opponent)) {
                // 撤销落子
                board[move.row][move.col] = EMPTY;
                return -FIVE * depth; // 越早失败分数越低
            }
            
            // 递归搜索
            const score = minimax(board, depth - 1, alpha, beta, true, player, opponent);
            
            // 撤销落子
            board[move.row][move.col] = EMPTY;
            
            minScore = Math.min(minScore, score);
            beta = Math.min(beta, score);
            
            // Alpha剪枝
            if (beta <= alpha) {
                break;
            }
        }
        
        return minScore;
    }
}

/**
 * 评估当前棋盘位置的分数
 * @param {Array} board - 当前棋盘状态
 * @param {number} player - 当前玩家
 * @returns {number} - 评分结果
 */
function evaluatePosition(board, player) {
    const opponent = player === BLACK ? WHITE : BLACK;
    let score = 0;
    const BOARD_SIZE = board.length;
    
    // 遍历所有可能的五连位置
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            // 水平方向
            if (j <= BOARD_SIZE - 5) {
                score += evaluateLine(board, i, j, 0, 1, player, opponent);
            }
            
            // 垂直方向
            if (i <= BOARD_SIZE - 5) {
                score += evaluateLine(board, i, j, 1, 0, player, opponent);
            }
            
            // 斜下方向
            if (i <= BOARD_SIZE - 5 && j <= BOARD_SIZE - 5) {
                score += evaluateLine(board, i, j, 1, 1, player, opponent);
            }
            
            // 斜上方向
            if (i <= BOARD_SIZE - 5 && j >= 4) {
                score += evaluateLine(board, i, j, 1, -1, player, opponent);
            }
        }
    }
    
    return score;
}

/**
 * 评估一条线上五个格子的得分
 * @param {Array} board - 当前棋盘状态
 * @param {number} row - 起始行
 * @param {number} col - 起始列
 * @param {number} dx - 行方向增量
 * @param {number} dy - 列方向增量
 * @param {number} player - 当前玩家
 * @param {number} opponent - 对手
 * @returns {number} - 评分结果
 */
function evaluateLine(board, row, col, dx, dy, player, opponent) {
    let playerCount = 0;
    let opponentCount = 0;
    let emptyCount = 0;
    
    // 统计五个格子的棋子数量
    for (let i = 0; i < 5; i++) {
        const r = row + i * dx;
        const c = col + i * dy;
        
        if (board[r][c] === player) {
            playerCount++;
        } else if (board[r][c] === opponent) {
            opponentCount++;
        } else {
            emptyCount++;
        }
    }
    
    // 双方都有棋子，无效
    if (playerCount > 0 && opponentCount > 0) {
        return 0;
    }
    
    // 只有己方有棋子
    if (playerCount > 0 && opponentCount === 0) {
        return getPatternScore(playerCount, emptyCount);
    }
    
    // 只有对方有棋子
    if (opponentCount > 0 && playerCount === 0) {
        // 对方得分为负
        return -getPatternScore(opponentCount, emptyCount) * 0.9;
    }
    
    // 全为空
    return 0;
}

/**
 * 根据棋子数和空位数获得模式分数
 * @param {number} pieceCount - 棋子数量
 * @param {number} emptyCount - 空位数量
 * @returns {number} - 模式分数
 */
function getPatternScore(pieceCount, emptyCount) {
    // 连五
    if (pieceCount === 5) {
        return FIVE;
    }
    
    // 活四
    if (pieceCount === 4 && emptyCount === 1) {
        return OPEN_FOUR;
    }
    
    // 冲四
    if (pieceCount === 4 && emptyCount === 0) {
        return FOUR;
    }
    
    // 活三
    if (pieceCount === 3 && emptyCount === 2) {
        return OPEN_THREE;
    }
    
    // 冲三
    if (pieceCount === 3 && emptyCount === 1) {
        return THREE;
    }
    
    // 活二
    if (pieceCount === 2 && emptyCount === 3) {
        return OPEN_TWO;
    }
    
    // 冲二
    if (pieceCount === 2 && emptyCount === 2) {
        return TWO;
    }
    
    return 0;
}

/**
 * 判断某位置是否胜利
 * @param {Array} board - 当前棋盘状态
 * @param {number} row - 落子行
 * @param {number} col - 落子列
 * @param {number} player - 棋子颜色
 * @returns {boolean} - 是否胜利
 */
function checkWin(board, row, col, player) {
    const directions = [
        [1, 0],   // 水平
        [0, 1],   // 垂直
        [1, 1],   // 斜下
        [1, -1]   // 斜上
    ];
    
    const BOARD_SIZE = board.length;
    
    for (const [dx, dy] of directions) {
        let count = 1;  // 当前落子已算一个
        
        // 正方向
        for (let i = 1; i < 5; i++) {
            const newRow = row + i * dy;
            const newCol = col + i * dx;
            
            if (
                newRow >= 0 && newRow < BOARD_SIZE &&
                newCol >= 0 && newCol < BOARD_SIZE &&
                board[newRow][newCol] === player
            ) {
                count++;
            } else {
                break;
            }
        }
        
        // 反方向
        for (let i = 1; i < 5; i++) {
            const newRow = row - i * dy;
            const newCol = col - i * dx;
            
            if (
                newRow >= 0 && newRow < BOARD_SIZE &&
                newCol >= 0 && newCol < BOARD_SIZE &&
                board[newRow][newCol] === player
            ) {
                count++;
            } else {
                break;
            }
        }
        
        // 判断胜利
        if (count >= 5) {
            return true;
        }
    }
    
    return false;
}
// JavaScript Document