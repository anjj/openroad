import { getServerSession } from "next-auth";

export async function Navbar() {
  const session = await getServerSession();
  return (
    <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-golive-red rounded-lg" />
        <span className="font-montserrat font-black text-xl tracking-tighter">openRoad</span>
      </div>
      {session?.user && (
        <div className="flex items-center gap-4 text-sm font-medium">
          <span>{session.user.name}</span>
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
            <img src={session.user.image || ""} alt="avatar" />
          </div>
        </div>
      )}
    </nav>
  );
}
