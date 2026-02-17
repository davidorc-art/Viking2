
import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Beer, 
  ShoppingBag, 
  DollarSign, 
  Package, 
  Shield, 
  Sword,
  Menu,
  X,
  LogOut,
  ChevronRight
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: any;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, currentUser }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agendas', icon: Calendar },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'bar', label: 'Bar Viking', icon: Beer },
    { id: 'shop', label: 'Loja', icon: ShoppingBag },
    { id: 'finance', label: 'Financeiro', icon: DollarSign },
    { id: 'inventory', label: 'Estoque', icon: Package },
    { id: 'admin', label: 'Segurança', icon: Shield },
  ];

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-gray-200 overflow-hidden">
      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-purple-700 p-4 rounded-full shadow-lg shadow-purple-900/50 active:scale-90 transition-transform"
      >
        {isSidebarOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} transition-all duration-300 bg-[#0f0f0f] border-r border-purple-900/20 flex flex-col z-40 relative shadow-2xl shadow-black`}>
        <div className="p-6 flex items-center gap-4">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-2 rounded-xl shadow-lg shadow-purple-900/20">
            <Sword className="text-white shrink-0" size={24} />
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden">
              <span className="font-viking text-xl tracking-[0.2em] text-white block">VIKING</span>
              <span className="text-[10px] text-purple-400 font-bold tracking-[0.4em] uppercase -mt-1 block">Studio & Bar</span>
            </div>
          )}
        </div>

        <nav className="flex-1 mt-8 px-3 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                activeTab === item.id 
                  ? 'bg-gradient-to-r from-purple-900/40 to-transparent text-purple-400 border border-purple-700/30' 
                  : 'text-gray-500 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <item.icon size={20} className={activeTab === item.id ? 'text-purple-400' : 'group-hover:text-purple-400 transition-colors'} />
                {isSidebarOpen && <span className="font-semibold text-sm tracking-wide">{item.label}</span>}
              </div>
              {isSidebarOpen && activeTab === item.id && <ChevronRight size={14} className="opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/40 border border-white/5 group cursor-pointer hover:border-purple-500/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-viking text-white shadow-lg">
              {currentUser.name[0]}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                <p className="text-[10px] text-purple-500 font-bold uppercase tracking-widest">{currentUser.role}</p>
              </div>
            )}
          </div>
          <button className={`flex items-center gap-4 px-4 py-3 w-full text-rose-500/70 hover:text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all ${!isSidebarOpen && 'justify-center'}`}>
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-bold text-sm">Abandonar Clã</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-30">
           <div className="text-xs text-gray-500 font-medium">
             Sincronizado: <span className="text-emerald-500">Online em Midgard</span>
           </div>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-gray-400">CAIXA ABERTO</span>
              </div>
           </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
