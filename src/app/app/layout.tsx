import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen">
      <div className="flex flex-col h-full">
        <div className="flex-none">
          <Navbar />
        </div>
        <div className="flex flex-1 min-h-0">
          <Sidebar />
          {children}
        </div>
      </div>
    </div>
  );
}
