import React, { useEffect, useState } from "react";
import ProfileHeader from "../../components/ProfileHeader";
import AchievementShowcase from "../../components/AchievementShowcase";
import CanonParticipation from "../../components/CanonParticipation";
import WritingStats from "../../components/WritingStats";
import UserLibrary from "../../components/UserLibrary";
import StoryIdentityCard from "../../components/StoryIdentityCard";

export default function EnhancedProfileView() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("storydirector_user_profile");
    if (stored) setProfile(JSON.parse(stored));
  }, []);

  return (
    <div className="p-10 space-y-6">
      <ProfileHeader profile={profile} />
      <AchievementShowcase />
      <CanonParticipation />
      <WritingStats />
      <UserLibrary />
      <StoryIdentityCard />
    </div>
  );
}
