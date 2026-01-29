export default function Page() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9fafb",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "2rem",
          borderRadius: "12px",
          background: "white",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
          🚧 Page Under Construction
        </h1>
        <p style={{ color: "#6b7280" }}>
          This page is a placeholder. Content coming soon.
        </p>
      </div>
    </main>
  );
}
