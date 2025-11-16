export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
      <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
        <h1>Astropathshala Quiz Admin</h1>
        <nav style={{ marginBottom: "20px" }}>
          <a href="/admin/schools" style={{ marginRight: "20px" }}>Schools</a>
          <a href="/admin/events" style={{ marginRight: "20px" }}>Events</a>
        </nav>
  
        <div>
          {children}
        </div>
      </div>
    );
  }
  