'use client';
import { useState, useEffect } from "react";
import { MilestoneResult, getMilestoneIssues, IssueResult } from "@/lib/github";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CheckCircle2, Circle, Calendar, Target, ListChecks } from "lucide-react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function TimelineView({ 
  milestones, 
  owner,
  showRepoPrefix = false
}: { 
  milestones: MilestoneResult[], 
  owner: string,
  showRepoPrefix?: boolean
}) {
  const [selectedId, setSelectedId] = useState<number | null>(
    milestones.find(m => m.health === 'green')?.id || milestones[0]?.id || null
  );
  const [issues, setIssues] = useState<IssueResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const selectedMilestone = milestones.find(m => m.id === selectedId);

  useEffect(() => {
    if (selectedId && selectedMilestone) {
      loadIssues(selectedMilestone);
    }
  }, [selectedId]);

  const loadIssues = async (m: MilestoneResult) => {
    setIsLoading(true);
    try {
      const data = await getMilestoneIssues(owner, m.repoName, m.number);
      setIssues(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const healthConfig = {
    green: { bg: "bg-green-500", border: "border-green-200", text: "text-green-700", label: "Active" },
    red: { bg: "bg-golive-red", border: "border-red-200", text: "text-red-700", label: "Overdue" },
    blue: { bg: "bg-blue-500", border: "border-blue-200", text: "text-blue-700", label: "Done" },
    gray: { bg: "bg-gray-300", border: "border-gray-200", text: "text-gray-500", label: "Future" },
    yellow: { bg: "bg-yellow-500", border: "border-yellow-200", text: "text-yellow-700", label: "Warning" },
  };

  return (
    <div className="space-y-12">
      {/* Horizontal Timeline Track */}
      <div className="relative py-12 px-4 overflow-x-auto no-scrollbar">
        {/* The Track Line - Centered relative to the dots */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2" />
        
        <div className="flex justify-between min-w-max gap-12 relative z-10 items-center">
          {milestones.map((m) => {
            const isSelected = m.id === selectedId;
            const config = healthConfig[m.health];
            
            return (
              <button
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                className="flex flex-col items-center group outline-none relative"
              >
                {/* Date Label - Positioned absolutely above to not affect dot centering */}
                <span className={cn(
                  "absolute -top-8 text-[10px] font-black uppercase tracking-tighter transition-colors whitespace-nowrap",
                  isSelected ? "text-black" : "text-gray-400 group-hover:text-gray-600"
                )}>
                  {m.due_on ? new Date(m.due_on).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }) : 'No date'}
                </span>

                {/* Node - The dot itself */}
                <div className={cn(
                  "w-6 h-6 rounded-full border-4 border-white shadow-sm transition-all duration-300 z-20",
                  config.bg,
                  isSelected ? "scale-150 ring-4 ring-black/5" : "group-hover:scale-125"
                )} />

                {/* Title Preview */}
                <span className={cn(
                  "absolute -bottom-10 text-[11px] font-bold uppercase tracking-tight max-w-[100px] text-center leading-none transition-colors",
                  isSelected ? "text-black" : "text-gray-400 group-hover:text-gray-600"
                )}>
                  {showRepoPrefix && (
                    <span className="block text-[8px] opacity-60 mb-0.5">{m.repoName}</span>
                  )}
                  {m.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail Section */}
      {selectedMilestone && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Detail Header */}
          <div className="p-8 border-b border-gray-50 bg-gray-50/30">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-2 py-0.5 rounded">
                        {selectedMilestone.repoName}
                    </span>
                    <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border",
                        healthConfig[selectedMilestone.health].border,
                        healthConfig[selectedMilestone.health].text,
                        "bg-white"
                    )}>
                        {healthConfig[selectedMilestone.health].label}
                    </span>
                </div>
                <h2 className="text-4xl font-titillium font-black uppercase tracking-tighter text-black leading-none">
                  {showRepoPrefix && (
                    <span className="text-sm block text-gray-400 mb-1 tracking-widest">{selectedMilestone.repoName} /</span>
                  )}
                  {selectedMilestone.title}
                </h2>
              </div>
              
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Target Date</span>
                </div>
                <span className="text-xl font-titillium font-black text-black">
                    {selectedMilestone.due_on ? new Date(selectedMilestone.due_on).toLocaleDateString() : 'TBD'}
                </span>
              </div>
            </div>

            {/* Progress Bar Large */}
            <div className="space-y-3">
                <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Target className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Global Progress</span>
                    </div>
                    <span className="text-2xl font-titillium font-black text-black">{Math.round(selectedMilestone.progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden p-1 shadow-inner">
                    <div 
                        className={cn("h-full rounded-full transition-all duration-1000", healthConfig[selectedMilestone.health].bg)}
                        style={{ width: `${selectedMilestone.progress}%` }}
                    />
                </div>
            </div>
          </div>

          {/* Issues List */}
          <div className="p-8">
            <div className="flex items-center gap-2 mb-6 text-gray-400">
                <ListChecks className="w-5 h-5" />
                <h3 className="text-sm font-black uppercase tracking-widest">Work Items ({issues.length})</h3>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center py-12 gap-4">
                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Synchronizing with GitHub...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {issues.map(issue => (
                  <div key={issue.id} className="flex items-start justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors bg-gray-50/50 group">
                    <div className="flex items-start gap-3">
                      {issue.state === 'closed' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 mt-0.5 shrink-0 group-hover:text-black transition-colors" />
                      )}
                      <span className={cn(
                        "text-sm font-bold leading-tight transition-colors",
                        issue.state === 'closed' ? "text-gray-400 line-through" : "text-gray-800"
                      )}>
                        <span className="text-xs font-black text-gray-300 mr-2">#{issue.number}</span>
                        {issue.title}
                      </span>
                    </div>
                    {issue.status && (
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-white border border-gray-200 shadow-sm shrink-0 ml-4">
                        {issue.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
