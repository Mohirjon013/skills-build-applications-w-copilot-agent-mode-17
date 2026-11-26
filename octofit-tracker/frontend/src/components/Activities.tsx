import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface Activity {
  type: string;
  minutes: number;
  points: number;
}

interface ActivitiesResponse {
  activities: Activity[];
}

export default function Activities() {
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<ActivitiesResponse>('/api/activities')
      .then((data) => setActivities(data.activities))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <section>
        <h2>Activities</h2>
        <div role="alert">Unable to load activities: {error}</div>
      </section>
    );
  }

  if (activities === null) {
    return (
      <section>
        <h2>Activities</h2>
        <p role="status">Loading activities…</p>
      </section>
    );
  }

  if (activities.length === 0) {
    return (
      <section>
        <h2>Activities</h2>
        <p>No activities recorded yet.</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Activities</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Minutes</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((a, i) => (
            <tr key={i}>
              <td>{a.type}</td>
              <td>{a.minutes}</td>
              <td>{a.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
