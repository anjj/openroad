import { MilestoneResult } from "@/lib/github";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function MilestoneCard({ milestone }: { milestone: MilestoneResult }) {
  const healthColors = {
    green: "border-green-500 bg-green-50",
    yellow: "border-yellow-500 bg-yellow-50",
    red: "border-golive-red bg-red-50",
  };

  const barColors = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-golive-red",
  };

  return (
    <div className={cn("p-4 border-l-4 rounded-r-lg shadow-sm mb-6 bg-white", healthColors[milestone.health])}>
      <h3 className="font-montserrat font-bold text-lg">{milestone.title}</h3>
      <p className="text-sm text-gray-600 mb-2">
        {milestone.due_on ? `Due: ${new Date(milestone.due_on).toLocaleDateString()}` : "No due date"}
      </p>
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-500", barColors[milestone.health])} 
          style={{ width: `${milestone.progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs font-semibold">
        <span>{Math.round(milestone.progress)}% complete</span>
        <span>{milestone.open_issues} open issues</span>
      </div>
    </div>
  );
}
