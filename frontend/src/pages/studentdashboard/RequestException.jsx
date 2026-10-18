import { useEffect, useState } from "react";
import { BadgeCheck, Clock, FileWarning, Send, Trash2, XCircle } from "lucide-react";
import { getMyExceptionRequests, submitExceptionRequest, withdrawExceptionRequest } from "../../api/routes/StudentDashboard/exception";
import "./RequestException.css";

export default function RequestException() {
  const [reason, setReason] = useState("");
  const [days, setDays] = useState(3);
  const [status, setStatus] = useState({ loading: true, requests: [], latest: null, hasAccepted: false, acceptedUntil: null, hasSquad: true, monthlyUsed: 0, monthlyLimit: 2 });
  const [submitting, setSubmitting] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const MIN_REASON = 10;
  const MAX_REASON = 2000;
  const MIN_DAYS = 1;
  const MAX_DAYS = 4;
  const DAY_OPTIONS = Array.from({ length: MAX_DAYS - MIN_DAYS + 1 }, (_, i) => MIN_DAYS + i);
  const trimmedLen = reason.trim().length;
  const hasSquad = status.hasSquad !== false;
  // Monthly request quota (2 per calendar month, enforced by the backend).
  const monthlyLimit = status.monthlyLimit || 2;
  const monthlyUsed = Math.min(status.monthlyUsed || 0, monthlyLimit);
  const quotaReached = !status.loading && monthlyUsed >= monthlyLimit;

  const load = async () => {
    try {
      const data = await getMyExceptionRequests();
      setStatus({
        loading: false,
        requests: data?.requests || [],
        latest: data?.latest || null,
        hasAccepted: !!data?.hasAccepted,
        activeUntil: data?.activeUntil || null,
        hasSquad: data?.hasSquad !== false,
        monthlyUsed: data?.monthlyUsed || 0,
        monthlyLimit: data?.monthlyLimit || 2,
      });
    } catch {
      setStatus({ loading: false, requests: [], latest: null, hasAccepted: false, activeUntil: null, hasSquad: true, monthlyUsed: 0, monthlyLimit: 2 });
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!hasSquad) {
      setMessage("You must be assigned to a squad before requesting an exception. Please contact your mentor.");
      setMessageType("error");
      return;
    }
    // A pending or previously rejected request does NOT block a new one — the
    // only hard limit is the monthly quota, so students can retry after a
    // decline or while another request is still awaiting review.
    if (quotaReached) {
      setMessage(`You have already used all ${monthlyLimit} exception requests this month. The limit resets on the 1st of next month.`);
      setMessageType("error");
      return;
    }
    if (trimmedLen < MIN_REASON) {
      setMessage(`Please give a reason (at least ${MIN_REASON} characters — ${MIN_REASON - trimmedLen} more needed).`);
      setMessageType("error");
      return;
    }
    setSubmitting(true);
    try {
      await submitExceptionRequest(reason.trim(), days);
      setReason("");
      setMessage(`Request submitted for ${days} day${days === 1 ? "" : "s"}. Your mentor will review it soon.`);
      setMessageType("success");
      await load();
    } catch (err) {
      setMessage(err?.response?.data?.error || "Failed to submit request.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (id) => {
    if (!id || withdrawingId) return;
    if (!window.confirm("Withdraw this request? Your mentor will no longer see it, and you can submit a corrected one right away.")) return;
    setWithdrawingId(id);
    setMessage("");
    try {
      await withdrawExceptionRequest(id);
      setMessage("Request withdrawn. You can submit a corrected request below.");
      setMessageType("success");
      await load();
    } catch (err) {
      setMessage(err?.response?.data?.error || "Failed to withdraw request.");
      setMessageType("error");
    } finally {
      setWithdrawingId(null);
    }
  };

  const latest = status.latest;
  // The GET /exception-request route returns the active window as `activeUntil`.
  const acceptedUntilText = status.activeUntil
    ? new Date(status.activeUntil).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : null;
  // The form stays usable even with a pending or rejected request — only the
  // monthly quota (or a missing squad) disables it.
  const controlsDisabled = submitting || !hasSquad || quotaReached;

  return (
    <section className="req-exc-card" aria-label="Request Exception">
      <div className="req-exc-header">
        <span className="req-exc-icon"><FileWarning size={18} /></span>
        <div>
          <span className="dt-section-eyebrow">Need a break from LeetCode?</span>
          <h3>Request Exception</h3>
        </div>
      </div>
      <p className="req-exc-description">
        Choose how many days you need, add your reason, and submit. Your assigned mentor will approve or reject it.
        If approved, your LeetCode Status shows a <strong>Request accepted</strong> tag for the requested days.
      </p>

      {status.loading ? (
        <div className="dt-skeleton-line medium" />
      ) : (
        <div className="req-exc-current">
          {status.hasAccepted ? (
            <span className="req-exc-pill is-accepted"><BadgeCheck size={14} /> Exception active{acceptedUntilText ? ` · until ${acceptedUntilText}` : ""}</span>
          ) : latest?.status === "approved" ? (
            <span className="req-exc-pill is-expired"><Clock size={14} /> Exception expired</span>
          ) : latest?.status === "pending" ? (
            <span className="req-exc-pill is-pending"><Clock size={14} /> Pending mentor review{latest?.requested_days ? ` · ${latest.requested_days} day${latest.requested_days === 1 ? "" : "s"}` : ""}</span>
          ) : latest?.status === "rejected" ? (
            <span className="req-exc-pill is-rejected"><XCircle size={14} /> Exception declined</span>
          ) : (
            <span className="req-exc-pill is-none">No exception requested yet</span>
          )}
        </div>
      )}

      {!hasSquad && !status.loading && (
        <p className="req-exc-message error">You must be assigned to a squad before requesting an exception. Please contact your mentor.</p>
      )}

      <form onSubmit={handleSubmit} className="req-exc-form">
        <div className="req-exc-days">
          <div className="req-exc-label-row">
            <label id="req-exc-days-label">How long do you need?</label>
            <span className="req-exc-days-hint">
              {days} day{days === 1 ? "" : "s"} of LeetCode exception
            </span>
          </div>
          <div className="req-exc-days-options" role="radiogroup" aria-labelledby="req-exc-days-label">
            {DAY_OPTIONS.map((d) => (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={days === d}
                className={`req-exc-day-chip ${days === d ? "is-selected" : ""}`}
                onClick={() => setDays(d)}
                disabled={controlsDisabled}
                title={`Request exception for ${d} day${d === 1 ? "" : "s"}`}
              >
                {d}
              </button>
            ))}
            <span className="req-exc-days-suffix">day{days === 1 ? "" : "s"}</span>
          </div>
          <p className="req-exc-days-note">Counted from the day your mentor approves the request.</p>
        </div>
        <div className="req-exc-label-row">
          <label htmlFor="req-exc-reason">Reason for exception</label>
          <span className={`req-exc-required ${trimmedLen >= MIN_REASON ? "is-met" : ""}`}>
            {trimmedLen >= MIN_REASON ? (
              <><BadgeCheck size={13} /> Minimum reached</>
            ) : (
              <>{MIN_REASON - trimmedLen} more character{MIN_REASON - trimmedLen === 1 ? "" : "s"} required (min {MIN_REASON})</>
            )}
          </span>
        </div>
        <textarea
          id="req-exc-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={`e.g. Health issue — doctor advised rest for 5 days, will resume LeetCode after recovery. (minimum ${MIN_REASON} characters)`}
          rows={4}
          maxLength={MAX_REASON}
          disabled={controlsDisabled}
          aria-describedby="req-exc-requirement"
        />
        <div className="req-exc-progress" aria-hidden="true">
          <div
            className={`req-exc-progress-bar ${trimmedLen >= MIN_REASON ? "is-met" : ""}`}
            style={{ width: `${Math.min(100, (trimmedLen / MIN_REASON) * 100)}%` }}
          />
        </div>
        <div className="req-exc-footer">
          <span className="req-exc-count" id="req-exc-requirement">{trimmedLen}/{MAX_REASON} · min {MIN_REASON}</span>
          <button
            type="submit"
            className="req-exc-submit"
            disabled={controlsDisabled || trimmedLen < MIN_REASON}
            title={!hasSquad ? "You must be assigned to a squad first" : quotaReached ? "Monthly limit reached — resets on the 1st" : trimmedLen < MIN_REASON ? `Type ${MIN_REASON - trimmedLen} more character(s) to submit` : "Submit request"}
          >
            <Send size={15} />
            {submitting ? "Submitting..." : !hasSquad ? "No squad assigned" : quotaReached ? "Monthly limit reached" : trimmedLen < MIN_REASON ? `Need ${MIN_REASON - trimmedLen} more` : "Submit request"}
          </button>
        </div>
      </form>

      {message && <p className={`req-exc-message ${messageType}`}>{message}</p>}
      {!status.loading && status.requests.filter((r) => r.status === "pending").length > 0 && (
        <div className="req-exc-pending-list" aria-label="Pending requests">
          <p className="req-exc-pending-title">Awaiting mentor review ({status.requests.filter((r) => r.status === "pending").length})</p>
          {status.requests.filter((r) => r.status === "pending").map((r) => (
            <div key={r.id} className="req-exc-pending-item">
              <div className="req-exc-pending-info">
                <span className="req-exc-pending-days">
                  <Clock size={13} /> {r.requested_days || 3} day{(r.requested_days || 3) === 1 ? "" : "s"}
                </span>
                <span className="req-exc-pending-date">
                  {r.created_at ? new Date(r.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ""}
                </span>
                <p className="req-exc-pending-reason">{r.reason}</p>
              </div>
              <button
                type="button"
                className="req-exc-withdraw"
                disabled={withdrawingId === r.id}
                onClick={() => handleWithdraw(r.id)}
                title="Withdraw this request (e.g. you picked the wrong days)"
              >
                <Trash2 size={14} />
                {withdrawingId === r.id ? "Withdrawing..." : "Withdraw"}
              </button>
            </div>
          ))}
          <p className="req-exc-hint">Picked the wrong days or made a typo? Withdraw it above, then submit a corrected one — withdrawing frees the slot.</p>
        </div>
      )}
      {quotaReached ? (
        <p className="req-exc-hint">
          You have used all {monthlyLimit} exception requests this month. The limit resets on the 1st of next month.
        </p>
      ) : (
        monthlyUsed > 0 && (
          <p className="req-exc-hint">
            {monthlyUsed} of {monthlyLimit} exception requests used this month.
          </p>
        )
      )}
    </section>
  );
}
