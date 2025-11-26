import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Board from "../components/Board.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../utils/api.js";
import { LEVELS, calculateWinner, isBoardFull } from "../utils/tictactoe.js";

const emptyBoard = Array(9).fill(null);

const GamePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [board, setBoard] = useState(emptyBoard);
  const [xIsNext, setXIsNext] = useState(true);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [levelResults, setLevelResults] = useState([]);
  const [status, setStatus] = useState("Your move!");
  const [winningLine, setWinningLine] = useState(null);
  const [tournamentWinner, setTournamentWinner] = useState(null);
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);

  const levelInfo = useMemo(() => LEVELS[currentLevel], [currentLevel]);

  useEffect(() => {
    api
      .get("/game/history")
      .then(({ data }) => setHistory(data.history))
      .catch(() => setHistory([]));
  }, []);

  useEffect(() => {
    if (!xIsNext && !tournamentWinner) {
      const timeout = setTimeout(() => {
        const move = levelInfo.strategy([...board]);
        if (move !== null) {
          handleMove(move);
        }
      }, currentLevel * 200 + 400);
      return () => clearTimeout(timeout);
    }
  }, [xIsNext, board, levelInfo, currentLevel, tournamentWinner]);

  const handleMove = (index) => {
    if (board[index] || calculateWinner(board).winner || tournamentWinner)
      return;

    const nextBoard = board.slice();
    nextBoard[index] = xIsNext ? "X" : "O";
    setBoard(nextBoard);
    setXIsNext(!xIsNext);

    const { winner, line } = calculateWinner(nextBoard);
    if (winner || isBoardFull(nextBoard)) {
      concludeLevel(nextBoard, winner, line);
    } else {
      setWinningLine(null);
      setStatus(xIsNext ? "AI thinking..." : "Your move!");
    }
  };

  const concludeLevel = (finalBoard, winner, line) => {
    const userWon = winner === "X";
    const aiWon = winner === "O";
    setWinningLine(line);

    if (winner) {
      setStatus(winner === "X" ? "You won this level!" : "AI took this round.");
    } else {
      setStatus("Draw! No points this round.");
    }

    const newResult = {
      level: levelInfo.level,
      userWon,
      aiDifficulty: levelInfo.label,
    };

    setLevelResults((prev) => {
      const updated = [...prev, newResult];
      if (updated.length === LEVELS.length) {
        finalizeTournament(updated);
      } else {
        setTimeout(() => {
          setBoard(emptyBoard);
          setXIsNext(true);
          setWinningLine(null);
          setStatus("New level! Your move.");
          setCurrentLevel(updated.length);
        }, 1200);
      }
      return updated;
    });
  };

  const finalizeTournament = async (results) => {
    const totalUserWins = results.filter((r) => r.userWon).length;
    const totalAiWins = results.length - totalUserWins;
    let champion = "Tournament ended in a draw.";
    if (totalUserWins > totalAiWins) champion = "You won the tournament!";
    if (totalAiWins > totalUserWins) champion = "AI won the tournament.";
    setTournamentWinner(champion);
    setStatus("Tournament complete");

    setSaving(true);
    try {
      const { data } = await api.post("/game/result", { levels: results });
      setHistory((prev) => [data.result, ...prev].slice(0, 10));
    } catch (error) {
      console.error("Failed to save game", error);
    } finally {
      setSaving(false);
    }
  };

  const resetTournament = () => {
    setBoard(emptyBoard);
    setXIsNext(true);
    setCurrentLevel(0);
    setLevelResults([]);
    setWinningLine(null);
    setStatus("Tournament reset. Your move!");
    setTournamentWinner(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <div>
          <h2>Welcome, {user?.name}</h2>
          <p>Beat the AI in most of the 5 rounds to become champion.</p>
        </div>
        <button onClick={handleLogout} style={styles.logout}>
          Logout
        </button>
      </header>

      <section style={styles.gameSection}>
        <div style={styles.levelInfo}>
          <h3>Level {levelInfo.level}</h3>
          <p>{status}</p>
          <p>
            Round {currentLevel + 1} of {LEVELS.length}
          </p>
        </div>
        <Board
          squares={board}
          onClick={handleMove}
          disabled={!xIsNext || Boolean(tournamentWinner)}
          winningLine={winningLine}
        />
        {tournamentWinner && (
          <div style={styles.resultBanner}>
            <strong>{tournamentWinner}</strong>
            <button onClick={resetTournament}>Play again</button>
          </div>
        )}
      </section>

      <section style={styles.summary}>
        <div>
          <h3>Level results</h3>
          <ul style={styles.list}>
            {levelResults.map((level) => (
              <li key={level.level}>
                Level {level.level} –{" "}
                {level.userWon ? "You won 🟢" : "AI won 🔴"}
              </li>
            ))}
            {!levelResults.length && <li>Finish rounds to see results.</li>}
          </ul>
        </div>
        <div>
          <h3>Recent tournaments</h3>
          <ul style={styles.list}>
            {history.length === 0 && <li>No tournaments saved yet.</li>}
            {history.map((entry) => (
              <li key={entry._id}>
                {new Date(entry.createdAt).toLocaleString()} –{" "}
                {entry.champion === "player"
                  ? "You won 🎉"
                  : entry.champion === "ai"
                  ? "AI won 🤖"
                  : "Draw ⚖️"}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {saving && <p>Saving tournament...</p>}
    </div>
  );
};

const styles = {
  wrapper: {
    maxWidth: "960px",
    margin: "0 auto",
    padding: "2rem 1rem 4rem",
    color: "#0f172a",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    gap: "1rem",
  },
  logout: {
    background: "#f43f5e",
    color: "#fff",
    border: "none",
    padding: "0.75rem 1.5rem",
    borderRadius: "999px",
    cursor: "pointer",
  },
  gameSection: {
    background: "#fff",
    borderRadius: "1.5rem",
    padding: "2rem",
    boxShadow: "0 20px 60px rgba(15,23,42,0.15)",
    textAlign: "center",
  },
  levelInfo: {
    marginBottom: "1.5rem",
  },
  resultBanner: {
    marginTop: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    alignItems: "center",
  },
  summary: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
    marginTop: "2rem",
  },
  list: {
    listStyle: "none",
    padding: "1rem",
    margin: 0,
    background: "#fff",
    borderRadius: "1rem",
    boxShadow: "0 10px 30px rgba(15,23,42,0.1)",
  },
};

export default GamePage;
