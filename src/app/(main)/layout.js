import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/supabase/server";
import Header from "@/components/Header";
import ConditionalBottomNav from "@/components/ConditionalBottomNav";

export default async function MainLayout({ children }) {
  const { user, profile } = await getUserProfile();

  if (!user) redirect("/login");

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header fullName={profile?.full_name ?? user.email} role={profile?.role} />
      <main className="flex-1 px-4 py-4 max-w-2xl w-full mx-auto">
        {children}
      </main>
      <ConditionalBottomNav role={profile?.role} />
    </div>
  );
}
