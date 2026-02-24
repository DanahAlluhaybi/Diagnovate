"use client";
import { useState } from "react";

export default function AdminRequests() {
  const [requests, setRequests] = useState([
    { id: 1, name: "Dr. Ahmed Khaled", email: "ahmed@mail.com", status: "Pending" },
    { id: 2, name: "Dr. Sara Ali", email: "sara@mail.com", status: "Pending" },
  ]);

  const handleApprove = (id: number) => {
    setRequests(prev =>
      prev.map(req =>
        req.id === id ? { ...req, status: "Approved" } : req
      )
    );
  };

  const handleReject = (id: number) => {
    setRequests(prev =>
      prev.map(req =>
        req.id === id ? { ...req, status: "Rejected" } : req
      )
    );
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Doctor Registration Requests</h1>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Doctor Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} style={styles.tr}>
                <td style={styles.td}>{req.name}</td>
                <td style={styles.td}>{req.email}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.badge,
                      background:
                        req.status === "Approved"
                          ? "#dcfce7"
                          : req.status === "Rejected"
                          ? "#fee2e2"
                          : "#fef9c3",
                      color:
                        req.status === "Approved"
                          ? "#166534"
                          : req.status === "Rejected"
                          ? "#991b1b"
                          : "#854d0e",
                    }}
                  >
                    {req.status}
                  </span>
                </td>
                <td style={styles.td}>
                  {req.status === "Pending" && (
                    <div style={styles.actions}>
                      <button
                        style={styles.approveBtn}
                        onClick={() => handleApprove(req.id)}
                      >
                        Approve
                      </button>
                      <button
                        style={styles.rejectBtn}
                        onClick={() => handleReject(req.id)}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    fontSize: "28px",
    marginBottom: "30px",
    fontWeight: "bold",
    color: "#1a2b3c",
  },
  card: {
    background: "white",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 15px 35px rgba(0,0,0,0.08)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "15px",
    borderBottom: "2px solid #f0f4f9",
    color: "#5e6f7e",
    fontSize: "14px",
  },
  tr: {
    borderBottom: "1px solid #f0f4f9",
  },
  td: {
    padding: "15px",
    fontSize: "14px",
    color: "#1a2b3c",
  },
  badge: {
    padding: "6px 14px",
    borderRadius: "30px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  actions: {
    display: "flex",
    gap: "10px",
  },
  approveBtn: {
    background: "#16a34a",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  rejectBtn: {
    background: "#dc2626",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
  },
};
