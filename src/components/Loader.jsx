function Loader() {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
      <p>Loading...</p>
    </div>
  );
}

const styles = {
  container: {
    height: "60vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid rgba(255,255,255,0.08)",
    borderTop: "4px solid var(--accent)",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  }
};

// CSS animation inject
const styleSheet = document.styleSheets[0];
const keyframes =
  `@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }`;

styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

export default Loader;
