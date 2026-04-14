export default function IndexPage() {
  return (
    <div style={{ textAlign: 'center', paddingTop: 80 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>Enterprise Starter</h1>
      <p style={{ color: '#555', marginBottom: 32 }}>
        A production-ready foundation for enterprise internal tools and admin panels.
      </p>
      <a
        href="/users"
        style={{
          display: 'inline-block',
          padding: '12px 28px',
          background: '#1e293b',
          color: '#fff',
          borderRadius: 8,
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: 15
        }}
      >
        View Users →
      </a>
    </div>
  );
}
