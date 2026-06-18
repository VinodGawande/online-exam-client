function Footer() {
  return (
    <footer style={styles.footer}>
      <p style={styles.text}>Copyright 2026 Online Examination Platform</p>
      <p style={styles.subtext}>Built with MERN for secure exam workflows</p>
    </footer>
  );
}

const styles = {
  footer: {
    marginTop: "60px",
    padding: "20px",
    textAlign: "center",
    backgroundColor: "var(--surface)",
    borderTop: "1px solid var(--border)"
  },
  text: {
    fontWeight: "bold",
    color: "var(--text)"
  },
  subtext: {
    fontSize: "14px",
    color: "var(--muted)"
  }
};

export default Footer;
