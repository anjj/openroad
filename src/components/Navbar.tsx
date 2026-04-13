'use client';
import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-golive-red rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rounded-sm" />
        </div>
        <span className="font-titillium font-black text-xl tracking-tighter uppercase">openRoad</span>
      </div>
      
      {session?.user && (
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Authenticated as</p>
                <p className="text-sm font-titillium font-black leading-none">{session.user.name}</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-gray-100 overflow-hidden shadow-inner">
              <img src={session.user.image || ""} alt="avatar" className="w-full h-full object-cover" />
            </div>
          </div>
          
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 text-gray-400 hover:text-golive-red transition-colors group"
            title="Sign Out"
          >
            <span className="text-xs font-bold uppercase tracking-widest hidden sm:block">Logout</span>
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </nav>
  );
}
