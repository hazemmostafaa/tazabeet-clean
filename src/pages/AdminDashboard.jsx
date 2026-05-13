import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [tab, setTab] = useState("complaints");
    const [complaints, setComplaints] = useState([]);
    const [logs, setLogs] = useState([]);
    const [workers, setWorkers] = useState([]);

    const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
    };

    async function loadAdminData() {
        try {
            const [complaintsRes, logsRes, workersRes] = await Promise.all([
                fetch("https://tazabeet-backend.vibenest.net/api/complaints/admin/all", { headers }),
                fetch("https://tazabeet-backend.vibenest.net/api/admin/audit-logs", { headers }),
                fetch("https://tazabeet-backend.vibenest.net/api/admin/workers", { headers }),
            ]);

            const complaintsData = await complaintsRes.json();
            const logsData = await logsRes.json();
            const workersData = await workersRes.json();

            if (complaintsRes.ok) setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
            if (logsRes.ok) setLogs(Array.isArray(logsData) ? logsData : []);
            if (workersRes.ok) setWorkers(Array.isArray(workersData) ? workersData : []);
        } catch (err) {
            console.log(err);
            toast.error("Failed to load admin data");
        }
    }

    async function updateComplaint(id, status) {
        const note = window.prompt("Admin note", "") || "";
        const res = await fetch(`https://tazabeet-backend.vibenest.net/api/complaints/admin/${id}`, {
            method: "PUT",
            headers,
            body: JSON.stringify({ status, adminNote: note }),
        });
        const data = await res.json();
        if (!res.ok) return toast.error(data.message || "Failed");
        toast.success("Report updated");
        loadAdminData();
    }

    async function updateWorker(id, verificationStatus) {
        const note = window.prompt("Verification note", "") || "";
        const res = await fetch(`https://tazabeet-backend.vibenest.net/api/admin/workers/${id}/verification`, {
            method: "PUT",
            headers,
            body: JSON.stringify({ verificationStatus, verificationNote: note }),
        });
        const data = await res.json();
        if (!res.ok) return toast.error(data.message || "Failed");
        toast.success("Worker updated");
        loadAdminData();
    }

    useEffect(() => {
        loadAdminData();
    }, []);

    return (
        <div style={{ minHeight: "100vh", background: "#f6f6f6", padding: 24, fontFamily: "system-ui" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <h1>Admin Dashboard</h1>
                <button className="lpCTAButton" type="button" onClick={() => navigate("/")}>Home</button>
            </div>

            <div className="filterBar" style={{ marginBottom: 16 }}>
                {["complaints", "workers", "audit"].map((item) => (
                    <button key={item} className={`filterBtn ${tab === item ? "active" : ""}`} onClick={() => setTab(item)}>
                        {item}
                    </button>
                ))}
                <button className="filterBtn" onClick={() => navigate("/admin/messages")}>messages</button>
            </div>

            {tab === "complaints" && (
                <AdminPanel title="Complaints">
                    {complaints.length === 0 ? <p>No complaints.</p> : complaints.map((item) => (
                        <AdminCard key={item._id}>
                            <b>{item.reason}</b>
                            <div>Customer: {item.customer?.name || "N/A"} | Worker: {item.worker?.name || "N/A"}</div>
                            <div>Service: {item.schedule?.service || "N/A"} | Status: {item.status}</div>
                            {item.details && <p>{item.details}</p>}
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <button onClick={() => updateComplaint(item._id, "reviewing")}>Reviewing</button>
                                <button onClick={() => updateComplaint(item._id, "resolved")}>Resolve</button>
                            </div>
                        </AdminCard>
                    ))}
                </AdminPanel>
            )}

            {tab === "workers" && (
                <AdminPanel title="Worker Verification">
                    {workers.map((worker) => (
                        <AdminCard key={worker._id}>
                            <b>{worker.name}</b>
                            <div>{worker.email} | {worker.phone}</div>
                            <div>Status: {worker.verificationStatus}</div>
                            {worker.verificationDocs?.length > 0 && (
                                <div className="jobMediaList">
                                    {worker.verificationDocs.map((doc, i) => (
                                        <a key={`${doc.name}-${i}`} href={doc.url} target="_blank" rel="noreferrer">{doc.name || `Doc ${i + 1}`}</a>
                                    ))}
                                </div>
                            )}
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <button onClick={() => updateWorker(worker._id, "verified")}>Verify</button>
                                <button onClick={() => updateWorker(worker._id, "rejected")}>Reject</button>
                            </div>
                        </AdminCard>
                    ))}
                </AdminPanel>
            )}

            {tab === "audit" && (
                <AdminPanel title="Audit Logs">
                    {logs.map((log) => (
                        <AdminCard key={log._id}>
                            <b>{log.action}</b>
                            <div>{log.actor?.name || "System"} | {log.role}</div>
                            <div>{log.resource} {log.resourceId}</div>
                            <small>{new Date(log.createdAt).toLocaleString()}</small>
                        </AdminCard>
                    ))}
                </AdminPanel>
            )}
        </div>
    );
}

function AdminPanel({ title, children }) {
    return <div style={{ background: "#fff", borderRadius: 14, padding: 16 }}><h2>{title}</h2><div style={{ display: "grid", gap: 10 }}>{children}</div></div>;
}

function AdminCard({ children }) {
    return <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, display: "grid", gap: 6 }}>{children}</div>;
}
