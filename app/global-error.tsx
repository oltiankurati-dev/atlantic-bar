"use client";

// Replaces the root layout when it fails, so no global CSS or fonts load here.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  console.error(error);
  return (
    <html lang="de">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0806",
          color: "#efe6d3",
          fontFamily: "Georgia, serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <title>Atlantic Lounge Bar</title>
        <div>
          <h1 style={{ fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Etwas ist schiefgelaufen
          </h1>
          <p style={{ opacity: 0.7 }}>Something went wrong. Please try again.</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: 24,
              padding: "12px 28px",
              background: "#c9a25a",
              color: "#0a0806",
              border: "none",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Erneut versuchen / Try again
          </button>
        </div>
      </body>
    </html>
  );
}
