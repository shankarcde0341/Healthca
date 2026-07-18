import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CalendarPlus,
  Siren,
  Loader2,
  RefreshCw,
  Users,
  Stethoscope,
  X,
  Info,
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

export default function ReceptionistDashboard() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [appts, setAppts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [book, setBook] = useState({
    doctor_id: "",
    patient_name: "",
    patient_phone: "",
    date: "",
    time: "",
    message: "",
  });
  const [alert, setAlert] = useState({ title: "", body: "", severity: "high" });
  const [busy, setBusy] = useState(false);

  const setB = (k) => (e) => setBook((f) => ({ ...f, [k]: e.target.value }));
  const setA = (k) => (e) => setAlert((f) => ({ ...f, [k]: e.target.value }));

  const load = async () => {
    try {
      const [d, a, al] = await Promise.all([
        api.get("/doctors"),
        api.get("/appointments/mine"),
        api.get("/emergency-alerts"),
      ]);
      setDoctors(d.data || []);
      setAppts(a.data || []);
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

  const submitBook = async (e) => {
    e.preventDefault();
    if (!book.doctor_id || !book.patient_name || !book.date) {
      toast.error("Doctor, patient name and date are required.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/appointments/book", book);
      toast.success("Appointment booked.");
      setBook({ doctor_id: "", patient_name: "", patient_phone: "", date: "", time: "", message: "" });
      await load();
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const sendAlert = async (e) => {
    e.preventDefault();
    if (!alert.title || !alert.body) {
      toast.error("Please add a title and body.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/emergency-alerts", alert);
      toast.success("Emergency alert sent.");
      setAlert({ title: "", body: "", severity: "high" });
      await load();
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const reschedule = async (id) => {
    const newDate = prompt("New date (YYYY-MM-DD):");
    if (!newDate) return;
    const newTime = prompt("New time (HH:MM) — leave blank if none:") || undefined;
    try {
      await api.patch(`/appointments/${id}`, { date: newDate, time: newTime, status: "rescheduled" });
      toast.success("Rescheduled.");
      await load();
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
  };
  const cancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await api.delete(`/appointments/${id}`);
      toast.success("Cancelled.");
      await load();
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
  };

  const stats = useMemo(() => {
    const total = appts.length;
    const scheduled = appts.filter((a) => a.status === "scheduled" || a.status === "rescheduled").length;
    const cancelled = appts.filter((a) => a.status === "cancelled").length;
    return { total, scheduled, cancelled };
  }, [appts]);

  return (
    <DashboardShell
      title={`Reception · ${user?.name || ""}`}
      subtitle="Coordinate clinic bookings and broadcast emergencies."
    >
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Total Appointments" value={stats.total} icon={CalendarPlus} highlight />
        <StatCard label="Active" value={stats.scheduled} icon={RefreshCw} />
        <StatCard label="Doctors Available" value={doctors.length} icon={Stethoscope} />
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        {/* Book on behalf */}
        <form onSubmit={submitBook} className="lg:col-span-2 rounded-[24px] bg-white border border-[#E2E8F0] p-6 hc-soft-shadow" data-testid="reception-book-form">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#4F46E5]">
            <CalendarPlus className="w-4 h-4" /> Book on behalf of a patient
          </div>
          <h3 className="mt-2 font-display text-xl font-bold">New appointment</h3>

          <div className="mt-5 grid sm:grid-cols-2 gap-3">
            <select
              value={book.doctor_id}
              onChange={setB("doctor_id")}
              required
              data-testid="reception-book-doctor"
              className="h-12 rounded-2xl bg-white border border-[#E2E8F0] px-4 text-sm text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/15"
            >
              <option value="">Select doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.specialty ? `· ${d.specialty}` : ""}
                </option>
              ))}
            </select>
            <input
              required
              placeholder="Patient full name"
              value={book.patient_name}
              onChange={setB("patient_name")}
              data-testid="reception-book-patient"
              className="h-12 rounded-2xl bg-white border border-[#E2E8F0] px-4 text-sm text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/15"
            />
            <input
              placeholder="Patient phone (optional)"
              value={book.patient_phone}
              onChange={setB("patient_phone")}
              className="h-12 rounded-2xl bg-white border border-[#E2E8F0] px-4 text-sm text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/15"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                required
                value={book.date}
                onChange={setB("date")}
                data-testid="reception-book-date"
                className="h-12 rounded-2xl bg-white border border-[#E2E8F0] px-4 text-sm text-[#0F172A]"
              />
              <input
                type="time"
                value={book.time}
                onChange={setB("time")}
                className="h-12 rounded-2xl bg-white border border-[#E2E8F0] px-4 text-sm text-[#0F172A]"
              />
            </div>
            <textarea
              rows={2}
              value={book.message}
              onChange={setB("message")}
              placeholder="Notes (optional)"
              className="sm:col-span-2 rounded-2xl bg-white border border-[#E2E8F0] px-4 py-3 text-sm resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            data-testid="reception-book-submit"
            className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-white hc-gradient-bg shadow-[0_10px_25px_rgba(79,70,229,0.3)] disabled:opacity-70"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarPlus className="w-4 h-4" />}
            Book appointment
          </button>
        </form>

        {/* Emergency broadcast */}
        <form onSubmit={sendAlert} className="rounded-[24px] p-6 hc-gradient-bg text-white shadow-[0_16px_40px_rgba(79,70,229,0.35)]" data-testid="reception-alert-form">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/80">
            <Siren className="w-4 h-4" /> Emergency broadcast
          </div>
          <h3 className="mt-2 font-display text-xl font-bold">Send alert</h3>

          <div className="mt-4 space-y-3">
            <input
              required
              placeholder="Alert title"
              value={alert.title}
              onChange={setA("title")}
              data-testid="reception-alert-title"
              className="w-full h-11 rounded-2xl bg-white/15 backdrop-blur border border-white/25 px-4 text-sm text-white placeholder-white/60 focus:outline-none focus:border-white/60"
            />
            <textarea
              required
              rows={3}
              placeholder="Details"
              value={alert.body}
              onChange={setA("body")}
              data-testid="reception-alert-body"
              className="w-full rounded-2xl bg-white/15 backdrop-blur border border-white/25 px-4 py-3 text-sm text-white placeholder-white/60 resize-none focus:outline-none focus:border-white/60"
            />
            <select
              value={alert.severity}
              onChange={setA("severity")}
              className="w-full h-11 rounded-2xl bg-white/15 backdrop-blur border border-white/25 px-4 text-sm text-white focus:outline-none"
            >
              <option value="low" className="text-black">Low</option>
              <option value="medium" className="text-black">Medium</option>
              <option value="high" className="text-black">High</option>
              <option value="critical" className="text-black">Critical</option>
            </select>
            <button
              type="submit"
              disabled={busy}
              data-testid="reception-alert-submit"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-[#4F46E5] bg-white hover:bg-white/95 disabled:opacity-70"
            >
              <Siren className="w-4 h-4" /> Send alert
            </button>
          </div>
        </form>
      </div>

      {/* Appointments list */}
      <div className="mt-8 rounded-[24px] bg-white border border-[#E2E8F0] p-6 hc-soft-shadow" data-testid="reception-appts-list">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#4F46E5]">
              <Users className="w-4 h-4" /> All appointments
            </div>
            <h3 className="mt-2 font-display text-xl font-bold">Clinic schedule</h3>
          </div>
          <button onClick={load} className="text-xs text-[#4F46E5] font-semibold inline-flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          {loading ? (
            <div className="text-sm text-[#475569] flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : appts.length === 0 ? (
            <div className="text-sm text-[#475569]">No appointments yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-[#475569] text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-2 pr-4">Patient</th>
                  <th className="py-2 pr-4">Doctor</th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {appts.map((a) => (
                  <tr key={a.id} className="border-t border-[#E2E8F0]/60" data-testid={`reception-appt-${a.id}`}>
                    <td className="py-3 pr-4 font-medium text-[#0F172A]">{a.patient_name}</td>
                    <td className="py-3 pr-4">Dr. {a.doctor_name}</td>
                    <td className="py-3 pr-4">
                      {a.date}
                      {a.time ? ` · ${a.time}` : ""}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${STATUS_CLASS[a.status] || "bg-slate-100 text-slate-700"}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {a.status !== "cancelled" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => reschedule(a.id)}
                            data-testid={`reception-reschedule-${a.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold text-[#4F46E5] bg-indigo-50 hover:bg-indigo-100"
                          >
                            <RefreshCw className="w-3 h-3" /> Reschedule
                          </button>
                          <button
                            onClick={() => cancel(a.id)}
                            data-testid={`reception-cancel-${a.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100"
                          >
                            <X className="w-3 h-3" /> Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="mt-8 rounded-[24px] bg-white border border-[#E2E8F0] p-6 hc-soft-shadow">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#4F46E5]">
            <Info className="w-4 h-4" /> Recent alerts
          </div>
          <ul className="mt-4 space-y-3">
            {alerts.map((a) => (
              <li key={a.id} className="rounded-2xl border border-[#E2E8F0] p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                  <span className="text-xs uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                    {a.severity}
                  </span>
                  {a.title}
                </div>
                <div className="text-sm text-[#475569] mt-1">{a.body}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </DashboardShell>
  );
}
