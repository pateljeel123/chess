import React, { useState, useRef, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

function App() {
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState([]);
  const [mode, setMode] = useState("Human");
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [preMove, setPreMove] = useState(null);
  const [highlightSquares, setHighlightSquares] = useState([]);
  const audioRef = useRef(null);

  function safeGameMutate(modify) {
    setGame((g) => {
      const updatedGame = { ...g };
      modify(updatedGame);
      return updatedGame;
    });
  }

  function onDrop(source, target) {
    if (gameOver) return false;

    let move = null;
    safeGameMutate((game) => {
      move = game.move({
        from: source,
        to: target,
        promotion: "q",
      });
    });

    setHighlightSquares([]);

    if (move === null) {
      if (game.turn() !== move?.color) {
        setPreMove({ from: source, to: target });
        return true;
      }
      return false;
    }

    setMoveHistory([...moveHistory, move.san]);

    if (game.game_over()) {
      handleGameOver();
      return true;
    }

    if (preMove) executePreMove();

    if (mode === "Bot") {
      setTimeout(makeBotMove, 500);
    }

    return true;
  }

  function executePreMove() {
    if (!preMove) return;

    let move = null;
    safeGameMutate((game) => {
      move = game.move({
        from: preMove.from,
        to: preMove.to,
        promotion: "q",
      });
    });

    if (move) {
      setMoveHistory([...moveHistory, move.san]);
    }

    setPreMove(null);

    if (game.game_over()) {
      handleGameOver();
    }
  }

  function makeBotMove() {
    const possibleMoves = game.moves();
    if (possibleMoves.length === 0) return;

    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    const botMove = possibleMoves[randomIndex];
    safeGameMutate((game) => {
      game.move(botMove);
    });

    setMoveHistory([...moveHistory, botMove]);

    if (preMove) executePreMove();

    if (game.game_over()) {
      handleGameOver();
    }
  }

  function handleGameOver() {
    setGameOver(true);

    if (game.in_checkmate()) {
      // If checkmate, the loser is the current turn player
      setWinner(game.turn() === "w" ? "Black" : "White");
    } else if (game.in_stalemate() || game.in_draw()) {
      setWinner("Draw");
    } else {
      setWinner("Unknown");
    }

    if (audioRef.current) audioRef.current.pause();
  }

  function resetGame() {
    setGame(new Chess());
    setMoveHistory([]);
    setGameOver(false);
    setWinner(null);
    setPreMove(null);
    setHighlightSquares([]);
    if (audioRef.current) audioRef.current.play();
  }

  function highlightLegalMoves(square) {
    if (gameOver) return;

    const legalMoves = game.moves({ square, verbose: true });
    const squaresToHighlight = legalMoves.map((move) => move.to);
    setHighlightSquares(squaresToHighlight);
  }

  function customSquareStyles() {
    const styles = {};
    highlightSquares.forEach((sq) => {
      styles[sq] = {
        backgroundColor: "rgba(0, 255, 0, 0.5)",
        borderRadius: "50%",
      };
    });
    return styles;
  }

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  }, [mode]);

  return (
    <div className="app">
      <audio ref={audioRef} src="/path-to-your-audio-file/background.mp3" loop />
      <div className="header">
        <h1>Chess Game</h1>
        <div className="controls">
          <button onClick={() => setMode("Human")}>Play with Human</button>
          <button onClick={() => setMode("Bot")}>Play with Bot</button>
          <button onClick={resetGame} className="reset-btn">
            Reset Game
          </button>
        </div>
      </div>

      {gameOver && (
        <div className="game-over-card">
          <h2>Game Over!</h2>
          <p>
            {winner === "Draw"
              ? "The game ended in a draw!"
              : `Winner: ${winner}`}
          </p>
          <button onClick={resetGame} className="new-game-btn">
            Start New Match
          </button>
        </div>
      )}

      <div className="chessboard-container">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          onSquareClick={highlightLegalMoves}
          customSquareStyles={customSquareStyles()}
          className="chessboard"
        />
        <div className="info-panel">
          <h3>Game Info</h3>
          <p>
            Mode: <strong>{mode}</strong>
          </p>
          {gameOver ? (
            <p>
              <strong>Game Over!</strong> Winner: {winner}
            </p>
          ) : (
            <p>Current Turn: {game.turn() === "w" ? "White" : "Black"}</p>
          )}
          {preMove && (
            <p>
              Scheduled Pre-Move: {preMove.from} → {preMove.to}
            </p>
          )}
          <h3>Move History</h3>
          <div className="move-history">
            {moveHistory.map((move, index) => (
              <div key={index}>
                {index + 1}. {move}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
