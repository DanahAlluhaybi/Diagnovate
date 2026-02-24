"use client";
import { useRouter } from "next/navigation";

export default function RolePage() {
  const router = useRouter();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome to Diagnovate</h1>
        <p style={styles.subtitle}>
          Please select how you would like to continue
        </p>

        <div style={styles.grid}>
          {/* Admin Card */}
          <div
            style={styles.roleCard}
            onClick={() => router.push("/admin")}
          >
            <div style={styles.icon}>🛡️</div>
            <h2 style={styles.roleTitle}>Administrator</h2>
            <p style={styles.roleDesc}>
              Manage doctors, approve accounts, and monitor system activity.
            </p>
          </div>

          {/* Doctor Card */}
          <div
            style={styles.roleCard}
            onClick={() => router.push("/doctor")}
          >
            <div style={styles.icon}>🩺</div>
            <h2 style={styles.roleTitle}>Doctor</h2>
            <p style={styles.roleDesc}>
              Access patients, manage appointments, and update records.
            </p>
          </div>
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
    background: "linear-gradient(135deg, #e0f7fa, #ffffff)",
    fontFamily: "sans-serif",
    padding: "20px",
  },
  card: {
    background: "white",
    padding: "60px",
    borderRadius: "24px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
    textAlign: "center",
    maxWidth: "900px",
    width: "100%",
  },
  title: {
    fontSize: "34px",
    fontWeight: "bold",
    color: "#1a2b3c",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#6b7c8a",
    marginBottom: "40px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "30px",
  },
  roleCard: {
    background: "#f8fafc",
    padding: "40px",
    borderRadius: "20px",
    cursor: "pointer",
    transition: "0.3s",
    border: "1px solid #e6edf4",
  },
  roleTitle: {
    marginTop: "15px",
    fontSize: "20px",
    color: "#2b7e9b",
  },
  roleDesc: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#5e6f7e",
  },
  icon: {
    fontSize: "40px",
  },
};