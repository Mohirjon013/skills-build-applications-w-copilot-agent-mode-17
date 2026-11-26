import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface Suggestion {
  title: string;
  focus?: string;
  reason: string;
  minutes?: number;
  difficulty?: string;
}

interface SuggestionsResponse {
  suggestions: Suggestion[];
}

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<SuggestionsResponse>('/api/workouts/suggestions/mona@example.com')
      .then((data) => setSuggestions(data.suggestions))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <section>
        <h2>Workout suggestions</h2>
        <div role="alert">Unable to load workout suggestions: {error}</div>
      </section>
    );
  }

  if (suggestions === null) {
    return (
      <section>
        <h2>Workout suggestions</h2>
        <p role="status">Loading workout suggestions…</p>
      </section>
    );
  }

  if (suggestions.length === 0) {
    return (
      <section>
        <h2>Workout suggestions</h2>
        <p>No workout suggestions available yet.</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Workout suggestions</h2>
      <ul className="list-group">
        {suggestions.map((s, i) => (
          <li key={i} className="list-group-item">
            <strong>{s.title}</strong>
            {s.focus && <span className="badge bg-primary ms-2">{s.focus}</span>}
            <p className="mb-0 mt-1">{s.reason}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
