
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function TeacherPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");

  useEffect(() => {
    async function checkTeacher() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", session.user.id)
        .single();

      if (error || profile?.role !== "teacher") {
        router.replace("/");
        return;
      }

      setName(profile.full_name || "Giáo viên");
      setLoading(false);
    }

    checkTeacher();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Đang kiểm tra tài khoản...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-900">
          Teacher Dashboard
        </h1>
        <p className="mt-2 text-slate-600">
          Xin chào, {name}!
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-semibold">Lớp học</h2>
            <p className="mt-2 text-sm text-slate-500">
              Quản lý các lớp TOEIC
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-semibold">Bài tập</h2>
            <p className="mt-2 text-sm text-slate-500">
              Tạo và giao bài tập
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-semibold">Học viên</h2>
            <p className="mt-2 text-sm text-slate-500">
              Theo dõi tiến độ học tập
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
