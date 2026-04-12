import { getMilestones } from "@/lib/github";
import { MilestoneCard } from "@/components/MilestoneCard";
import { Navbar } from "@/components/Navbar";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default async function Dashboard({ searchParams }: { searchParams: { repo?: string } }) {
  const repoParam = searchParams.repo || "Golive-Global/openroad";
  const [owner, repo] = repoParam.split("/");
  
  const milestones = await getMilestones(owner, repo);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-montserrat font-black mb-12">Roadmap: {repo}</h1>
        <div className="relative border-l-2 border-gray-300 ml-3 pl-8">
          {milestones.map((m) => (
            <div key={m.id} className="relative">
              <div className={cn(
                "absolute -left-[41px] top-6 w-4 h-4 rounded-full border-4 border-white shadow-sm",
                m.health === 'green' ? 'bg-green-500' : m.health === 'yellow' ? 'bg-yellow-500' : 'bg-golive-red'
              )} />
              <MilestoneCard milestone={m} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
