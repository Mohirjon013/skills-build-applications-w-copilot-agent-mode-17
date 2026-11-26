import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface LeaderboardEntry {
  teamName: string;
  totalPoints: number;
  rank: number;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<LeaderboardResponse>('/api/leaderboard')
      .then((data) => setLeaderboard(data.leaderboard))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <section>
        <h2>Leaderboard</h2>
        <div role="alert">Unable to load leaderboard: {error}</div>
      </section>
    );
  }

  if (leaderboard === null) {
    return (
      <section>
        <h2>Leaderboard</h2>
        <p role="status">Loading leaderboard…</p>
      </section>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <section>
        <h2>Leaderboard</h2>
        <p>No leaderboard rankings available yet.</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Leaderboard</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Team</th>
            <th>Total Points</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry) => (
            <tr key={entry.rank}>
              <td>{entry.rank}</td>
              <td>{entry.teamName}</td>
              <td>{entry.totalPoints}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
