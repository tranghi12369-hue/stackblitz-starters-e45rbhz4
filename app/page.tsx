"use client";

import { useMemo, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
/* ---------- Types ---------- */
type View = "dashboard" | "courses" | "homework" | "practice" | "history" | "profile";
type Status = "Chưa làm" | "Đang làm" | "Đã nộp";

interface Homework {
  id: number;
  title: string;
  section: string;
  questions: number;
  deadline: string;
  status: Status;
}
interface PracticeItem {
  id: string;
  title: string;
  desc: string;
  group: "Listening" | "Reading" | "Kỹ năng khác";
  icon: string;
  count: number;
}

/* ---------- Icons ---------- */
const ICONS: Record<string, string> = {
  home: "M3 12l9-9 9 9M5 10v10h14V10",
  book: "M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5v14z",
  clipboard:
    "M9 3h6a1 1 0 011 1v2H8V4a1 1 0 011-1zM8 5H6a1 1 0 00-1 1v14a1 1 0 001 1h12a1 1 0 001-1V6a1 1 0 00-1-1h-2",
  headphones:
    "M3 18v-6a9 9 0 0118 0v6M3 18a2 2 0 002 2h1v-6H5a2 2 0 00-2 2zM21 18a2 2 0 01-2 2h-1v-6h1a2 2 0 012 2z",
  clock: "M12 6v6l4 2M12 21a9 9 0 100-18 9 9 0 000 18z",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  search: "M21 21l-4.3-4.3M11 19a8 8 0 100-16 8 8 0 000 16z",
  bell: "M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0",
  flame: "M12 3c1 4 5 5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z",
  check: "M20 6L9 17l-5-5",
  star: "M12 2l3 7 7 .6-5.3 4.8L18.2 22 12 18l-6.2 4 1.5-7.6L2 9.6 9 9z",
  menu: "M4 6h16M4 12h16M4 18h16",
  x: "M18 6L6 18M6 6l12 12",
  pen: "M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z",
  layers: "M12 2l10 5-10 5L2 7zM2 17l10 5 10-5M2 12l10 5 10-5",
  arrow: "M5 12h14M13 6l6 6-6 6",
  history: "M3 12a9 9 0 109-9 9 9 0 00-6.4 2.6L3 8M3 3v5h5M12 7v5l3 2",
};

function Icon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={ICONS[name] ?? ""} />
    </svg>
  );
}

/* ---------- Sample data ---------- */
const NAV: { id: View; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "home" },
  { id: "courses", label: "My Courses", icon: "book" },
  { id: "homework", label: "Homework", icon: "clipboard" },
  { id: "practice", label: "TOEIC Practice", icon: "headphones" },
  { id: "history", label: "Test History", icon: "history" },
  { id: "profile", label: "My Profile", icon: "user" },
];

const INITIAL_HOMEWORK: Homework[] = [
  { id: 1, title: "Mô tả tranh – Người và hoạt động", section: "Listening Part 1", questions: 6, deadline: "22/11/2026", status: "Chưa làm" },
  { id: 2, title: "Điền từ vào chỗ trống – Thì hiện tại hoàn thành", section: "Reading Part 5", questions: 30, deadline: "23/11/2026", status: "Đang làm" },
  { id: 3, title: "Hội thoại ngắn tại văn phòng", section: "Listening Part 3", questions: 39, deadline: "25/11/2026", status: "Chưa làm" },
  { id: 4, title: "Đọc hiểu email và thông báo nội bộ", section: "Reading Part 7", questions: 28, deadline: "27/11/2026", status: "Chưa làm" },
  { id: 5, title: "Từ vựng chủ đề Marketing & Sales", section: "Vocabulary", questions: 40, deadline: "18/11/2026", status: "Đã nộp" },
];

const PRACTICE: PracticeItem[] = [
  { id: "l1", title: "Listening Part 1", desc: "Mô tả tranh", group: "Listening", icon: "headphones", count: 6 },
  { id: "l2", title: "Listening Part 2", desc: "Hỏi – đáp", group: "Listening", icon: "headphones", count: 25 },
  { id: "l3", title: "Listening Part 3", desc: "Đoạn hội thoại", group: "Listening", icon: "headphones", count: 39 },
  { id: "l4", title: "Listening Part 4", desc: "Bài nói chuyện ngắn", group: "Listening", icon: "headphones", count: 30 },
  { id: "r5", title: "Reading Part 5", desc: "Hoàn thành câu", group: "Reading", icon: "book", count: 30 },
  { id: "r6", title: "Reading Part 6", desc: "Hoàn thành đoạn văn", group: "Reading", icon: "book", count: 16 },
  { id: "r7", title: "Reading Part 7", desc: "Đọc hiểu đoạn văn", group: "Reading", icon: "book", count: 54 },
  { id: "g", title: "Grammar", desc: "Ngữ pháp trọng tâm TOEIC", group: "Kỹ năng khác", icon: "pen", count: 120 },
  { id: "v", title: "Vocabulary", desc: "Từ vựng theo chủ đề", group: "Kỹ năng khác", icon: "layers", count: 600 },
  { id: "m", title: "Mini Test", desc: "Bài thi rút gọn 60 phút", group: "Kỹ năng khác", icon: "clipboard", count: 100 },
];

const ACTIVITY = [
  { id: 1, name: "Reading Part 5 – Giới từ & liên từ", score: "26/30", pct: 87, date: "19/11/2026" },
  { id: 2, name: "Listening Part 2 – Hỏi đáp", score: "21/25", pct: 84, date: "18/11/2026" },
  { id: 3, name: "Vocabulary – Marketing & Sales", score: "34/40", pct: 85, date: "18/11/2026" },
  { id: 4, name: "Mini Test #07", score: "78/100", pct: 78, date: "16/11/2026" },
  { id: 5, name: "Listening Part 3 – Hội thoại", score: "29/39", pct: 74, date: "14/11/2026" },
];

const COURSES = [
  { id: 1, title: "TOEIC Foundation 450+", teacher: "Cô Minh Anh", progress: 100, lessons: "24/24 bài" },
  { id: 2, title: "TOEIC Intermediate 650+", teacher: "Thầy Quốc Bảo", progress: 68, lessons: "17/25 bài" },
  { id: 3, title: "TOEIC Reading Intensive", teacher: "Cô Thu Hà", progress: 35, lessons: "7/20 bài" },
];

const NOTIFICATIONS = [
  "Bài tập “Mô tả tranh” sắp đến hạn vào 22/11.",
  "Bạn đạt 87% ở bài Reading Part 5. Tuyệt vời!",
  "Giáo viên vừa giao thêm bài Reading Part 7.",
];

const STATUS_STYLE: Record<Status, string> = {
  "Chưa làm": "bg-slate-100 text-slate-600 ring-slate-200",
  "Đang làm": "bg-amber-50 text-amber-700 ring-amber-200",
  "Đã nộp": "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

/* ---------- Small components ---------- */
function Badge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLE[status]}`}>
      {status}
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-blue-50">
      <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${value}%` }} />
    </div>
  );
}

function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {action}
    </div>
  );
}

function HomeworkList({ items, onStart }: { items: Homework[]; onStart: (id: number) => void }) {
  if (items.length === 0) {
    return <p className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">Không có bài tập phù hợp.</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((h) => (
        <li key={h.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{h.title}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{h.section}</span>
              <span>{h.questions} câu</span>
              <span>Hạn nộp: {h.deadline}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:shrink-0">
            <Badge status={h.status} />
            <button
              onClick={() => onStart(h.id)}
              disabled={h.status === "Đã nộp"}
              className="rounded-lg bg-[#0B1F4B] px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              {h.status === "Đang làm" ? "Tiếp tục" : h.status === "Đã nộp" ? "Hoàn thành" : "Bắt đầu"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function PracticeGrid({ onPick, selected }: { onPick: (p: PracticeItem) => void; selected: string | null }) {
  const groups: PracticeItem["group"][] = ["Listening", "Reading", "Kỹ năng khác"];
  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <div key={g}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{g}</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {PRACTICE.filter((p) => p.group === g).map((p) => (
              <button
                key={p.id}
                onClick={() => onPick(p)}
                className={`group rounded-xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  selected === p.id ? "border-blue-600 ring-2 ring-blue-100" : "border-slate-200"
                }`}
              >
                <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white">
                  <Icon name={p.icon} />
                </span>
                <p className="font-medium text-slate-900">{p.title}</p>
                <p className="text-sm text-slate-500">{p.desc}</p>
                <p className="mt-2 text-xs text-slate-400">{p.count} câu hỏi</p>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Main page ---------- */
export default function Page() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState<View>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [homework, setHomework] = useState<Homework[]>(INITIAL_HOMEWORK);
  const [filter, setFilter] = useState<"Tất cả" | Status>("Tất cả");
  const [picked, setPicked] = useState<PracticeItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [target, setTarget] = useState(750);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.replace("/login");
        return;
      }

      setUser(session.user);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Lỗi tải hồ sơ:", error.message);
      } else {
        setProfile(data);
      }

      setAuthLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        window.location.replace("/login");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);


  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const startHomework = (id: number) => {
    const item = homework.find((h) => h.id === id);
    if (!item) return;
    setHomework((prev) => prev.map((h) => (h.id === id && h.status === "Chưa làm" ? { ...h, status: "Đang làm" } : h)));
    showToast(`Đang mở bài: ${item.title}`);
  };

  const filteredHomework = useMemo(() => {
    const q = query.trim().toLowerCase();
    return homework.filter(
      (h) => (filter === "Tất cả" || h.status === filter) && (q === "" || h.title.toLowerCase().includes(q) || h.section.toLowerCase().includes(q))
    );
  }, [homework, query, filter]);

  const go = (v: View) => {
    setView(v);
    setMenuOpen(false);
    setNotifOpen(false);
  };

  const stats = [
    { label: "Bài tập đã hoàn thành", value: String(48 + homework.filter((h) => h.status === "Đã nộp").length - 1), icon: "check" },
    { label: "Điểm trung bình", value: "82%", icon: "star" },
    { label: "Giờ học", value: "126 giờ", icon: "clock" },
    { label: "Chuỗi ngày học", value: "14 ngày", icon: "flame" },
  ];

  const pickedPanel = picked && (
    <div className="mt-5 flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-[#0B1F4B]">{picked.title}: {picked.desc}</p>
        <p className="text-sm text-slate-600">{picked.count} câu hỏi · Làm bài không giới hạn thời gian</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setPicked(null)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Đóng</button>
        <button onClick={() => showToast(`Bắt đầu luyện tập ${picked.title}`)} className="rounded-lg bg-[#0B1F4B] px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">Bắt đầu luyện tập</button>
      </div>
    </div>
  );

  const activityTable = (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Bài tập</th>
              <th className="px-4 py-3 font-medium">Điểm</th>
              <th className="px-4 py-3 font-medium">Kết quả</th>
              <th className="px-4 py-3 font-medium">Ngày hoàn thành</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ACTIVITY.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{a.name}</td>
                <td className="px-4 py-3 text-slate-700">{a.score}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20"><ProgressBar value={a.pct} /></div>
                    <span className="text-xs text-slate-500">{a.pct}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{a.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const sidebar = (
    <nav className="flex h-full flex-col bg-[#0B1F4B] text-white">
      <div className="flex items-center gap-3 px-6 py-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-lg font-bold">T</span>
        <div>
          <p className="font-semibold leading-tight">TOEIC Learning Hub</p>
          <p className="text-xs text-blue-200">
  {profile?.role === "teacher" ? "Giáo viên" : "Học viên"}
</p>
        </div>
      </div>
      <ul className="flex-1 space-y-1 px-3">
        {NAV.map((n) => (
          <li key={n.id}>
            <button
              onClick={() => go(n.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                view === n.id ? "bg-white/15 font-medium text-white" : "text-blue-100 hover:bg-white/10"
              }`}
            >
              <Icon name={n.icon} />
              {n.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="m-4 rounded-xl bg-white/10 p-4 text-sm">
        <p className="font-medium">Mục tiêu: {target} điểm</p>
        <p className="mt-1 text-xs text-blue-200">Hiện tại: ~690 điểm ước tính</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-blue-300" style={{ width: `${Math.min(100, Math.round((690 / target) * 100))}%` }} />
        </div>
      </div>
    </nav>
  );
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-600">
        Đang tải tài khoản...
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">{sidebar}</aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-8">
          <button onClick={() => setMenuOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Mở menu">
            <Icon name="menu" />
          </button>
          <div className="relative max-w-md flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon name="search" className="h-4 w-4" /></span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm bài tập, phần thi..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="relative ml-auto">
            <button onClick={() => setNotifOpen((o) => !o)} className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Thông báo">
              <Icon name="bell" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-600" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                <p className="px-3 py-2 text-sm font-semibold text-slate-900">Thông báo</p>
                {NOTIFICATIONS.map((n, i) => (
                  <p key={i} className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">{n}</p>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => go("profile")} className="flex items-center gap-2 rounded-full p-1 hover:bg-slate-100" aria-label="Hồ sơ">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">NL</span>
            <span className="hidden pr-2 text-sm font-medium text-slate-700 sm:block">
  {profile?.full_name || user?.email || "Tài khoản"}
</span>
          </button>
        </header>

        <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-8">
          {/* DASHBOARD */}
          {view === "dashboard" && (
            <>
              <section className="rounded-2xl bg-gradient-to-r from-[#0B1F4B] to-blue-700 p-6 text-white sm:p-8">
                <h1 className="text-2xl font-semibold sm:text-3xl">Xin chào, học viên!</h1>
                <p className="mt-2 max-w-xl text-blue-100">
                  Bạn đang học rất tốt. Hôm nay còn {homework.filter((h) => h.status !== "Đã nộp").length} bài tập cần hoàn thành. Cố gắng giữ chuỗi 14 ngày nhé!
                </p>
                <button onClick={() => go("practice")} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#0B1F4B] hover:bg-blue-50">
                  Luyện tập ngay <Icon name="arrow" className="h-4 w-4" />
                </button>
              </section>

              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon name={s.icon} className="h-6 w-6" /></span>
                    <div>
                      <p className="text-2xl font-semibold text-slate-900">{s.value}</p>
                      <p className="text-sm text-slate-500">{s.label}</p>
                    </div>
                  </div>
                ))}
              </section>

              <section>
                <SectionTitle
                  title="Bài tập được giao"
                  action={<button onClick={() => go("homework")} className="text-sm font-medium text-blue-700 hover:underline">Xem tất cả</button>}
                />
                <HomeworkList items={filteredHomework.slice(0, 3)} onStart={startHomework} />
              </section>

              <section>
                <SectionTitle title="TOEIC Practice" />
                <PracticeGrid onPick={setPicked} selected={picked?.id ?? null} />
                {pickedPanel}
              </section>

              <section>
                <SectionTitle title="Hoạt động gần đây" />
                {activityTable}
              </section>
            </>
          )}

          {/* COURSES */}
          {view === "courses" && (
            <section>
              <SectionTitle title="Khóa học của tôi" />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {COURSES.map((c) => (
                  <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Icon name="book" /></span>
                    <p className="font-semibold text-slate-900">{c.title}</p>
                    <p className="text-sm text-slate-500">Giảng viên: {c.teacher}</p>
                    <div className="mt-4"><ProgressBar value={c.progress} /></div>
                    <div className="mt-2 flex justify-between text-xs text-slate-500">
                      <span>{c.lessons}</span><span>{c.progress}%</span>
                    </div>
                    <button onClick={() => showToast(`Mở khóa học: ${c.title}`)} className="mt-4 w-full rounded-lg border border-blue-200 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50">
                      {c.progress === 100 ? "Xem lại" : "Tiếp tục học"}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* HOMEWORK */}
          {view === "homework" && (
            <section>
              <SectionTitle title="Bài tập về nhà" />
              <div className="mb-4 flex flex-wrap gap-2">
                {(["Tất cả", "Chưa làm", "Đang làm", "Đã nộp"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-full px-4 py-1.5 text-sm transition ${filter === f ? "bg-[#0B1F4B] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <HomeworkList items={filteredHomework} onStart={startHomework} />
            </section>
          )}

          {/* PRACTICE */}
          {view === "practice" && (
            <section>
              <SectionTitle title="TOEIC Practice" />
              <PracticeGrid onPick={setPicked} selected={picked?.id ?? null} />
              {pickedPanel}
            </section>
          )}

          {/* HISTORY */}
          {view === "history" && (
            <section>
              <SectionTitle title="Lịch sử làm bài" />
              {activityTable}
            </section>
          )}

          {/* PROFILE */}
          {view === "profile" && (
            <section className="max-w-2xl">
              <SectionTitle title="Hồ sơ của tôi" />
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-semibold text-white">NL</span>
                  <div>
                  <p className="text-lg font-semibold text-slate-900">
  {profile?.full_name || "Người dùng"}
</p>
<p className="text-sm text-slate-500">
  {profile?.role === "teacher" ? "Giáo viên" : "Học viên"}
</p>
                  </div>
                </div>
                <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                  <div><dt className="text-slate-500">Email</dt><dd className="font-medium text-slate-900">{user?.email || ""}</dd></div>
                  <div><dt className="text-slate-500">Ngày tham gia</dt><dd className="font-medium text-slate-900">05/09/2026</dd></div>
                  <div><dt className="text-slate-500">Điểm ước tính hiện tại</dt><dd className="font-medium text-slate-900">~690 điểm</dd></div>
                  <div><dt className="text-slate-500">Lớp</dt><dd className="font-medium text-slate-900">TOEIC-HCM-26B</dd></div>
                </dl>
                <div className="mt-6">
                  <label htmlFor="target" className="flex justify-between text-sm font-medium text-slate-700">
                    <span>Điểm mục tiêu</span><span className="text-blue-700">{target}</span>
                  </label>
                  <input
                    id="target"
                    type="range"
                    min={450}
                    max={990}
                    step={5}
                    value={target}
                    onChange={(e) => setTarget(Number(e.target.value))}
                    className="mt-2 w-full accent-blue-700"
                  />
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-[#0B1F4B] px-5 py-3 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}