export default function Loading() {
  return (
    <div className="page-body">
      <div>
        <div style={{ marginBottom: 28 }}>
          <div className="skeleton" style={{ height: 36, width: 200, marginBottom: 10 }} />
          <div className="skeleton" style={{ height: 16, width: 280 }} />
        </div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr' }}>
              <div className="skeleton" style={{ minHeight: 110 }} />
              <div style={{ padding: '16px 20px' }}>
                <div className="skeleton" style={{ height: 22, width: '60%', marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 14, width: '50%' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <aside>
        <div className="sidebar-widget">
          <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 14 }} />
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 14, marginBottom: 8 }} />)}
        </div>
      </aside>
    </div>
  );
}
