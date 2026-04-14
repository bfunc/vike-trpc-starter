import Link from '$src/components/Link';

export default function IndexPage() {
  return (
    <section className="home-shell">
      <div className="home-card">
        <p className="home-card__eyebrow">Starter template</p>
        <h1>One working vertical slice, ready to extend.</h1>
        <p>
          The example app ships with a full Users CRUD feature backed by SQLite, tRPC, Zod, React Query,
          and AG Grid Community.
        </p>
        <div className="home-card__actions">
          <Link className="home-card__primary-link" href="/users">
            Open Users workspace
          </Link>
        </div>
      </div>
    </section>
  );
}
