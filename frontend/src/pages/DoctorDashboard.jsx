import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CalendarCheck,
  Users,
  Loader2,
  RefreshCw,
  Megaphone,
  Trash2,
  Info,
  Siren,
} from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import { api, apiErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const STATUS_CLASS = {
  scheduled: "bg-indigo-100 text-indigo-700",
  rescheduled: "bg-amber-100 text-amber-700",
  cancelled: "bg-rose-100 text-rose-700",
  completed: "bg-emerald-100 text-emerald-700",
};

function StatCard({ label, value, icon: Icon, highlight }) {
  return (
    <div
      className={`rounded-[20px] p-5 border ${
        highlight
          ? "hc-gradient-bg text-white border-transparent shadow-[0_16px_40px_rgba(79,70,229,0.35)]"
          : "bg-white text-[#0F172A] border-[#E2E8F0] hc-soft-shadow"
      }`}
    >
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${highlight ? "bg-white/20" : "bg-[#EEF2FF] text-[#4F46E5]"}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className={`mt-3 text-3xl font-display font-extrabold ${highlight ? "text-white" : ""}`}>{value}</div>
      <div className={`text-sm mt-1 ${highlight ? "text-white/85" : "text-[#475569]"}`}>{label}</div>
    </div>
  );
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [appts, setAppts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ann, setAnn] = useState({ title: "", body: "", type: "holiday", starts_on: "", ends_on: "" });
  const [busy, setBusy] = useState(false);

  const setA = (k) => (e) => setAnn((f) => ({ ...f, [k]: e.target.value }));

  const load = async () => {
    try {
      const [s, a, an, al] = await Promise.all([
        api.get("/doctor/stats"),
        api.get("/appointments/mine"),
        api.get("/announcements"),
        api.get("/emergency-alerts"),
      ]);
      setStats(s.data);
      setAppts(a.data || []);
      setAnnouncements(an.data || []);
      setAlerts(al.data || []);
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const publish = async (e) => {
    e.preventDefault();
    if (!ann.title || !ann.body) {
      toast.error("Add a title and body.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/announcements", {
        title: ann.title,
        body: ann.body,
        type: ann.type,
        starts_on: ann.starts_on || null,
        ends_on: ann.ends_on || null,
      });
      toast.success("Announcement published.");
      setAnn({ title: "", body: "", type: "holiday", starts_on: "", ends_on: "" });
      await load();
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await api.delete(`/announcements/${id}`);
      toast.success("Deleted.");
      await load();
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
  };

  return (
    <DashboardShell
      title={`Dr. ${user?.name || ""}`}
      subtitle={user?.specialty ? `${user.specialty} · Doctor portal` : "Doctor portal"}
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Unique Patients" value={stats?.unique_patients ?? "—"} icon={Users} highlight />
        <StatCard label="Total Appointments" value={stats?.total_appointments ?? "—"} icon={CalendarCheck} />
        <StatCard label="Scheduled" value={stats?.scheduled ?? "—"} icon={RefreshCw} />
        <StatCard label="Completed" value={stats?.completed ?? "—"} icon={CalendarCheck} />
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        {/* Announcement form */}
        <form onSubmit={publish} className="lg:col-span-1 rounded-[24px] bg-white border border-[#E2E8F0] p-6 hc-soft-shadow" data-testid="doctor-announce-form">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#4F46E5]">
            <Megaphone className="w-4 h-4" /> Announcements
          </div>
          <h3 className="mt-2 font-display text-xl font-bold">Publish update</h3>

          <div className="mt-4 space-y-3">
            <select
              value={ann.type}
              onChange={setA("type")}
              data-testid="doctor-announce-type"
              className="w-full h-11 rounded-2xl bg-white border border-[#E2E8F0] px-4 text-sm"
            >
              <option value="holiday">Holiday / Off day</option>
              <option value="emergency">Emergency notice</option>
              <option value="general">General update</option>
            </select>
            <input
              required
              placeholder="Title"
              value={ann.title}
              onChange={setA("title")}
              data-testid="doctor-announce-title"
              className="w-full h-11 rounded-2xl bg-white border border-[#E2E8F0] px-4 text-sm"
            />
            <textarea
              required
              rows={3}
              placeholder="Body"
              value={ann.body}
              onChange={setA("body")}
              data-testid="doctor-announce-body"
              className="w-full rounded-2xl bg-white border border-[#E2E8F0] px-4 py-3 text-sm resize-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input type="date" placeholder="Starts" value={ann.starts_on} onChange={setA("starts_on")} className="h-11 rounded-2xl bg-white border border-[#E2E8F0] px-4 text-sm" />
              <input type="date" placeholder="Ends" value={ann.ends_on} onChange={setA("ends_on")} className="h-11 rounded-2xl bg-white border border-[#E2E8F0] px-4 text-sm" />
            </div>
            <button
              type="submit"
              disabled={busy}
              data-testid="doctor-announce-submit"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-white hc-gradient-bg shadow-[0_10px_25px_rgba(79,70,229,0.3)] disabled:opacity-70"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
              Publish
            </button>
          </div>
        </form>

        {/* Appointments */}
        <div className="lg:col-span-2 rounded-[24px] bg-white border border-[#E2E8F0] p-6 hc-soft-shadow" data-testid="doctor-appts-list">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#4F46E5]">
                <CalendarCheck className="w-4 h-4" /> Your appointments
              </div>
              <h3 className="mt-2 font-display text-xl font-bold">Schedule</h3>
            </div>
            <button onClick={load} className="text-xs text-[#4F46E5] font-semibold inline-flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="mt-5 text-sm text-[#475569] flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : appts.length === 0 ? (
            <div className="mt-5 text-sm text-[#475569]">No appointments assigned yet.</div>
          ) : (
            <div className="mt-5 space-y-3">
              {appts.map((a) => (
                <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E2E8F0] p-4" data-testid={`doctor-appt-${a.id}`}>
                  <div>
                    <div className="font-semibold text-[#0F172A]">{a.patient_name}</div>
                    <div className="text-xs text-[#475569] mt-0.5">
                      {a.date}
                      {a.time ? ` · ${a.time}` : ""} · {a.department}
                    </div>
                    {a.message && <div className="text-sm text-[#475569] mt-1">{a.message}</div>}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${STATUS_CLASS[a.status] || "bg-slate-100 text-slate-700"}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Announcements + emergency feed */}
      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <div className="rounded-[24px] bg-white border border-[#E2E8F0] p-6 hc-soft-shadow" data-testid="doctor-announcements-list">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#4F46E5]">
            <Info className="w-4 h-4" /> Your announcements
          </div>
          <div className="mt-4 space-y-3">
            {announcements.length === 0 && (
              <div className="text-sm text-[#475569]">No announcements yet.</div>
            )}
            {announcements.map((a) => (
              <div key={a.id} className="rounded-2xl border border-[#E2E8F0] p-4 flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-[#4F46E5] inline-flex">
                    {a.type}
                  </div>
                  <div className="mt-1.5 font-semibold text-[#0F172A]">{a.title}</div>
                  <div className="text-sm text-[#475569] mt-1">{a.body}</div>
                </div>
                <button
                  onClick={() => remove(a.id)}
                  className="text-rose-500 hover:text-rose-700"
                  data-testid={`doctor-announcement-delete-${a.id}`}
                  aria-label="delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] bg-white border border-[#E2E8F0] p-6 hc-soft-shadow">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#4F46E5]">
            <Siren className="w-4 h-4" /> Emergency alerts
          </div>
          <div className="mt-4 space-y-3">
            {alerts.length === 0 && (
              <div className="text-sm text-[#475569]">No active alerts.</div>
            )}
            {alerts.map((a) => (
              <div key={a.id} className="rounded-2xl border border-[#E2E8F0] p-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                    {a.severity}
                  </span>
                  <span className="font-semibold text-[#0F172A]">{a.title}</span>
                </div>
                <div className="text-sm text-[#475569] mt-1">{a.body}</div>
                <div className="text-xs text-[#94A3B8] mt-1">— {a.sent_by_name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
