import "./admin.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <div className="admin-wrapper">{children}</div>
      </body>
    </html>
  );
}
