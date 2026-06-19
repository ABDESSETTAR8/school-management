import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/config/navigation";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/features/profile/components/profile-form";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const { profile } = await requireUser();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your personal details.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <Avatar className="size-20">
              {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile.first_name} />}
              <AvatarFallback className="text-xl">
                {getInitials(profile.first_name, profile.last_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">
                {profile.first_name} {profile.last_name}
              </p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
            <Badge variant="default">{ROLE_LABELS[profile.role]}</Badge>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal details</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm profile={profile} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
