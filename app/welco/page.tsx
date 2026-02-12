"use client";

export default function WelcoPage() {
    return (
        <main
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(120deg, #eef4ff, #f6fff4)",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <div
                style={{
                    width: "80%",
                    maxWidth: "1100px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "40px",
                }}
            >

                <div>
                    <h1
                        style={{
                            fontSize: "70px",
                            fontWeight: "800",
                            marginBottom: "30px",
                        }}
                    >
                        Diagnose Cancer
                    </h1>

                    <div style={{ display: "flex", gap: "15px" }}>
                        <button
                            style={{
                                padding: "12px 30px",
                                backgroundColor: "#2563eb",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "16px",
                                cursor: "pointer",
                            }}
                        >
                            Login & Try
                        </button>

                        <button
                            style={{
                                padding: "12px 30px",
                                backgroundColor: "transparent",
                                border: "2px solid #2563eb",
                                color: "#2563eb",
                                borderRadius: "6px",
                                fontSize: "16px",
                                cursor: "pointer",
                            }}
                        >
                            Contact Us
                        </button>
                    </div>
                </div>


                <div
                    style={{
                        width: "320px",
                        height: "320px",
                        borderRadius: "50%",
                        backgroundColor: "#e5e7eb",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: "20px",
                        fontWeight: "600",
                        color: "#555",
                    }}
                >
                    AI Image
                </div>
            </div>
        </main>
    );
}