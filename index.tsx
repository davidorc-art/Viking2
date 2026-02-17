
import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar as CalendarIcon,
  Smartphone,
  UserCheck,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Beer,
  ShoppingBag,
  DollarSign,
  Users,
  Shield,
  ShoppingCart,
  Zap,
  History,
  Trash2,
  List,
  Edit2,
  X,
  UserPlus
} from 'lucide-react';
import Layout from './components/Layout';
import { 
  MOCK_USERS, 
  MOCK_CLIENTS, 
  MOCK_PRODUCTS, 
  MOCK_APPOINTMENTS, 
  MOCK_TRANSACTIONS, 
  MOCK_SERVICES
} from './store';
import { UserRole, AppointmentStatus, Appointment, Product, Transaction, Client, User, Service } from './types';
import { GoogleGenAI } from "@google/genai";

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currentUser] = useState(MOCK_USERS[0]); // Ragnar Admin
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [services] = useState<Service[]>(MOCK_SERVICES);
  const [oracleInsight, setOracleInsight] = useState<string | null>(null);
  const [isOracleLoading, setIsOracleLoading] = useState(false);

  // Modal State
  const [modalMode, setModalMode] = useState<'ADD' | 'EDIT' | null>(null);
  const [modalType, setModalType] = useState<'CLIENT' | 'PRODUCT' | 'TRANSACTION' | 'USER' | 'APPOINTMENT' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Agenda States
  const [agendaView, setAgendaView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [agendaFilter, setAgendaFilter] = useState<'ALL' | 'TATTOO' | 'PIERCING'>('ALL');
  const [currentDate, setCurrentDate] = useState(new Date(2023, 9, 27));

  const getOracleInsight = async () => {
    setIsOracleLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stats = {
        faturamento: transactions.reduce((acc, t) => t.type === 'INCOME' ? acc + t.amount : acc - t.amount, 0),
        appointments: appointments.length,
        lowStock: products.filter(p => p.stock <= p.minStock).length
      };
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analise estes dados do Studio Viking e dê um conselho estratégico curto e motivador com temática viking: Faturamento R$${stats.faturamento}, Agendamentos: ${stats.appointments}, Itens com estoque baixo: ${stats.lowStock}.`,
      });
      setOracleInsight(response.text || "Os deuses estão em silêncio. Tente novamente.");
    } catch (err) {
      setOracleInsight("O Oráculo de Odin falhou. Verifique sua conexão.");
    } finally {
      setIsOracleLoading(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    if (modalType === 'CLIENT') {
      const newClient: Client = { 
        ...selectedItem, 
        ...data, 
        id: selectedItem?.id || Math.random().toString(36).substr(2, 9), 
        points: Number(selectedItem?.points || 0), 
        classification: (data.classification as any) || 'Novo' 
      } as Client;
      if (modalMode === 'EDIT') {
        setClients(clients.map(c => c.id === newClient.id ? newClient : c));
      } else {
        setClients([...clients, newClient]);
      }
    } else if (modalType === 'PRODUCT') {
      const newProduct = { ...selectedItem, ...data, id: selectedItem?.id || Math.random().toString(36).substr(2, 9), price: Number(data.price), stock: Number(data.stock), minStock: Number(data.minStock) };
      if (modalMode === 'EDIT') {
        setProducts(products.map(p => p.id === newProduct.id ? newProduct : p));
      } else {
        setProducts([...products, newProduct]);
      }
    } else if (modalType === 'TRANSACTION') {
      const newTransaction = { ...selectedItem, ...data, id: selectedItem?.id || Math.random().toString(36).substr(2, 9), amount: Number(data.amount) };
      if (modalMode === 'EDIT') {
        setTransactions(transactions.map(t => t.id === newTransaction.id ? newTransaction : t));
      } else {
        setTransactions([newTransaction, ...transactions]);
      }
    } else if (modalType === 'USER') {
      const newUser = { ...selectedItem, ...data, id: selectedItem?.id || Math.random().toString(36).substr(2, 9) };
      if (modalMode === 'EDIT') {
        setUsers(users.map(u => u.id === newUser.id ? newUser : u));
      } else {
        setUsers([...users, newUser]);
      }
    } else if (modalType === 'APPOINTMENT') {
      let finalClientId = data.clientId as string;

      // Handle "New Client" creation from Appointment Modal
      if (finalClientId === 'NEW') {
        const newClient: Client = {
          id: Math.random().toString(36).substr(2, 9),
          name: data.newClientName as string,
          phone: data.newClientPhone as string,
          email: '',
          birthDate: '',
          document: '',
          classification: 'Novo',
          points: 0
        };
        setClients(prev => [...prev, newClient]);
        finalClientId = newClient.id;
      }

      const newApp: Appointment = {
        ...selectedItem,
        clientId: finalClientId,
        professionalId: data.professionalId as string,
        serviceId: data.serviceId as string,
        date: data.date as string,
        time: data.time as string,
        duration: Number(data.duration || 60),
        status: (data.status as AppointmentStatus) || AppointmentStatus.SCHEDULED,
        type: (data.type as any) || 'TATTOO',
        id: selectedItem?.id || Math.random().toString(36).substr(2, 9),
      };

      if (modalMode === 'EDIT') {
        setAppointments(appointments.map(a => a.id === newApp.id ? newApp : a));
      } else {
        setAppointments([...appointments, newApp]);
      }
    }
    closeModal();
  };

  const deleteItem = (type: string, id: string) => {
    if (!confirm(`Tem certeza que deseja enviar este item para o Helheim (Excluir ${type})?`)) return;
    if (type === 'CLIENT') setClients(clients.filter(c => c.id !== id));
    if (type === 'PRODUCT') setProducts(products.filter(p => p.id !== id));
    if (type === 'TRANSACTION') setTransactions(transactions.filter(t => t.id !== id));
    if (type === 'USER') setUsers(users.filter(u => u.id !== id));
    if (type === 'APPOINTMENT') setAppointments(appointments.filter(a => a.id !== id));
  };

  const openModal = (type: any, mode: any, item: any = null) => {
    setModalType(type);
    setModalMode(mode);
    setSelectedItem(item);
  };

  const closeModal = () => {
    setModalType(null);
    setModalMode(null);
    setSelectedItem(null);
  };

  const handleSale = (product: Product) => {
    if (product.stock <= 0) return alert("Estoque esgotado no Arsenal!");
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: p.stock - 1 } : p));
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'INCOME',
      category: product.category,
      amount: product.price,
      date: new Date().toISOString().split('T')[0],
      description: `Venda Rápida: ${product.name}`,
      paymentMethod: 'PIX'
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      if (agendaFilter === 'ALL') return true;
      return a.type === agendaFilter;
    });
  }, [appointments, agendaFilter]);

  const renderDashboard = () => {
    const totalRevenue = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
    const lowStockItems = products.filter(p => p.stock <= p.minStock);

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-viking text-white tracking-widest uppercase">Salão de Odin</h1>
            <p className="text-gray-400">Visão geral do império hoje.</p>
          </div>
          <button 
            onClick={getOracleInsight}
            disabled={isOracleLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-purple-900/40 transition-all active:scale-95"
          >
            <Sparkles size={20} className={isOracleLoading ? "animate-spin" : ""} />
            {isOracleLoading ? "Consultando Oráculo..." : "Conselho do Oráculo"}
          </button>
        </header>

        {oracleInsight && (
          <div className="bg-purple-900/20 border border-purple-500/30 p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
            <p className="italic text-purple-200 font-medium">"{oracleInsight}"</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Faturamento Bruto" value={`R$ ${totalRevenue}`} icon={<ArrowUpRight className="text-green-500" />} color="emerald" />
          <StatCard title="Despesas Totais" value={`R$ ${totalExpenses}`} icon={<ArrowDownRight className="text-red-500" />} color="rose" />
          <StatCard title="Agendamentos" value={appointments.length.toString()} icon={<CalendarIcon className="text-purple-400" />} color="purple" />
          <StatCard title="Novos Guerreiros" value={clients.length.toString()} icon={<UserCheck className="text-blue-400" />} color="blue" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-[#0f0f0f] border border-white/5 rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-purple-500" />
              Fluxo Recente
            </h2>
            <div className="space-y-4">
              {transactions.slice(0, 5).map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'INCOME' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                      {t.type === 'INCOME' ? <Plus size={18} /> : <Minus size={18} />}
                    </div>
                    <div>
                      <p className="font-semibold">{t.description}</p>
                      <p className="text-xs text-gray-400 uppercase tracking-tighter">{t.category} • {t.paymentMethod}</p>
                    </div>
                  </div>
                  <p className={`font-bold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-[#0f0f0f] border border-white/5 rounded-3xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <AlertTriangle size={20} className="text-amber-500" />
                Estoque Crítico
              </h2>
              <div className="space-y-4">
                {lowStockItems.map(p => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-amber-500 font-bold">{p.stock} em estoque</p>
                    </div>
                    <button 
                      onClick={() => openModal('PRODUCT', 'EDIT', p)}
                      className="text-xs px-3 py-1 rounded-full border border-purple-500/50 text-purple-400 hover:bg-purple-500 hover:text-white transition-all"
                    >
                      Repor
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/20 border border-purple-500/20 rounded-3xl p-6 relative overflow-hidden">
               <div className="absolute -right-4 -bottom-4 opacity-10">
                 <Package size={120} />
               </div>
               <h3 className="text-lg font-viking mb-2">Clã da Fidelidade</h3>
               <p className="text-sm text-gray-300 mb-4">Você tem {clients.filter(c => c.classification === 'VIP').length} guerreiros VIP ativos.</p>
               <button onClick={() => setActiveTab('clients')} className="w-full bg-white/10 hover:bg-white/20 text-white text-sm font-bold py-2 rounded-xl transition-all">Ver Rankings</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAgenda = () => {
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-viking tracking-widest text-white">Escrituras do Destino</h1>
            <p className="text-gray-400 text-sm">{months[currentDate.getMonth()]} {currentDate.getFullYear()}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
              {(['daily', 'weekly', 'monthly'] as const).map((view) => (
                <button key={view} onClick={() => setAgendaView(view)} className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-tighter transition-all ${agendaView === view ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>
                  {view === 'daily' ? 'Dia' : view === 'weekly' ? 'Semana' : 'Mês'}
                </button>
              ))}
            </div>
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
              {(['ALL', 'TATTOO', 'PIERCING'] as const).map((f) => (
                <button key={f} onClick={() => setAgendaFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-tighter transition-all ${agendaFilter === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>
                  {f === 'ALL' ? 'Todos' : f === 'TATTOO' ? 'Tattoo' : 'Piercing'}
                </button>
              ))}
            </div>
            <button 
              onClick={() => openModal('APPOINTMENT', 'ADD', { date: currentDate.toISOString().split('T')[0], status: AppointmentStatus.SCHEDULED, type: 'TATTOO' })}
              className="bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-900/20 text-white"
            >
              <Plus size={18} /> Novo Agendamento
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-[#0f0f0f] p-4 rounded-2xl border border-white/5">
           <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)))} className="p-2 hover:bg-white/5 rounded-lg"><ChevronLeft size={20} /></button>
           <span className="flex-1 text-center font-bold text-purple-400">{currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
           <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)))} className="p-2 hover:bg-white/5 rounded-lg"><ChevronRight size={20} /></button>
        </div>
        {agendaView === 'daily' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0f0f0f] rounded-2xl border border-white/5 p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white"><span className="w-2 h-2 rounded-full bg-purple-500"></span>Tatuagem</h2>
              <div className="space-y-4">
                {filteredAppointments.filter(a => a.type === 'TATTOO' && a.date === currentDate.toISOString().split('T')[0]).map(a => (
                  <AppointmentItem 
                    key={a.id} 
                    appointment={a} 
                    client={clients.find(c => c.id === a.clientId)} 
                    onEdit={() => openModal('APPOINTMENT', 'EDIT', a)}
                    onDelete={() => deleteItem('APPOINTMENT', a.id)}
                  />
                ))}
                {filteredAppointments.filter(a => a.type === 'TATTOO' && a.date === currentDate.toISOString().split('T')[0]).length === 0 && (
                  <p className="text-gray-600 text-sm italic py-4">Nenhum agendamento para hoje.</p>
                )}
              </div>
            </div>
            <div className="bg-[#0f0f0f] rounded-2xl border border-white/5 p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Body Piercing</h2>
              <div className="space-y-4">
                {filteredAppointments.filter(a => a.type === 'PIERCING' && a.date === currentDate.toISOString().split('T')[0]).map(a => (
                  <AppointmentItem 
                    key={a.id} 
                    appointment={a} 
                    client={clients.find(c => c.id === a.clientId)} 
                    onEdit={() => openModal('APPOINTMENT', 'EDIT', a)}
                    onDelete={() => deleteItem('APPOINTMENT', a.id)}
                  />
                ))}
                {filteredAppointments.filter(a => a.type === 'PIERCING' && a.date === currentDate.toISOString().split('T')[0]).length === 0 && (
                  <p className="text-gray-600 text-sm italic py-4">Nenhum agendamento para hoje.</p>
                )}
              </div>
            </div>
          </div>
        )}
        {agendaView === 'weekly' && <WeeklyView currentDate={currentDate} filteredAppointments={filteredAppointments} clients={clients} onEdit={(a: any) => openModal('APPOINTMENT', 'EDIT', a)} />}
        {agendaView === 'monthly' && <MonthlyView currentDate={currentDate} filteredAppointments={filteredAppointments} />}
      </div>
    );
  };

  const renderClients = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-viking tracking-widest text-white">Guerreiros do Clã</h1>
          <p className="text-gray-400">Gerencie sua base de clientes e fidelidade.</p>
        </div>
        <button 
          onClick={() => openModal('CLIENT', 'ADD')}
          className="bg-purple-700 hover:bg-purple-600 px-6 py-2 rounded-xl text-sm font-bold shadow-lg text-white"
        >
          Novo Guerreiro
        </button>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map(c => (
          <div key={c.id} className="bg-[#0f0f0f] border border-white/5 rounded-3xl p-6 hover:border-purple-500/30 transition-all group relative">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => openModal('CLIENT', 'EDIT', c)} className="p-1.5 bg-white/5 hover:bg-purple-500/20 rounded-lg text-purple-400"><Edit2 size={14}/></button>
               <button onClick={() => deleteItem('CLIENT', c.id)} className="p-1.5 bg-white/5 hover:bg-rose-500/20 rounded-lg text-rose-500"><Trash2 size={14}/></button>
            </div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center font-viking text-xl text-white">
                {c.name[0]}
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                c.classification === 'VIP' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-gray-500/10 text-gray-400 border border-white/5'
              }`}>
                {c.classification}
              </span>
            </div>
            <h3 className="text-lg font-bold mb-1 text-white">{c.name}</h3>
            <p className="text-gray-500 text-xs mb-4">{c.phone} • {c.email}</p>
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Moedas de Honra</p>
                <p className="text-purple-400 font-bold">{c.points} pts</p>
              </div>
              <button className="p-2 hover:bg-purple-500/20 rounded-xl text-purple-400"><History size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // BAR, SHOP, FINANCE, ADMIN, INVENTORY renders same as previous but with setStates where needed
  const renderBar = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-viking tracking-widest uppercase text-white">Taberna de Valhalla</h1>
          <p className="text-gray-400">Vendas rápidas e hidroméis gelados.</p>
        </div>
        <button onClick={() => openModal('PRODUCT', 'ADD')} className="bg-amber-600 hover:bg-amber-500 px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 text-white">
           <Plus size={18} /> Novo Item
        </button>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.filter(p => p.category === 'BAR').map(p => (
          <div key={p.id} className="bg-[#0f0f0f] border border-white/5 rounded-3xl p-5 hover:border-amber-500/30 transition-all flex flex-col group relative">
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
               <button onClick={() => openModal('PRODUCT', 'EDIT', p)} className="p-1 bg-black/50 hover:bg-purple-500/30 rounded text-purple-400"><Edit2 size={12}/></button>
               <button onClick={() => deleteItem('PRODUCT', p.id)} className="p-1 bg-black/50 hover:bg-rose-500/30 rounded text-rose-500"><Trash2 size={12}/></button>
            </div>
            <div className="w-full aspect-square bg-white/5 rounded-2xl mb-4 flex items-center justify-center text-amber-500/20">
               <Beer size={64} />
            </div>
            <h3 className="font-bold text-lg mb-1 text-white">{p.name}</h3>
            <p className="text-xs text-gray-500 mb-4">{p.subCategory}</p>
            <div className="mt-auto flex items-center justify-between">
              <span className="text-xl font-bold text-amber-500">R$ {p.price}</span>
              <button onClick={() => handleSale(p)} className="bg-amber-600 hover:bg-amber-500 text-white p-2 rounded-xl transition-all active:scale-90 shadow-lg shadow-amber-900/20">
                <Plus size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderShop = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-viking tracking-widest uppercase text-white">Arsenal de Jóias & Mantos</h1>
          <p className="text-gray-400">O melhor para os clãs de Midgard.</p>
        </div>
        <button onClick={() => openModal('PRODUCT', 'ADD')} className="bg-indigo-700 hover:bg-indigo-600 px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 text-white">
           <Plus size={18} /> Novo Item
        </button>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.filter(p => p.category === 'SHOP').map(p => (
          <div key={p.id} className="bg-[#0f0f0f] border border-white/5 rounded-3xl p-5 hover:border-indigo-500/30 transition-all group relative">
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
               <button onClick={() => openModal('PRODUCT', 'EDIT', p)} className="p-1 bg-black/50 hover:bg-purple-500/30 rounded text-purple-400"><Edit2 size={12}/></button>
               <button onClick={() => deleteItem('PRODUCT', p.id)} className="p-1 bg-black/50 hover:bg-rose-500/30 rounded text-rose-500"><Trash2 size={12}/></button>
            </div>
            <div className="w-full aspect-square bg-white/5 rounded-2xl mb-4 flex items-center justify-center text-indigo-500/20">
               <ShoppingBag size={64} />
            </div>
            <h3 className="font-bold text-lg mb-1 text-white">{p.name}</h3>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-4">{p.subCategory}</p>
            <div className="flex items-center justify-between">
               <div className="text-xl font-bold text-indigo-400">R$ {p.price}</div>
               <button onClick={() => handleSale(p)} className="bg-indigo-600 hover:bg-indigo-500 p-2 text-white rounded-xl transition-all shadow-lg shadow-indigo-900/20">
                 <Plus size={20} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFinance = () => {
    const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-viking tracking-widest uppercase text-white">Tesouraria do Clã</h1>
          <div className="flex gap-4">
            <button onClick={() => openModal('TRANSACTION', 'ADD', { type: 'INCOME', date: new Date().toISOString().split('T')[0] })} className="bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-600/30 transition-all">Nova Entrada</button>
            <button onClick={() => openModal('TRANSACTION', 'ADD', { type: 'EXPENSE', date: new Date().toISOString().split('T')[0] })} className="bg-rose-600/20 text-rose-500 border border-rose-500/30 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rose-600/30 transition-all">Nova Saída</button>
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-gradient-to-br from-emerald-900/40 to-black border border-emerald-500/20 rounded-3xl p-6">
              <p className="text-emerald-500 font-bold text-xs uppercase tracking-widest mb-2">Entradas</p>
              <h3 className="text-3xl font-bold text-white">R$ {totalIncome.toLocaleString()}</h3>
           </div>
           <div className="bg-gradient-to-br from-rose-900/40 to-black border border-rose-500/20 rounded-3xl p-6">
              <p className="text-rose-500 font-bold text-xs uppercase tracking-widest mb-2">Saídas</p>
              <h3 className="text-3xl font-bold text-gray-300">R$ {totalExpense.toLocaleString()}</h3>
           </div>
           <div className="bg-gradient-to-br from-purple-900/40 to-black border border-purple-500/20 rounded-3xl p-6">
              <p className="text-purple-400 font-bold text-xs uppercase tracking-widest mb-2">Saldo Valhalla</p>
              <h3 className="text-3xl font-bold text-purple-400">R$ {(totalIncome - totalExpense).toLocaleString()}</h3>
           </div>
        </div>
        <div className="bg-[#0f0f0f] rounded-3xl border border-white/5 overflow-hidden">
           <div className="p-6 border-b border-white/5 flex justify-between items-center text-white">
              <h3 className="font-bold flex items-center gap-2"><List size={18} className="text-purple-500" /> Fluxo de Caixa Recente</h3>
           </div>
           <div className="divide-y divide-white/5">
              {transactions.map(t => (
                <div key={t.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                   <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {t.type === 'INCOME' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                      </div>
                      <div>
                         <p className="font-bold text-white">{t.description}</p>
                         <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{t.date} • {t.paymentMethod}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className={`font-bold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                         {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount}
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => openModal('TRANSACTION', 'EDIT', t)} className="p-1 hover:bg-purple-500/20 rounded text-purple-400"><Edit2 size={14}/></button>
                         <button onClick={() => deleteItem('TRANSACTION', t.id)} className="p-1 hover:bg-rose-500/20 rounded text-rose-500"><Trash2 size={14}/></button>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    );
  };

  const renderAdmin = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
       <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-viking tracking-widest uppercase text-white">Fortaleza Administrativa</h1>
            <p className="text-gray-400">Controle de acesso e registros do clã.</p>
          </div>
          <button onClick={() => openModal('USER', 'ADD')} className="bg-purple-700 hover:bg-purple-600 px-6 py-2 rounded-xl text-sm font-bold shadow-lg text-white">Adicionar Membro</button>
       </header>
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#0f0f0f] border border-white/5 rounded-3xl p-6">
             <h3 className="font-bold mb-6 flex items-center gap-2 text-white"><Users size={18} className="text-purple-500" /> Membros Ativos</h3>
             <div className="space-y-4">
                {users.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 group">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-viking">{u.name[0]}</div>
                        <div>
                           <p className="font-bold text-sm text-white">{u.name}</p>
                           <p className="text-[10px] text-purple-500 uppercase font-bold tracking-widest">{u.role}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                           <button onClick={() => openModal('USER', 'EDIT', u)} className="p-1.5 hover:bg-purple-500/20 rounded-lg text-purple-400"><Edit2 size={14}/></button>
                           <button onClick={() => deleteItem('USER', u.id)} className="p-1.5 hover:bg-rose-500/20 rounded-lg text-rose-500"><Trash2 size={14}/></button>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                     </div>
                  </div>
                ))}
             </div>
          </div>
          <div className="bg-[#0f0f0f] border border-white/5 rounded-3xl p-6">
             <h3 className="font-bold mb-6 flex items-center gap-2 text-white"><Zap size={18} className="text-amber-500" /> Logs de Atividade</h3>
             <div className="space-y-3 opacity-60">
                <p className="text-xs p-2 border-l border-amber-500/30 bg-white/5">Ragnar (Admin) abriu o caixa principal às 08:30.</p>
                <p className="text-xs p-2 border-l border-amber-500/30 bg-white/5">Backup automático para a nuvem concluído com sucesso.</p>
             </div>
          </div>
       </div>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-viking tracking-widest text-white uppercase">Arsenal & Suprimentos</h1>
          <p className="text-gray-400">Controle total de produtos e materiais.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => openModal('PRODUCT', 'ADD')} className="bg-purple-700 hover:bg-purple-600 px-6 py-2 rounded-xl text-sm font-bold shadow-lg text-white">Novo Item</button>
        </div>
      </header>
      <div className="bg-[#0f0f0f] rounded-3xl border border-white/5 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/5">
            <tr>
              <th className="px-6 py-4 font-bold text-sm text-gray-400">Produto</th>
              <th className="px-6 py-4 font-bold text-sm text-gray-400">Categoria</th>
              <th className="px-6 py-4 font-bold text-sm text-gray-400">Estoque</th>
              <th className="px-6 py-4 font-bold text-sm text-gray-400">Preço</th>
              <th className="px-6 py-4 font-bold text-sm text-gray-400">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4 font-medium text-white">{p.name}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${p.category === 'BAR' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {p.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={p.stock <= p.minStock ? 'text-rose-500 font-bold' : 'text-gray-300'}>{p.stock}</span>
                    {p.stock <= p.minStock && <AlertTriangle size={14} className="text-rose-500" />}
                  </div>
                </td>
                <td className="px-6 py-4 text-emerald-400 font-semibold">R$ {p.price}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-4">
                    <button onClick={() => openModal('PRODUCT', 'EDIT', p)} className="text-purple-400 hover:text-purple-300 font-bold text-sm">Editar</button>
                    <button onClick={() => deleteItem('PRODUCT', p.id)} className="text-rose-500 hover:text-rose-400 font-bold text-sm">Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'agenda': return renderAgenda();
      case 'clients': return renderClients();
      case 'bar': return renderBar();
      case 'shop': return renderShop();
      case 'finance': return renderFinance();
      case 'inventory': return renderInventory();
      case 'admin': return renderAdmin();
      default: return null;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser}>
      {renderContent()}
      
      {/* Dynamic CRUD Modal */}
      {modalType && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121212] border border-purple-900/40 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-viking text-xl tracking-widest text-white">
                {modalMode === 'EDIT' ? 'Ajustar Destino' : 'Forjar Novo'} - {modalType === 'APPOINTMENT' ? 'AGENDAMENTO' : modalType}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-white/5 rounded-full text-gray-500"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              {modalType === 'CLIENT' && (
                <>
                  <Input label="Nome do Guerreiro" name="name" defaultValue={selectedItem?.name} required />
                  <Input label="Telefone" name="phone" defaultValue={selectedItem?.phone} required />
                  <Input label="E-mail" name="email" type="email" defaultValue={selectedItem?.email} />
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Classificação" name="classification" defaultValue={selectedItem?.classification}>
                      <option value="Novo">Novo</option>
                      <option value="Recorrente">Recorrente</option>
                      <option value="VIP">VIP</option>
                    </Select>
                    <Input label="Pontos" name="points" type="number" defaultValue={selectedItem?.points || 0} />
                  </div>
                </>
              )}
              {modalType === 'PRODUCT' && (
                <>
                  <Input label="Nome do Item" name="name" defaultValue={selectedItem?.name} required />
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Categoria" name="category" defaultValue={selectedItem?.category || 'SHOP'}>
                      <option value="BAR">Bar</option>
                      <option value="SHOP">Loja</option>
                    </Select>
                    <Input label="Subcategoria" name="subCategory" defaultValue={selectedItem?.subCategory} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Input label="Preço (R$)" name="price" type="number" defaultValue={selectedItem?.price} required />
                    <Input label="Estoque" name="stock" type="number" defaultValue={selectedItem?.stock} required />
                    <Input label="Estoque Mín" name="minStock" type="number" defaultValue={selectedItem?.minStock} required />
                  </div>
                </>
              )}
              {modalType === 'TRANSACTION' && (
                <>
                  <Input label="Descrição" name="description" defaultValue={selectedItem?.description} required />
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Tipo" name="type" defaultValue={selectedItem?.type || 'INCOME'}>
                      <option value="INCOME">Entrada (Ouro)</option>
                      <option value="EXPENSE">Saída (Gasto)</option>
                    </Select>
                    <Input label="Valor (R$)" name="amount" type="number" defaultValue={selectedItem?.amount} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Categoria" name="category" defaultValue={selectedItem?.category || 'BILLS'}>
                      <option value="TATTOO">Tatuagem</option>
                      <option value="PIERCING">Piercing</option>
                      <option value="BAR">Bar</option>
                      <option value="SHOP">Loja</option>
                      <option value="RENT">Aluguel</option>
                      <option value="SUPPLIES">Suprimentos</option>
                      <option value="BILLS">Contas Gerais</option>
                    </Select>
                    <Select label="Método" name="paymentMethod" defaultValue={selectedItem?.paymentMethod || 'PIX'}>
                      <option value="PIX">PIX</option>
                      <option value="CARD">Cartão</option>
                      <option value="CASH">Dinheiro</option>
                    </Select>
                  </div>
                  <Input label="Data" name="date" type="date" defaultValue={selectedItem?.date || new Date().toISOString().split('T')[0]} />
                </>
              )}
              {modalType === 'USER' && (
                <>
                  <Input label="Nome do Membro" name="name" defaultValue={selectedItem?.name} required />
                  <Select label="Papel no Clã" name="role" defaultValue={selectedItem?.role || 'TATTOOIST'}>
                    <option value="ADMIN">Administrador (Jarl)</option>
                    <option value="TATTOOIST">Tatuador (Skald)</option>
                    <option value="PIERCER">Body Piercer</option>
                    <option value="BAR">Taberneiro</option>
                    <option value="SHOP">Mercador</option>
                    <option value="CASHIER">Tesoureiro</option>
                  </Select>
                </>
              )}
              {modalType === 'APPOINTMENT' && (
                <>
                  <AppointmentFormContent 
                    selectedItem={selectedItem} 
                    clients={clients} 
                    professionals={users.filter(u => u.role === UserRole.TATTOOIST || u.role === UserRole.PIERCER)} 
                    services={services}
                  />
                </>
              )}
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 font-bold transition-all text-white">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-3 rounded-2xl bg-purple-700 hover:bg-purple-600 font-bold shadow-lg shadow-purple-900/20 transition-all text-white">Gravar no Destino</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

// Sub-component for Appointment Form to manage its own "New Client" state
const AppointmentFormContent = ({ selectedItem, clients, professionals, services }: any) => {
  const [clientId, setClientId] = useState(selectedItem?.clientId || '');
  
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Guerreiro (Cliente)</label>
        <div className="flex gap-2">
          <select 
            name="clientId" 
            value={clientId} 
            onChange={(e) => setClientId(e.target.value)}
            className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-4 py-3 focus:border-purple-500/50 focus:bg-purple-500/5 outline-none transition-all text-white"
            required
          >
            <option value="" disabled>Escolha um guerreiro...</option>
            <option value="NEW">+ Novo Guerreiro</option>
            {clients.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {clientId === 'NEW' && (
        <div className="p-4 bg-purple-900/10 border border-purple-500/20 rounded-2xl space-y-3 animate-in slide-in-from-top-2 duration-300">
          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Cadastro Rápido</p>
          <Input label="Nome Completo" name="newClientName" required />
          <Input label="WhatsApp / Telefone" name="newClientPhone" required />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Select label="Especialidade" name="type" defaultValue={selectedItem?.type || 'TATTOO'}>
          <option value="TATTOO">Tatuagem</option>
          <option value="PIERCING">Body Piercing</option>
        </Select>
        <Select label="Serviço" name="serviceId" defaultValue={selectedItem?.serviceId} required>
          <option value="" disabled>Selecione...</option>
          {services.map((s: Service) => (
            <option key={s.id} value={s.id}>{s.name} (R$ {s.basePrice})</option>
          ))}
        </Select>
      </div>

      <Select label="Skald (Profissional)" name="professionalId" defaultValue={selectedItem?.professionalId} required>
        <option value="" disabled>Selecione um profissional...</option>
        {professionals.map((p: User) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </Select>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Data" name="date" type="date" defaultValue={selectedItem?.date || new Date().toISOString().split('T')[0]} required />
        <Input label="Horário" name="time" type="time" defaultValue={selectedItem?.time || '10:00'} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Duração (min)" name="duration" type="number" defaultValue={selectedItem?.duration || 60} />
        <Select label="Status" name="status" defaultValue={selectedItem?.status || AppointmentStatus.SCHEDULED}>
          {Object.values(AppointmentStatus).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>
    </div>
  );
};

// UI Components
const Input = ({ label, ...props }: any) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">{label}</label>
    <input 
      className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3 focus:border-purple-500/50 focus:bg-purple-500/5 outline-none transition-all placeholder:text-gray-700 text-white" 
      {...props} 
    />
  </div>
);

const Select = ({ label, children, ...props }: any) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">{label}</label>
    <select 
      className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3 focus:border-purple-500/50 focus:bg-purple-500/5 outline-none transition-all text-white" 
      {...props}
    >
      {children}
    </select>
  </div>
);

const StatCard = ({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) => (
  <div className="bg-[#0f0f0f] border border-white/5 rounded-3xl p-6 hover:border-purple-500/30 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform`}>{icon}</div>
      <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">Stats</div>
    </div>
    <p className="text-gray-400 text-sm font-medium">{title}</p>
    <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
  </div>
);

const AppointmentItem = ({ appointment, client, onEdit, onDelete }: { appointment: any, client: any, onEdit: () => void, onDelete: () => void }) => {
  const handleWhatsApp = () => {
    if (!client) return;
    const message = encodeURIComponent(`Saudações, ${client.name}! ⚔️\n\nConfirmamos seu agendamento de ${appointment.type === 'TATTOO' ? 'Tatuagem' : 'Piercing'} no Studio Viking.\n\n📅 Data: ${appointment.date}\n⏰ Horário: ${appointment.time}\n\nPrepare-se para o ritual! Nos vemos em breve no Valhalla.`);
    const phone = client.phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
  };
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/20 transition-all cursor-pointer group">
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center justify-center bg-black/40 w-12 h-12 rounded-xl border border-white/5 shadow-sm">
          <span className="text-[10px] text-purple-400 font-bold uppercase">{appointment.time.split(':')[0]}h</span>
          <span className="text-xs font-bold text-white">{appointment.time.split(':')[1]}</span>
        </div>
        <div>
          <p className="font-semibold text-sm group-hover:text-purple-400 transition-colors text-white">{client?.name || 'Cliente Desconhecido'}</p>
          <p className="text-xs text-gray-400 uppercase font-bold tracking-tighter">{appointment.status}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
         <button onClick={(e) => { e.stopPropagation(); handleWhatsApp(); }} className="p-2 hover:bg-emerald-500/10 rounded-lg text-emerald-500 transition-colors" title="Enviar WhatsApp"><MessageCircle size={18} /></button>
         <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 hover:bg-white/5 rounded-lg text-gray-400" title="Editar"><Edit2 size={16} /></button>
           <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 hover:bg-rose-500/10 rounded-lg text-rose-500" title="Excluir"><Trash2 size={16} /></button>
         </div>
      </div>
    </div>
  );
};

const WeeklyView = ({ currentDate, filteredAppointments, clients, onEdit }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
    {Array.from({ length: 7 }).map((_, i) => {
      const day = new Date(currentDate);
      day.setDate(currentDate.getDate() - currentDate.getDay() + i);
      const dayStr = day.toISOString().split('T')[0];
      const dayApps = filteredAppointments.filter((a: any) => a.date === dayStr);
      return (
        <div key={i} className={`bg-[#0f0f0f] rounded-2xl border ${day.getDate() === currentDate.getDate() ? 'border-purple-500/40' : 'border-white/5'} p-3 min-h-[300px]`}>
          <div className="text-center mb-4">
            <p className="text-[10px] uppercase font-bold text-gray-500">{day.toLocaleDateString('pt-BR', { weekday: 'short' })}</p>
            <p className={`text-lg font-viking ${day.getDate() === currentDate.getDate() ? 'text-purple-400' : 'text-white'}`}>{day.getDate()}</p>
          </div>
          <div className="space-y-2">
            {dayApps.map((a: any) => (
              <div 
                key={a.id} 
                onClick={() => onEdit(a)}
                className={`p-2 rounded-lg text-[10px] border border-white/5 cursor-pointer hover:border-white/20 transition-all ${a.type === 'TATTOO' ? 'bg-purple-900/20 text-purple-300' : 'bg-blue-900/20 text-blue-300'}`}
              >
                <p className="font-bold truncate">{clients.find((c: any) => c.id === a.clientId)?.name}</p>
                <p className="opacity-70">{a.time}</p>
              </div>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

const MonthlyView = ({ currentDate, filteredAppointments }: any) => (
  <div className="bg-[#0f0f0f] rounded-3xl border border-white/5 p-6 overflow-hidden">
    <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(d => (
        <div key={d} className="bg-[#1a1a1a] p-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">{d}</div>
      ))}
      {Array.from({ length: 35 }).map((_, i) => {
        const day = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        day.setDate(day.getDate() - day.getDay() + i);
        const dayStr = day.toISOString().split('T')[0];
        const dayApps = filteredAppointments.filter((a: any) => a.date === dayStr);
        const isCurrentMonth = day.getMonth() === currentDate.getMonth();
        return (
          <div key={i} className={`bg-[#0f0f0f] min-h-[100px] p-2 relative group hover:bg-white/[0.02] transition-colors ${!isCurrentMonth ? 'opacity-20' : ''}`}>
            <span className={`text-xs font-bold ${day.getDate() === currentDate.getDate() ? 'bg-purple-600 w-6 h-6 flex items-center justify-center rounded-full text-white' : 'text-gray-400'}`}>{day.getDate()}</span>
            <div className="mt-2 flex flex-wrap gap-1">
              {dayApps.slice(0, 5).map((a: any) => <div key={a.id} className={`w-1 h-1 rounded-full ${a.type === 'TATTOO' ? 'bg-purple-500' : 'bg-blue-500'}`}></div>)}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const Minus = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
