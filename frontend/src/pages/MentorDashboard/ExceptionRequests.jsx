import React, { useEffect, useState } from "react";
import { BadgeCheck, CalendarDays, CheckCircle, Clock, Inbox, User, XCircle, AlertTriangle } from "lucide-react";
import { getExceptionRequests, approveExceptionRequest, rejectExceptionRequest } from "../../api/routes/Mentor/exception";
import "./MentorReview.css";
import "./ExceptionRequests.css";

const ExceptionRequests = () => {
  const [requests, setRequests] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState({});
  const [actingId, setActingId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getExceptionRequests();
        setRequests(data.requests || []);
        setPendingCount(data.pendingCount ?? 0);
      } catch (err) {
        // A 404 means the deployed backend predates the exception-requests
        // endpoints — treat as "no data yet", not a hard error.
        if (err?.response?.status === 404) {
          setRequests([]);
          setPendingCount(0);
        } else {
          setError(err?.response?.data?.error || err.message || "Failed to load");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const decide = async (id, action) => {
    try {
      setActingId(id);
      setError("");
      const note = notes[id] || "";
      if (action === "approve") await approveExceptionRequest(id, note);
      else await rejectExceptionRequest(id, note);
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: action === "approve" ? "approved" : "rejected", mentor_note: note } : r)));
      setPendingCount((c) => Math.max(0, c - 1));
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Failed to update");
    } finally {
      setActingId(null);
    }
  };

  if (loading) return (<div className="mentor-review-page"><h1>Exception Requests</h1><p>Loading requests...</p></div>);
  const pending = requests.filter((r) => r.status === "pending");
  const history = requests.filter((r) => r.status !== "pending");

  return (
    <div className="mentor-review-page">
      <div className="review-header">
        <div><h1>Exception Requests</h1><p>Approving adds a Request accepted tag (for the requested days) to the student LeetCode Status.</p></div>
        <div className="review-count"><Clock size={18} />{pendingCount} Pending</div>
      </div>
      {error && (<div className="review-error"><AlertTriangle size={18} />{error}</div>)}
      {requests.length === 0 ? (
        <div className="empty-review"><CheckCircle size={45} /><h2>No exception requests</h2><p>No student has submitted a LeetCode exception request.</p></div>
      ) : (<>
        {pending.length > 0 && (<div className="exc-section"><h2 className="exc-section-title"><Inbox size={16} /> Pending ({pending.length})</h2><div className="review-list">
          {pending.map((req) => (
            <div key={req.id} className="review-card exc-card">
              <div className="review-student">{req.student_avatar ? (<><img src={req.student_avatar} alt={req.student_name || "Student"} onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextElementSibling?.classList?.add("is-visible"); }} /><span className="exc-avatar-fallback"><User size={22} /></span></>) : (<span className="exc-avatar-fallback is-visible"><User size={22} /></span>)}<div><h3>{req.student_name || "Student"}</h3><p>{req.student_email || req.student_leetcode || ""}</p><span className="exc-time">{req.created_at ? new Date(req.created_at).toLocaleString() : ""}</span></div></div>
              <div className="exc-reason"><div className="exc-reason-label"><strong>Student reason</strong><span className="exc-days-chip"><CalendarDays size={12} /> {req.requested_days || 3} day{(req.requested_days || 3) === 1 ? "" : "s"}</span></div><p>{req.reason}</p><input className="exc-note-input" placeholder="Optional note to student..." value={notes[req.id] || ""} onChange={(e) => setNotes((p) => ({ ...p, [req.id]: e.target.value }))} /></div>
              <div className="review-actions"><button className="review-btn approve" disabled={actingId === req.id} onClick={() => decide(req.id, "approve")}><CheckCircle size={16} />{actingId === req.id ? "Saving..." : "Approve"}</button><button className="review-btn reject" disabled={actingId === req.id} onClick={() => decide(req.id, "reject")}><XCircle size={16} />Reject</button></div>
            </div>))}
        </div></div>)}
        {history.length > 0 && (<div className="exc-section"><h2 className="exc-section-title"><BadgeCheck size={16} /> Reviewed ({history.length})</h2><div className="review-list">
          {history.map((req) => (
            <div key={req.id} className="review-card exc-card is-decided"><div className="review-student"><div><h3>{req.student_name || "Student"}</h3><p>{req.student_email || ""}</p></div></div><div className="exc-reason"><span className="exc-days-chip"><CalendarDays size={12} /> {req.requested_days || 3} day{(req.requested_days || 3) === 1 ? "" : "s"}</span><p className="exc-reason-text">{req.reason}</p>{req.mentor_note && (<p className="exc-mentor-note">Note: {req.mentor_note}</p>)}</div><span className={"exc-status " + req.status}>{req.status}</span></div>))}
        </div></div>)}
      </>)}
    </div>
  );
};

export default ExceptionRequests;
