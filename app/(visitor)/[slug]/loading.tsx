export default function Loading() {
  return (
    <div className="page-body">
      <article>
        <div className="skeleton" style={{ height: 40, width: '70%', marginBottom: 22 }} />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="skeleton" style={{ height: 16, marginBottom: 12, width: i === 3 ? '80%' : '100%' }} />
        ))}
      </article>
      <aside>
        <div className="sidebar-widget">
          <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 14 }} />
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 14, marginBottom: 8 }} />)}
        </div>
      </aside>
    </div>
  );
}
