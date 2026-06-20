 "use client";

import { useEffect, useState } from "react";

type RoundResult = {
  target: number;
  actual: number;
  error: number;
};

export default function Home() {
  const startDate = new Date("2025-01-01");
  const today = new Date();

  const dayNumber = Math.floor(
    (today.getTime() - startDate.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const storageKey = `daily-timer-${dayNumber}`;

  function seededRandom(seed: number) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  function dailyTarget(seed: number) {
    return Math.floor((1 + seededRandom(seed) * 9) * 100) / 100;
  }

  const targets = [
    dailyTarget(dayNumber + 1),
    dailyTarget(dayNumber + 2),
    dailyTarget(dayNumber + 3),
  ];

  const [round, setRound] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [saved, setSaved] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem(storageKey);
    if (existing) {
      setSaved(JSON.parse(existing));
    }
  }, [storageKey]);

  const target = targets[round];

  const startGame = () => {
    setResult(null);
    setStartTime(Date.now());
  };

  const stopGame = () => {
    if (!startTime) return;

    const elapsed = (Date.now() - startTime) / 1000;
    const error = Math.abs(elapsed - target);

    setResult(elapsed);
    setStartTime(null);

    setScores((prev) => [...prev, error]);
    setRoundResults((prev) => [
      ...prev,
      { target, actual: elapsed, error },
    ]);
  };

  const totalScore = scores.reduce((a, b) => a + b, 0);

  const titleForScore = (score: number) => {
    if (score <= 0.15) return "👑 Time Wizard";
    if (score <= 0.30) return "🔥 Incredible";
    if (score <= 0.60) return "🎯 Excellent";
    if (score <= 1.0) return "🟩 Great Job";
    if (score <= 2.0) return "👍 Solid Run";
    return "😅 Better Luck Tomorrow";
  };

  const finished =
    round === 2 &&
    result !== null &&
    roundResults.length === 3;

  useEffect(() => {
    if (!finished) return;

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        totalScore,
        roundResults,
        title: titleForScore(totalScore),
      })
    );
  }, [finished, totalScore, roundResults, storageKey]);

  const shareResults = (score: number, results: RoundResult[]) => {
    const emojis = results
      .map((r) =>
        r.error <= 0.05
          ? "🟩"
          : r.error <= 0.15
          ? "🟨"
          : r.error <= 0.3
          ? "🟧"
          : "🟥"
      )
      .join("");

    navigator.clipboard.writeText(
      `🎯 Daily Timer #${dayNumber}

${emojis}

Total Error: ${score.toFixed(2)}s

${titleForScore(score)}`
    );

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (saved) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <p style={styles.small}>DAILY TIMER #{dayNumber}</p>
          <h1 style={styles.title}>🎯 Daily Timer</h1>
          <h2>Already Completed</h2>
          <p style={styles.muted}>Come back tomorrow for a new challenge.</p>

          <div style={styles.score}>
            {saved.totalScore.toFixed(2)}s
          </div>

          <h3>{saved.title}</h3>

          <button
            style={styles.greenButton}
            onClick={() =>
              shareResults(saved.totalScore, saved.roundResults)
            }
          >
            Share Results
          </button>

          {copied && <p>✅ Copied!</p>}
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <p style={styles.small}>DAILY TIMER #{dayNumber}</p>

        <h1 style={styles.title}>🎯 Daily Timer</h1>

          <div
  style={{
    background: "#0f172a",
    borderRadius: "16px",
    padding: "16px",
    marginBottom: "24px",
    border: "1px solid rgba(255,255,255,0.08)",
  }}
>
  <p
    style={{
      color: "#cbd5e1",
      margin: 0,
      lineHeight: "1.6",
    }}
  >
    Press <strong>START</strong>, wait until you
    think the target time has passed, then press
    <strong> STOP</strong>.
    <br />
    <br />
    Complete all 3 rounds and get the lowest
    total error possible.
  </p>
</div>
        {!finished && (
          <div style={styles.progress}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  ...styles.dot,
                  opacity: i <= round ? 1 : 0.3,
                }}
              />
            ))}
          </div>
        )}

        {!finished && (
          <div style={styles.targetCard}>
            <p style={styles.muted}>Today's Target</p>
            <div style={styles.target}>
              {target.toFixed(2)}s
            </div>
          </div>
        )}

        {!startTime && result === null && !finished && (
          <button style={styles.greenButton} onClick={startGame}>
            START
          </button>
        )}

        {startTime && (
          <button style={styles.redButton} onClick={stopGame}>
            STOP
          </button>
        )}

        {result !== null && !finished && (
          <div>
            <div>
  <h2>You stopped at {result.toFixed(2)}s</h2>

  <p style={{ color: "#94a3b8", marginBottom: 20 }}>
    Target: {target.toFixed(2)}s
  </p>

  <h2>
    Error: {Math.abs(result - target).toFixed(2)}s
  </h2>

  <button
    style={styles.secondaryButton}
    onClick={() => {
      setRound(round + 1);
      setResult(null);
    }}
  >
    Next Round
  </button>
</div>

            <button
              style={styles.secondaryButton}
              onClick={() => {
                setRound(round + 1);
                setResult(null);
              }}
            >
              Next Round
            </button>
          </div>
        )}

        {finished && (
          <div>
            <h2 style={{ fontSize: 30 }}>
              {titleForScore(totalScore)}
            </h2>

            {roundResults.map((r, i) => (
              <div key={i} style={styles.resultCard}>
                <strong>Round {i + 1}</strong>
                <p>🎯 {r.target.toFixed(2)}s</p>
                <p>⏱️ {r.actual.toFixed(2)}s</p>
                <p>Error: {r.error.toFixed(2)}s</p>
              </div>
            ))}

            <div style={styles.score}>
              {totalScore.toFixed(2)}s
            </div>

            <button
              style={styles.greenButton}
              onClick={() =>
                shareResults(totalScore, roundResults)
              }
            >
              Share Results
            </button>

            {copied && <p>✅ Copied!</p>}
          </div>
        )}
      </div>
    </main>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg,#020617 0%,#0f172a 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    color: "white",
    fontFamily: "system-ui",
  },
  card: {
    width: "100%",
    maxWidth: 600,
    background:
      "linear-gradient(180deg,#1e293b 0%,#172033 100%)",
    borderRadius: 28,
    padding: 40,
    textAlign: "center",
    boxShadow: "0 25px 60px rgba(0,0,0,.45)",
    border: "1px solid rgba(255,255,255,.08)",
  },
  title: {
    fontSize: 48,
    fontWeight: 800,
    marginBottom: 10,
  },
  small: {
    color: "#cbd5e1",
    letterSpacing: 1,
  },
  muted: {
    color: "#94a3b8",
  },
  progress: {
    display: "flex",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: "#22c55e",
  },
  targetCard: {
    background: "#0f172a",
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
  },
  target: {
    fontSize: 72,
    fontWeight: 800,
  },
  greenButton: {
    background: "linear-gradient(180deg,#22c55e,#16a34a)",
    color: "white",
    border: "none",
    borderRadius: 16,
    padding: "18px 42px",
    fontWeight: 800,
    cursor: "pointer",
  },
  redButton: {
    background: "linear-gradient(180deg,#ef4444,#dc2626)",
    color: "white",
    border: "none",
    borderRadius: 16,
    padding: "18px 42px",
    fontWeight: 800,
    cursor: "pointer",
  },
  secondaryButton: {
    background: "#334155",
    color: "white",
    border: "none",
    borderRadius: 14,
    padding: "14px 24px",
    cursor: "pointer",
  },
  resultCard: {
    background: "#0f172a",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  score: {
    fontSize: 52,
    fontWeight: 800,
    margin: 20,
  },
};
