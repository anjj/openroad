'use client';
import { MilestoneResult, getMilestoneIssues, IssueResult } from "@/lib/github";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useState } from "react";
import { ChevronDown, CheckCircle2, Circle } from "lucide-react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function MilestoneCard({ 
  milestone,
  owner
}: { 
  milestone: MilestoneResult,
  owner: string 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [issues, setIssues] = useState<IssueResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleAccordion = async () => {
    if (!isOpen && issues.length === 0) {
      setIsLoading(true);
      try {
        const data = await getMilestoneIssues(owner, milestone.repoName, milestone.number);
        setIssues(data);
      } catch (e) {
        console.error("Error loading issues:", e);
      } finally {
        setIsLoading(false);
      }
    }
    setIsOpen(!isOpen);
  };

  const healthColors = {
    green: "border-green-500 bg-green-50/50",
    yellow: "border-yellow-500 bg-yellow-50/50",
    red: "border-golive-red bg-red-50/50",
    blue: "border-blue-500 bg-blue-50/50",
    gray: "border-gray-300 bg-gray-50/50",
  };

  const barColors = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-golive-red",
    blue: "bg-blue-500",
    gray: "bg-gray-300",
  };

  return (
    <div className={cn(
      "border-l-4 rounded-r-lg shadow-sm mb-6 bg-white overflow-hidden transition-all",
      healthColors[milestone.health],
      isOpen ? "ring-2 ring-black ring-inset" : ""
    )}>
      {/* Header / Clickable Area */}
      <div 
        onClick={toggleAccordion}
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-titillium font-black text-lg leading-tight uppercase tracking-tight">{milestone.title}</h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-gray-900 px-2 py-0.5 rounded text-white">
              {milestone.repoName}
            </span>
            <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform", isOpen && "rotate-180")} />
          </div>
        </div>
        
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
          {milestone.due_on ? `Due: ${new Date(milestone.due_on).toLocaleDateString()}` : "No deadline"}
        </p>

        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-700", barColors[milestone.health])} 
            style={{ width: `${milestone.progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-black uppercase tracking-tighter text-gray-400">
          <span>{Math.round(milestone.progress)}% complete</span>
          <span>{milestone.open_issues} open issues</span>
        </div>
      </div>

      {/* Accordion Content (Issues) */}
      {isOpen && (
        <div className="border-t border-gray-100 bg-white p-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
          ) : issues.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No tasks found in this hito.</p>
          ) : (
            <ul className="space-y-3">
              {issues.map(issue => (
                <li key={issue.id} className="flex items-start justify-between gap-4 group">
                  <div className="flex items-start gap-3">
                    {issue.state === 'closed' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" />
                    )}
                    <span className={cn(
                      "text-sm font-medium leading-tight",
                      issue.state === 'closed' ? "text-gray-400 line-through" : "text-gray-700"
                    )}>
                      <span className="font-black text-gray-400 mr-2 text-xs">#{issue.number}</span>
                      {issue.title}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    {issue.status ? (
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-black text-white shadow-sm border border-black">
                        {issue.status}
                      </span>
                    ) : (
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border",
                        issue.state === 'open' 
                          ? "bg-blue-100 text-blue-600 border-blue-200" 
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      )}>
                        {issue.state}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
