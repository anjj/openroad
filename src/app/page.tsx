import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Github } from "lucide-react";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <div className="w-16 h-16 bg-golive-red rounded-2xl mb-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white rounded-md" />
      </div>
      <h1 className="text-5xl font-titillium font-black tracking-tighter mb-4">
        openRoad
      </h1>
      <p className="text-xl text-gray-600 max-w-md mb-12 font-medium">
        Minimalist GitHub roadmaps with automated risk intelligence.
      </p>
      
      <a
        href="/api/auth/signin/github"
        className="flex items-center gap-3 bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl"
      >
        <Github className="w-6 h-6" />
        Connect with GitHub
      </a>

      <p className="mt-8 text-sm text-gray-400 font-semibold uppercase tracking-widest">
        Private & Internal Use Only
      </p>
    </main>
  );
}
