import { HealthStatus } from "./HealthStatus";

export default function Home() {
  return (
    <main>
      <h1>Trust Issues</h1>
      <p>Foundation shell. Convex health:</p>
      <HealthStatus />
    </main>
  );
}
