'use client';
import { OrgResult } from "@/lib/github";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";

export function OrgSelector({ 
  orgs, 
  currentOrg 
}: { 
  orgs: OrgResult[], 
  currentOrg: string | null 
}) {
  const router = useRouter();

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`/dashboard?org=${e.target.value}`);
  };

  return (
    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm mb-6">
      <Users className="w-5 h-5 text-gray-400" />
      <select 
        className="bg-transparent border-none focus:ring-0 text-sm font-titillium font-bold w-full"
        value={currentOrg || ""}
        onChange={handleSelect}
      >
        <option value="">Personal Repositories</option>
        {orgs.map(org => (
          <option key={org.id} value={org.login}>
            Organization: {org.login}
          </option>
        ))}
      </select>
    </div>
  );
}
