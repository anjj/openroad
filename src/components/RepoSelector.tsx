'use client';
import { RepoResult } from "@/lib/github";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function RepoSelector({ 
  repos, 
  currentRepo 
}: { 
  repos: RepoResult[], 
  currentRepo: string 
}) {
  const router = useRouter();

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`/dashboard?repo=${e.target.value}`);
  };

  return (
    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm mb-12">
      <Search className="w-5 h-5 text-gray-400" />
      <select 
        className="bg-transparent border-none focus:ring-0 text-sm font-titillium font-bold w-full"
        value={currentRepo}
        onChange={handleSelect}
      >
        <option disabled value="">Select a repository...</option>
        {repos.map(r => (
          <option key={r.id} value={r.full_name}>
            {r.full_name}
          </option>
        ))}
      </select>
    </div>
  );
}
