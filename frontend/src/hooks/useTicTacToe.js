import { useState, useEffect, useCallback, useRef } from 'react';
import { checkWinner, findBestMove, getRecommendedMove, SECTOR_NAMES } from '../utils/aiOpponent';
import { playMoveSound, playVictorySound, playDefeatSound } from '../utils/sound';

export function useTicTacToe(options = {}) {
  const {
    gameMode = 'VS_AI',
    aiDifficulty = 'hard',
    onGameEnd = () => {},
  } = options;

  const [board, setBoard] = useState(Array(9).fill(null));
  const [startingTurn, setStartingTurn] = useState('X');
  const [currentTurn, setCurrentTurn] = useState('X'); // 'X' is Player 1, 'O' is Player 2 / AI
  const [gameStatus, setGameStatus] = useState('IN_PROGRESS'); // 'IN_PROGRESS', 'FINISHED'
  const [winner, setWinner] = useState(null); // 'X', 'O', 'DRAW', or null
  const [winningLine, setWinningLine] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [p1SeriesScore, setP1SeriesScore] = useState(0);
  const [p2SeriesScore, setP2SeriesScore] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);

  // Timers
  const [turnCountdown, setTurnCountdown] = useState(15);
  const [matchSeconds, setMatchSeconds] = useState(0);

  const timerRef = useRef(null);
  const turnTimerRef = useRef(null);

  // Match stopwatch
  useEffect(() => {
    if (gameStatus !== 'IN_PROGRESS') return;

    timerRef.current = setInterval(() => {
      setMatchSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameStatus]);

  // Turn countdown timer
  useEffect(() => {
    if (gameStatus !== 'IN_PROGRESS') return;

    setTurnCountdown(15);
    turnTimerRef.current = setInterval(() => {
      setTurnCountdown((t) => {
        if (t <= 1) {
          return 15;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(turnTimerRef.current);
  }, [currentTurn, gameStatus]);

  // Recommended move for X (in VS_AI)
  const isAiMode = gameMode === 'VS_AI';
  const isLocal2P = gameMode === 'LOCAL_2P' || gameMode === 'HOTSEAT';

  // State refs for reliable asynchronous and interval access without causing unnecessary effect re-triggers
  const boardRef = useRef(board);
  boardRef.current = board;
  const currentTurnRef = useRef(currentTurn);
  currentTurnRef.current = currentTurn;
  const gameStatusRef = useRef(gameStatus);
  gameStatusRef.current = gameStatus;
  const onGameEndRef = useRef(onGameEnd);
  onGameEndRef.current = onGameEnd;
  const matchSecondsRef = useRef(matchSeconds);
  matchSecondsRef.current = matchSeconds;
  const p1SeriesScoreRef = useRef(p1SeriesScore);
  p1SeriesScoreRef.current = p1SeriesScore;
  const p2SeriesScoreRef = useRef(p2SeriesScore);
  p2SeriesScoreRef.current = p2SeriesScore;
  const moveHistoryRef = useRef(moveHistory);
  moveHistoryRef.current = moveHistory;

  const recommendedMove = (currentTurn === 'X' && gameStatus === 'IN_PROGRESS' && isAiMode)
    ? getRecommendedMove(board)
    : null;

  // Make move implementation (stable identity - does not change on timer ticks)
  const makeMove = useCallback((index, explicitPlayer = null) => {
    const activePlayer = explicitPlayer || currentTurnRef.current;
    const currentBoard = boardRef.current;

    if (currentBoard[index] || gameStatusRef.current !== 'IN_PROGRESS') return false;

    playMoveSound(activePlayer === 'X');

    const nextBoard = [...currentBoard];
    nextBoard[index] = activePlayer;
    setBoard(nextBoard);
    boardRef.current = nextBoard;

    const now = new Date();
    const timeStr = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newMove = {
      player: activePlayer,
      index,
      sector: SECTOR_NAMES[index],
      time: timeStr,
    };
    setMoveHistory((prev) => [...prev, newMove]);

    // Check winner
    const result = checkWinner(nextBoard);
    if (result.winner) {
      setWinningLine(result.line);
      setWinner(result.winner);
      setGameStatus('FINISHED');
      gameStatusRef.current = 'FINISHED';

      let outcome = 'DRAW';
      if (result.winner === 'X') {
        outcome = 'WIN';
        setP1SeriesScore((s) => s + 1);
        playVictorySound();
      } else if (result.winner === 'O') {
        outcome = isLocal2P ? 'P2_WIN' : 'LOSS';
        setP2SeriesScore((s) => s + 1);
        if (isLocal2P) {
          playVictorySound();
        } else {
          playDefeatSound();
        }
      }

      if (onGameEndRef.current) {
        onGameEndRef.current({
          result: outcome,
          winner: result.winner,
          board: nextBoard,
          moves: moveHistoryRef.current.length + 1,
          durationSeconds: matchSecondsRef.current,
          p1Score: p1SeriesScoreRef.current + (result.winner === 'X' ? 1 : 0),
          p2Score: p2SeriesScoreRef.current + (result.winner === 'O' ? 1 : 0),
        });
      }
      return true;
    }

    // Switch turn
    const nextTurn = activePlayer === 'X' ? 'O' : 'X';
    setCurrentTurn(nextTurn);
    currentTurnRef.current = nextTurn;
    return true;
  }, [isLocal2P]);

  // AI turn automation: reliably triggers whenever it is O's turn in VS_AI mode
  useEffect(() => {
    if (!isAiMode || currentTurn !== 'O' || gameStatus !== 'IN_PROGRESS') return;

    const timer = setTimeout(() => {
      // Re-verify that game is still active and it remains O's turn
      if (currentTurnRef.current !== 'O' || gameStatusRef.current !== 'IN_PROGRESS') {
        return;
      }
      const boardSnapshot = [...boardRef.current];
      const bestIdx = findBestMove(boardSnapshot, aiDifficulty);
      if (bestIdx !== null && bestIdx >= 0 && bestIdx < 9 && !boardSnapshot[bestIdx]) {
        makeMove(bestIdx, 'O');
      }
    }, 450); // Snappy cyber AI thinking delay

    return () => clearTimeout(timer);
  }, [currentTurn, gameStatus, isAiMode, aiDifficulty, makeMove]);

  // Reset for next round
  const resetRound = useCallback((nextStarter) => {
    const starter = nextStarter || (startingTurn === 'X' ? 'O' : 'X');
    setStartingTurn(starter);
    const emptyBoard = Array(9).fill(null);
    setBoard(emptyBoard);
    boardRef.current = emptyBoard;
    setCurrentTurn(starter);
    currentTurnRef.current = starter;
    setGameStatus('IN_PROGRESS');
    gameStatusRef.current = 'IN_PROGRESS';
    setWinner(null);
    setWinningLine(null);
    setRoundNumber((r) => r + 1);
    setTurnCountdown(15);
  }, [startingTurn]);

  // Restart match series from scratch
  const restartSeries = useCallback(() => {
    const emptyBoard = Array(9).fill(null);
    setBoard(emptyBoard);
    boardRef.current = emptyBoard;
    setStartingTurn('X');
    setCurrentTurn('X');
    currentTurnRef.current = 'X';
    setGameStatus('IN_PROGRESS');
    gameStatusRef.current = 'IN_PROGRESS';
    setWinner(null);
    setWinningLine(null);
    setP1SeriesScore(0);
    p1SeriesScoreRef.current = 0;
    setP2SeriesScore(0);
    p2SeriesScoreRef.current = 0;
    setRoundNumber(1);
    setMatchSeconds(0);
    matchSecondsRef.current = 0;
    setMoveHistory([]);
    moveHistoryRef.current = [];
    setTurnCountdown(15);
  }, []);

  // Forfeit
  const forfeit = useCallback(() => {
    if (gameStatusRef.current !== 'IN_PROGRESS') return;
    setGameStatus('FINISHED');
    gameStatusRef.current = 'FINISHED';
    const activePlayer = currentTurnRef.current;
    const opponent = activePlayer === 'X' ? 'O' : 'X';
    setWinner(opponent);
    playDefeatSound();

    if (onGameEndRef.current) {
      onGameEndRef.current({
        result: 'LOSS',
        winner: opponent,
        board: boardRef.current,
        moves: moveHistoryRef.current.length,
        durationSeconds: matchSecondsRef.current,
        p1Score: p1SeriesScoreRef.current,
        p2Score: p2SeriesScoreRef.current + 1,
      });
    }
  }, []);

  const formattedMatchTime = `${String(Math.floor(matchSeconds / 60)).padStart(2, '0')}:${String(matchSeconds % 60).padStart(2, '0')}`;

  return {
    board,
    currentTurn,
    startingTurn,
    gameStatus,
    winner,
    winningLine,
    moveHistory,
    p1SeriesScore,
    p2SeriesScore,
    roundNumber,
    turnCountdown,
    matchSeconds,
    formattedMatchTime,
    recommendedMove,
    isLocal2P,
    isAiMode,
    makeMove,
    resetRound,
    restartSeries,
    forfeit,
  };
}
