import { getUserProfile } from "@/lib/supabase/server";
import ProfileForm from "@/components/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { profile } = await getUserProfile();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Profil</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {profile?.full_name} &middot; {profile?.email}
        </p>
      </div>
      <ProfileForm profileId={profile.id} initialChatId={profile.telegram_chat_id} />
    </div>
  );
}
