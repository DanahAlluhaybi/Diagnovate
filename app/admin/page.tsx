"use client";
import { useEffect, useState } from "react";

type RequestType = {
  id: number;
  name: string;
  email: string;
  status: string;
};

export default function AdminDashboard() {
  const [requests, setRequests] = useState<RequestType[]>([]);

  useEffect(() => {
    fetch("/api/requests")
      .then(res => res.json())
      .then(data => setRequests(data));
  }, []);

  const pendingCount = requests.filter(r => r.status === "Pending").length;
  const approvedCount = requests.filter(r => r.status === "Approved").length;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Admin Dashboard</h1>

      <div style={styles.cardsContainer}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Pending Requests</h2>
          <p style={styles.number}>{pendingCount}</p>
          <a href="/admin/requests" style={styles.link}>
            View Requests
          </a>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Active Doctors</h2>
          <p style={styles.number}>{approvedCount}</p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Total Requests</h2>
          <p style={styles.number}>{requests.length}</p>
        </div>
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    minHeight: "100vh",
    padding: "40px",
    background: "linear-gradient(135deg, #e3f2f9, #ffffff)",
    fontFamily: "sans-serif",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "40px",
    color: "#1a2b3c",
  },
  cardsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "25px",
  },
  card: {
    background: "white",
    padding: "30px",
    borderRadius: "18px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  },
  cardTitle: {
    fontSize: "18px",
    marginBottom: "15px",
    color: "#2b7e9b",
  },
  number: {
    fontSize: "40px",
    fontWeight: "bold",
    color: "#1a2b3c",
  },
  link: {
    marginTop: "10px",
    display: "inline-block",
    color: "#2b7e9b",
    fontWeight: "500",
    textDecoration: "none",
  },
};

