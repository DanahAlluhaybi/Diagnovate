export default function PendingApproval() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>📩</div>

        <h1 style={styles.title}>Application Submitted</h1>

        <p style={styles.text}>
          Your registration request has been received.
        </p>

        <p style={styles.text}>
          Please wait for an approval email from the administrator.
        </p>

        <div style={styles.statusBox}>
          ⏳ Status: Pending Review
        </div>
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #e3f2f9, #ffffff)",
    fontFamily: "sans-serif",
  },
  card: {
    background: "white",
    padding: "60px",
    borderRadius: "24px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
    textAlign: "center",
    maxWidth: "500px",
  },
  icon: {
    fontSize: "50px",
    marginBottom: "20px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#1a2b3c",
  },
  text: {
    fontSize: "15px",
    color: "#5e6f7e",
    marginBottom: "10px",
  },
  statusBox: {
    marginTop: "20px",
    padding: "12px",
    background: "#fef9c3",
    borderRadius: "12px",
    fontWeight: "bold",
    color: "#854d0e",
  },
};
