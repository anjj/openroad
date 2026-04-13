import { getMilestones, getRepositories, getOrganizations, getOrgMilestones } from "@/lib/github";
import { TimelineView } from "@/components/TimelineView";
import { Navbar } from "@/components/Navbar";
import { RepoSelector } from "@/components/RepoSelector";
import { OrgSelector } from "@/components/OrgSelector";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default async function Dashboard({ searchParams }: { searchParams: { repo?: string, org?: string, tab?: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  // 1. Fetch Organizations
  let orgs = [];
  try {
    orgs = await getOrganizations();
  } catch (e) {
    console.error("Error fetching orgs:", e);
  }

  const currentOrg = searchParams.org || null;
  const currentTab = searchParams.tab || "all";

  // 2. Fetch Repositories (for personal mode selector)
  let repos = [];
  if (!currentOrg) {
    try {
      repos = await getRepositories();
    } catch (error) {
      console.error("Error fetching repositories:", error);
    }
  }

  // 3. Fetch Milestones
  let milestones = [];
  let title = "Personal Roadmap";

  try {
    if (currentOrg) {
      milestones = await getOrgMilestones(currentOrg);
      title = currentOrg;
    } else {
      const repoParam = searchParams.repo || (repos.length > 0 ? repos[0].full_name : "Golive-Global/openroad");
      const [owner, repo] = repoParam.split("/");
      milestones = await getMilestones(owner, repo);
      title = repo;
    }
  } catch (error) {
    console.error("Error fetching milestones:", error);
    return (
      <main className="min-h-screen bg-gray-50 font-sans antialiased">
        <Navbar />
        <div className="max-w-5xl mx-auto py-12 px-6 text-center">
          <OrgSelector orgs={orgs} currentOrg={currentOrg} />
          <h1 className="text-3xl font-titillium font-black mb-4 text-golive-red uppercase tracking-tight">Error</h1>
          <p className="text-gray-600 font-medium">Could not load roadmap data. Check permissions and organization access.</p>
        </div>
      </main>
    );
  }

  // 4. Logic for Tabs (if in Organization Mode)
  const uniqueRepos = Array.from(new Set(milestones.map(m => m.repoName)));
  const filteredMilestones = currentTab === "all" 
    ? milestones 
    : milestones.filter(m => m.repoName === currentTab);

  return (
    <main className="min-h-screen bg-gray-50 pb-20 font-sans antialiased">
      <Navbar />
      <div className="max-w-5xl mx-auto py-12 px-6">
        
        {/* Navigation Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
            <OrgSelector orgs={orgs} currentOrg={currentOrg} />
            {!currentOrg && (
                <RepoSelector repos={repos} currentRepo={searchParams.repo || (repos.length > 0 ? repos[0].full_name : "")} />
            )}
        </div>

        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b-2 border-gray-100 pb-8">
            <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Roadmap Explorer</p>
                <h1 className="text-6xl font-titillium font-black uppercase tracking-tighter text-black leading-none">
                    {title}
                </h1>
            </div>
            {currentOrg && (
                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Active Repos</p>
                        <p className="text-2xl font-titillium font-black text-black leading-none">{uniqueRepos.length}</p>
                    </div>
                    <div className="text-right border-l pl-4 border-gray-200">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Milestones</p>
                        <p className="text-2xl font-titillium font-black text-black leading-none">{milestones.length}</p>
                    </div>
                </div>
            )}
        </div>

        {/* Tabs for Filtering (Org Mode only) */}
        {currentOrg && uniqueRepos.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-12 overflow-x-auto no-scrollbar pb-2">
            <a 
              href={`/dashboard?org=${currentOrg}&tab=all`}
              className={cn(
                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                currentTab === "all" 
                    ? "bg-black text-white shadow-xl scale-105" 
                    : "bg-white text-gray-400 hover:bg-gray-100 border border-gray-100"
              )}
            >
              All Projects ({milestones.length})
            </a>
            {uniqueRepos.map(repoName => (
              <a 
                key={repoName}
                href={`/dashboard?org=${currentOrg}&tab=${repoName}`}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  currentTab === repoName 
                    ? "bg-black text-white shadow-xl scale-105" 
                    : "bg-white text-gray-400 hover:bg-gray-100 border border-gray-100"
                )}
              >
                {repoName}
              </a>
            ))}
          </div>
        )}

        {/* Interactive Roadmap View */}
        <div className="mt-4">
            {filteredMilestones.length === 0 ? (
                <div className="py-24 text-center bg-white rounded-[40px] border-4 border-dashed border-gray-100">
                    <p className="text-gray-300 font-black uppercase tracking-[0.2em] text-xl">No Milestones Found</p>
                </div>
            ) : (
                <TimelineView 
                    milestones={filteredMilestones} 
                    owner={currentOrg || (searchParams.repo?.split("/")[0] || session.user?.name || "")} 
                    showRepoPrefix={currentTab === "all"}
                />
            )}
        </div>
      </div>
    </main>
  );
}
