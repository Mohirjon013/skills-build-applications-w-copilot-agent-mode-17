import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface Team {
  name: string;
  mascot: string;
  members: string[];
}

interface TeamsResponse {
  teams: Team[];
}

export default function Teams() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<TeamsResponse>('/api/teams')
      .then((data) => setTeams(data.teams))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <section>
        <h2>Teams</h2>
        <div role="alert">Unable to load teams: {error}</div>
      </section>
    );
  }

  if (teams === null) {
    return (
      <section>
        <h2>Teams</h2>
        <p role="status">Loading teams…</p>
      </section>
    );
  }

  if (teams.length === 0) {
    return (
      <section>
        <h2>Teams</h2>
        <p>No teams found yet.</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Teams</h2>
      <ul className="list-group">
        {teams.map((t, i) => (
          <li key={i} className="list-group-item">
            <strong>{t.name}</strong> — {t.mascot} ({t.members.length} members)
          </li>
        ))}
      </ul>
    </section>
  );
}
