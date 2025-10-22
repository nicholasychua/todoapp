import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface NavigationSidebarProps {
  currentPage?: 'home' | 'backlog' | 'focus' | 'subspaces' | null;
}

export function NavigationSidebar({ currentPage }: NavigationSidebarProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/coming-soon');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="fixed left-0 top-0 h-full w-48 bg-gray-50 p-4 flex flex-col z-50">
      {/* Logo and Title */}
      <div className="flex items-center gap-2 mb-6 px-4 pt-6">
        <div className="w-6 h-6 bg-gray-900 rounded-sm flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-sm"></div>
        </div>
        <span className="text-lg font-semibold text-gray-900">subspace</span>
      </div>
      
      <div className="flex-1 flex flex-col justify-center gap-1 -translate-y-6">
        <Link
          href="/home"
          className={cn(
            "text-left px-4 py-1.5 text-[13px] transition-colors font-normal cursor-pointer",
            currentPage === 'home'
              ? "text-gray-900" 
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          Home
        </Link>
        <Link
          href="/subspaces"
          className={cn(
            "text-left px-4 py-1.5 text-[13px] transition-colors font-normal cursor-pointer",
            currentPage === 'subspaces'
              ? "text-gray-900" 
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          Subspaces
        </Link>
        <Link
          href="/focus"
          className={cn(
            "text-left px-4 py-1.5 text-[13px] transition-colors font-normal cursor-pointer",
            currentPage === 'focus'
              ? "text-gray-900" 
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          Focus Session
        </Link>
        <button 
          className="text-left px-4 py-1.5 text-[13px] text-gray-500 hover:text-gray-700 transition-colors font-normal cursor-pointer"
          onClick={handleLogout}
        >
          Log out
        </button>
      </div>
    </div>
  );
} 