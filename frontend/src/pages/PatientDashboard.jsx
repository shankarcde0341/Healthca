import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CalendarPlus,
  CalendarClock,
  X,
  Stethoscope,
  Loader2,
  RefreshCw,
  ClipboardCheck,
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

function BookingCard({ doctors, onBooked }) {
  const [form, setForm] = useState({ doctor_id: "", date: "", time: "", message: "" });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.doctor_id || !form.date) {
      toast.error("Pick a doctor and a date.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/appointments/book", form);
      toast.success("Appointment booked!");
      setForm({ doctor_id: "", date: "", time: "", message: "" });
      onBooked?.();
    } catch (e) {
      toast.error(apiErrorMessage(e, "Could not book. Try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-[24px] bg-white border border-[#E2E8F0] p-6 hc-soft-shadow" data-testid="patient-book-form">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#4F46E5]">
        <CalendarPlus className="w-4 h-4" /> New appointment
      </div>
      <h3 className="mt-2 font-display text-xl font-bold">Book a visit</h3>

      <div className="mt-5 grid gap-3">
        <div className="relative">
          <select
            value={form.doctor_id}
            onChange={set("doctor_id")}
            required
            data-testid="patient-book-doctor"
            className="w-full h-12 rounded-2xl bg-white border border-[#E2E8F0] px-4 pr-10 text-sm text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/15 appearance-none"
          >
            <option value="">Select a doctor</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} {d.specialty ? `· ${d.specialty}` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            required
            value={form.date}
            onChange={set("date")}
            data-testid="patient-book-date"
            className="h-12 rounded-2xl bg-white border border-[#E2E8F0] px-4 text-sm text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/15"
          />
          <input
            type="time"
            value={form.time}
            onChange={set("time")}
            data-testid="patient-book-time"
            className="h-12 rounded-2xl bg-white border border-[#E2E8F0] px-4 text-sm text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/15"
          />
        </div>
        <textarea
          rows={3}
          value={form.message}
          onChange={set("message")}
          placeholder="Reason for visit (optional)"
          data-testid="patient-book-message"
          className="rounded-2xl bg-white border border-[#E2E8F0] px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/15 resize-none"
        />
        <button
          type="submit"
          disabled={loading}
          data-testid="patient-book-submit"
          className="mt-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-white hc-gradient-bg shadow-[0_10px_25px_rgba(79,70,229,0.3)] disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarPlus className="w-4 h-4" />}
          Book appointment
        </button>
      </div>
    </form>
  );
}

function AppointmentRow({ appt, onReschedule, onCancel }) {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(appt.date);
  const [time, setTime] = useState(appt.time || "");

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 sm:p-5 hc-soft-shadow" data-testid={`appt-row-${appt.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#4F46E5]">
            {appt.department || "Consultation"}
          </div>
          <div className="mt-1 font-display text-lg font-bold text-[#0F172A]">
            Dr. {appt.doctor_name}
          </div>
          <div className="text-sm text-[#475569] mt-0.5">
            {appt.date}
            {appt.time ? ` · ${appt.time}` : ""}
          </div>
          {appt.message && <div className="mt-2 text-sm text-[#475569]">{appt.message}</div>}
        </div>
        <span className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${STATUS_CLASS[appt.status] || "bg-slate-100 text-slate-700"}`}>
          {appt.status}
        </span>
      </div>

      {appt.status !== "cancelled" && (
        <div className="mt-4 pt-4 border-t border-[#E2E8F0]/70 flex flex-wrap gap-2">
          {!editing ? (
            <>
              <button
                onClick={() => setEditing(true)}
                data-testid={`appt-reschedule-${appt.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-[#4F46E5] bg-indigo-50 hover:bg-indigo-100 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reschedule
              </button>
              <button
                onClick={() => onCancel(appt)}
                data-testid={`appt-cancel-${appt.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            </>
          ) : (
            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 rounded-full bg-white border border-[#E2E8F0] px-3 text-xs"
              />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-9 rounded-full bg-white border border-[#E2E8F0] px-3 text-xs"
              />
              <button
                onClick={async () => {
                  await onReschedule(appt, { date, time });
                  setEditing(false);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white hc-gradient-bg"
              >
                Save
              </button>
              <button onClick={() => setEditing(false)} className="text-xs text-[#475569] px-2">
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [appts, setAppts] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [d, a, an] = await Promise.all([
        api.get("/doctors"),
        api.get("/appointments/mine"),
        api.get("/announcements"),
      ]);
      setDoctors(d.data || []);
      setAppts(a.data || []);
      setAnnouncements(an.data || []);
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const reschedule = async (appt, patch) => {
    try {
      await api.patch(`/appointments/${appt.id}`, { ...patch, status: "rescheduled" });
      toast.success("Rescheduled.");
      await load();
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
  };
  const cancel = async (appt) => {
    try {
      await api.delete(`/appointments/${appt.id}`);
      toast.success("Appointment cancelled.");
      await load();
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
  };

  const upcoming = useMemo(() => appts.filter((a) => a.status !== "cancelled"), [appts]);
  const past = useMemo(() => appts.filter((a) => a.status === "cancelled"), [appts]);

  return (
    <DashboardShell
      title={`Hello, ${user?.name?.split(" ")[0] || "there"}`}
      subtitle="Manage your appointments and browse our doctors."
    >
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {announcements.length > 0 && (
            <div className="rounded-[20px] bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#4F46E5]">
                <Info className="w-4 h-4" /> Announcements
              </div>
              <ul className="mt-3 space-y-2">
                {announcements.slice(0, 3).map((a) => (
                  <li key={a.id} className="text-sm text-[#0F172A]" data-testid={`announcement-${a.id}`}>
                    <span className="font-semibold">Dr. {a.doctor_name}:</span> {a.title} — {a.body}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-[24px] bg-white border border-[#E2E8F0] p-6 hc-soft-shadow" data-testid="patient-appointments-list">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#4F46E5]">
                  <CalendarClock className="w-4 h-4" /> Your appointments
                </div>
                <h3 className="mt-2 font-display text-xl font-bold">Upcoming</h3>
              </div>
              <button onClick={load} className="text-xs text-[#4F46E5] font-semibold inline-flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="text-sm text-[#475569] flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                </div>
              ) : upcoming.length === 0 ? (
                <div className="text-sm text-[#475569]">You have no upcoming appointments.</div>
              ) : (
                upcoming.map((a) => (
                  <AppointmentRow key={a.id} appt={a} onReschedule={reschedule} onCancel={cancel} />
                ))
              )}
            </div>
            {past.length > 0 && (
              <div className="mt-8">
                <h4 className="font-display font-bold text-[#0F172A] mb-3">Cancelled</h4>
                <div className="space-y-3">
                  {past.map((a) => (
                    <AppointmentRow key={a.id} appt={a} onReschedule={reschedule} onCancel={cancel} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <BookingCard doctors={doctors} onBooked={load} />

          <div className="rounded-[24px] bg-white border border-[#E2E8F0] p-6 hc-soft-shadow" data-testid="patient-doctors-list">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#4F46E5]">
              <Stethoscope className="w-4 h-4" /> Available doctors
            </div>
            <div className="mt-4 space-y-3">
              {doctors.length === 0 ? (
                <div className="text-sm text-[#475569]">No doctors are registered yet.</div>
              ) : (
                doctors.map((d) => (
                  <div key={d.id} className="flex items-center justify-between gap-2 py-2 border-b border-[#E2E8F0]/60 last:border-0">
                    <div>
                      <div className="font-semibold text-sm text-[#0F172A]">Dr. {d.name}</div>
                      <div className="text-xs text-[#475569]">{d.specialty || "General"}</div>
                    </div>
                    <ClipboardCheck className="w-4 h-4 text-[#4F46E5]" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
