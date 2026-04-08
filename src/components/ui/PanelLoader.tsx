export default function PanelLoader() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 4,
      }}
    >
      <div className="animate-pulse-dot" style={{ width: 12, height: 12, background: 'var(--green)', borderRadius: '50%', marginBottom: 12 }} />
      <span style={{ color: 'var(--text-ghost)', fontSize: 10, letterSpacing: 1, fontFamily: 'var(--font-mono)' }}>
        INITIALIZING FEED...
      </span>
    </div>
  );
}
