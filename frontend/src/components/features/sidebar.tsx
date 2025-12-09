'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MessageSquare, LogOut } from 'lucide-react';
import { useAppDispatch } from '@/store';
import { logOut } from '@/store/features/authSlice';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logOut());
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-screen w-64 bg-gray-900 text-white border-r">
      <div className="p-4 border-b border-gray-800">
        <Button className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700" variant="default">
          <Plus size={16} /> New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
           {/* Mock Data */}
           {[1, 2, 3].map((i) => (
             <Button key={i} variant="ghost" className="w-full justify-start gap-2 font-normal hover:bg-gray-800 hover:text-white">
               <MessageSquare size={16} />
               Chat Session {i}
             </Button>
           ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-gray-800">
        <Button variant="ghost" className="w-full justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </Button>
      </div>
    </div>
  );
}
