export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="quiz-page">
      <div className="quiz-max-width">

        {/* HEADER */}
        <div style={{ marginBottom: 20 }}>
          <h1 className="quiz-title">Admin Panel</h1>
        </div>

        {/* NAV */}
        <nav className="quiz-row" style={{ marginBottom: 30 }}>
          <a href="/admin/events" className="quiz-btn">Events</a>
          <a href="/admin/schools" className="quiz-btn">Schools</a>
          <a href="/admin/questions" className="quiz-btn">Questions</a>
        </nav>

        {/* CONTENT */}
        <div className="quiz-card">
          {children}
        </div>

      </div>
    </div>
  );
}
