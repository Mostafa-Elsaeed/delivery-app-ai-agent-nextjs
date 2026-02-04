
import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, Order, OrderStatus, Bid, User, Message, Review } from './types';
import StorePortal from './components/StorePortal';
import DeliveryPortal from './components/DeliveryPortal';
import Navbar from './components/Navbar';
import ChatModal from './components/ChatModal';
import AuthPortal from './components/AuthPortal';
import LandingPage from './components/LandingPage';
// import { supabase } from './supabaseClient';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Orders as OrdersAPI, Bids as BidsAPI, Wallets as WalletsAPI, Messages as MessagesAPI, Reviews as ReviewsAPI } from './src/api';
import { getSocket } from './src/realtime';
import { translations } from './translations';

// Helper to map DB order to UI Order type
const mapOrder = (dbOrder: any): Order => ({
  id: dbOrder.id,
  storeId: dbOrder.storeId,
  storeName: dbOrder.storeName,
  productName: dbOrder.productName,
  productPrice: Number(dbOrder.productPrice),
  deliveryFeeOffer: Number(dbOrder.suggestedDeliveryFee),
  deliveryAddress: dbOrder.destination,
  clientName: dbOrder.clientName || '',
  clientPhone: dbOrder.clientPhone || '',
  status: dbOrder.status as OrderStatus,
  bids: (dbOrder.bids || []).map((b: any) => ({
    id: b.id,
    deliveryGuyId: b.deliveryGuyId,
    deliveryGuyName: b.deliveryGuyName,
    amount: Number(b.proposedFee || b.amount),
    timestamp: new Date(b.timestamp).getTime()
  })),
  messages: [], // Messages table not provided, keeping empty
  selectedBidId: dbOrder.chosenBidId,
  deliveryGuyId: dbOrder.deliveryGuyId,
  storeEscrowPaid: dbOrder.storeDeposited,
  deliveryEscrowPaid: dbOrder.riderDeposited,
  createdAt: new Date(dbOrder.created_at).getTime(),
  storeReviewed: false,
  riderReviewed: false
});

// Define types for Dashboard props to keep it clean
interface DashboardProps {
  currentUser: User | null;
  isLoading: boolean;
  users: User[];
  orders: Order[];
  activeChatOrderId: string | null;
  setActiveChatOrderId: (id: string | null) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  toggleLanguage: () => void;
  lang: 'en' | 'ar';
  handleAuth: (user: User) => void;
  handleSignup: (newUser: User) => void;
  handleLogout: () => void;
  createOrder: (productName: string, productPrice: number, deliveryFee: number, deliveryAddress: string, clientName: string, clientPhone: string) => Promise<void>;
  placeBid: (orderId: string, amount: number) => Promise<void>;
  selectBidder: (orderId: string, bidId: string) => Promise<void>;
  payStoreEscrow: (orderId: string) => Promise<void>;
  payDeliveryEscrow: (orderId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  submitReview: (orderId: string, targetUserId: string, rating: number, comment: string) => Promise<void>;
  sendMessage: (orderId: string, text: string) => Promise<void>;
  t: any;
}

const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  isLoading,
  users,
  orders,
  activeChatOrderId,
  setActiveChatOrderId,
  isDarkMode,
  toggleTheme,
  toggleLanguage,
  lang,
  handleAuth,
  handleSignup,
  handleLogout,
  createOrder,
  placeBid,
  selectBidder,
  payStoreEscrow,
  payDeliveryEscrow,
  updateOrderStatus,
  submitReview,
  sendMessage,
  t
}) => {
  const navigate = useNavigate();

  if (!currentUser) {
    if (isLoading) return null;
    return (
      <AuthPortal 
        onAuth={handleAuth} 
        existingUsers={users} 
        onSignup={handleSignup} 
        isDarkMode={isDarkMode} 
        onToggleTheme={toggleTheme} 
        t={t} 
        onToggleLanguage={toggleLanguage} 
      />
    );
  }

  const activeChatOrder = orders.find(o => o.id === activeChatOrderId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 animate-in fade-in duration-500">
      <Navbar
        role={currentUser.role}
        onLogout={() => {
          handleLogout();
          navigate('/');
        }}
        wallet={currentUser.wallet || { balance: 0, escrowHeld: 0, transactions: [] }}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        t={t}
        onToggleLanguage={toggleLanguage}
      />

      <main className="flex-grow container mx-auto px-4 py-8">
        {(currentUser.role === UserRole.STORE || currentUser.role === 'store') ? (
          <StorePortal
            orders={orders.filter(o => o.storeId === currentUser.id)}
            users={users}
            onCreate={createOrder}
            onSelectBidder={selectBidder}
            onPayEscrow={payStoreEscrow}
            onOpenChat={(id) => setActiveChatOrderId(id)}
            onUpdateStatus={updateOrderStatus}
            onReview={submitReview}
            t={t}
          />
        ) : (
          <DeliveryPortal
            currentUser={currentUser}
            orders={orders}
            users={users}
            onBid={placeBid}
            onPayEscrow={payDeliveryEscrow}
            onUpdateStatus={updateOrderStatus}
            onOpenChat={(id) => setActiveChatOrderId(id)}
            onReview={submitReview}
            t={t}
          />
        )}
      </main>

      {activeChatOrder && (
        <ChatModal
          order={activeChatOrder}
          currentUserId={currentUser.id}
          onClose={() => setActiveChatOrderId(null)}
          onSend={(text) => sendMessage(activeChatOrder.id, text)}
          t={t}
        />
      )}

      <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 py-6 mt-12 transition-colors">
        <div className="container mx-auto px-4 text-center text-gray-500 dark:text-slate-400 text-sm">
          &copy; 2024 {t.appName} Delivery. {t.secureDeliveryMarketplace}.
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser === 'undefined' || !savedUser) return null;
    try {
      return JSON.parse(savedUser);
    } catch (e) {
      console.error('Failed to parse user from local storage:', e);
      localStorage.removeItem('currentUser');
      return null;
    }
  });
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeChatOrderId, setActiveChatOrderId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [isLoading, setIsLoading] = useState(true);
  const [lang, setLang] = useState<'en' | 'ar'>('en');

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'ar' : 'en';
    setLang(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const fetchAndSetData = useCallback(async () => {
    const [ordersData, reviewsData, messagesData, bidsData] = await Promise.all([
      OrdersAPI.list(),
      ReviewsAPI.list(),
      MessagesAPI.list(),
      BidsAPI.list(),
    ]);

    const userMap = new Map<string, User>();
    const ensureUser = (id: string) => {
      if (!userMap.has(id)) {
        userMap.set(id, {
          id, email: '', name: '', role: UserRole.DELIVERY, reviews: [],
          wallet: { balance: 0, escrowHeld: 0, transactions: [] }
        });
      }
    };

    reviewsData?.forEach((r: any) => {
      ensureUser(r.targetUserId);
      userMap.get(r.targetUserId)!.reviews.push({
        id: r.id, reviewerId: r.reviewerId, reviewerName: r.reviewerName,
        rating: r.rating, comment: r.comment, timestamp: new Date(r.timestamp).getTime()
      });
    });
    setUsers(Array.from(userMap.values()));

    if (ordersData) {
      const mappedOrders = ordersData.map(dbOrder => {
        const baseOrder = mapOrder(dbOrder);
        if (!baseOrder.bids || baseOrder.bids.length === 0) {
          const matchingBids = bidsData?.filter((b: any) => b.orderId === dbOrder.id) || [];
          baseOrder.bids = matchingBids.map((b: any) => ({
            id: b.id,
            deliveryGuyId: b.userId || b.deliveryGuyId,
            deliveryGuyName: b.userName || b.deliveryGuyName || 'Rider',
            amount: Number(b.amount || b.proposedFee),
            timestamp: new Date(b.timestamp).getTime()
          }));
        }
        baseOrder.messages = messagesData?.filter((m: any) => m.orderId === dbOrder.id).map((m: any) => ({
          id: m.id, senderId: m.senderId, text: m.text, timestamp: new Date(m.timestamp).getTime()
        })) || [];
        baseOrder.storeReviewed = (reviewsData || []).some((r: any) => r.orderId === dbOrder.id && r.reviewerId === dbOrder.storeId);
        baseOrder.riderReviewed = (reviewsData || []).some((r: any) => r.orderId === dbOrder.id && r.reviewerId === dbOrder.deliveryGuyId);
        return baseOrder;
      });

      mappedOrders.forEach(async (o) => {
        if (o.status === OrderStatus.AWAITING_ESCROW && o.storeEscrowPaid && o.deliveryEscrowPaid) {
          await OrdersAPI.setStatus(o.id, OrderStatus.READY_FOR_PICKUP);
        }
      });
      setOrders(mappedOrders);
    }
  }, []);

  useEffect(() => {
    setIsLoading(false);
  }, [fetchAndSetData]);

  useEffect(() => {
    fetchAndSetData();
    const id = setInterval(fetchAndSetData, 15000);
    const socket = getSocket(import.meta.env.VITE_API_BASE || 'http://localhost:3000');
    const refetch = () => fetchAndSetData();
    socket.on('orders.created', refetch);
    socket.on('orders.updated', refetch);
    socket.on('bids.created', refetch);
    socket.on('bids.updated', refetch);
    socket.on('wallets.updated', refetch);
    socket.on('messages.created', refetch);
    socket.on('reviews.created', refetch);
    return () => { clearInterval(id); socket.close(); };
  }, [fetchAndSetData]);

  useEffect(() => {
    if (!currentUser?.id) return;
    const fetchWallet = async () => {
      let walletData = await WalletsAPI.get(currentUser.id);
      if (walletData) {
        setCurrentUser(prev => prev ? ({
          ...prev,
          wallet: {
            balance: Number(walletData.balance),
            escrowHeld: Number(walletData.escrow),
            transactions: []
          }
        }) : null);
      }
    };
    fetchWallet();
    const id = setInterval(fetchWallet, 15000);
    return () => clearInterval(id);
  }, [currentUser?.id]);

  const createOrder = async (productName: string, productPrice: number, deliveryFee: number, deliveryAddress: string, clientName: string, clientPhone: string) => {
    if (!currentUser) return;
    await OrdersAPI.create({
      storeId: currentUser.id,
      storeName: currentUser.name,
      productName, productPrice, suggestedDeliveryFee: deliveryFee, destination: deliveryAddress, clientName, clientPhone, status: OrderStatus.BIDDING,
    });
    fetchAndSetData();
  };

  const placeBid = async (orderId: string, amount: number) => {
    if (!currentUser) return;
    const existingBid = orders.find(o => o.id === orderId)?.bids.find(b => b.deliveryGuyId === currentUser.id);
    if (existingBid) {
      await BidsAPI.update(existingBid.id, { amount });
    } else {
      await BidsAPI.create({ orderId, userId: currentUser.id, amount });
    }
    fetchAndSetData();
  };

  const selectBidder = async (orderId: string, bidId: string) => {
    await OrdersAPI.setStatus(orderId, OrderStatus.AWAITING_ESCROW);
    fetchAndSetData();
  };

  const payStoreEscrow = async (orderId: string) => {
    if (!currentUser) return;
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const selectedBid = order.bids.find(b => b.id === order.selectedBidId);
    const fee = selectedBid ? selectedBid.amount : order.deliveryFeeOffer;
    if (!currentUser.wallet || currentUser.wallet.balance < fee) return alert("Insufficient balance");
    await WalletsAPI.update(currentUser.id, { balance: currentUser.wallet.balance - fee, escrow: currentUser.wallet.escrowHeld + fee });
    const newStatus = order.deliveryEscrowPaid ? OrderStatus.READY_FOR_PICKUP : OrderStatus.AWAITING_ESCROW;
    await OrdersAPI.setStatus(orderId, newStatus);
    fetchAndSetData();
  };

  const payDeliveryEscrow = async (orderId: string) => {
    if (!currentUser) return;
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    if (!currentUser.wallet || currentUser.wallet.balance < order.productPrice) return alert("Insufficient balance");
    await WalletsAPI.update(currentUser.id, { balance: currentUser.wallet.balance - order.productPrice, escrow: currentUser.wallet.escrowHeld + order.productPrice });
    const newStatus = order.storeEscrowPaid ? OrderStatus.READY_FOR_PICKUP : OrderStatus.AWAITING_ESCROW;
    await OrdersAPI.setStatus(orderId, newStatus);
    fetchAndSetData();
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await OrdersAPI.setStatus(orderId, status);
    fetchAndSetData();
  };

  const submitReview = async (orderId: string, targetUserId: string, rating: number, comment: string) => {
    if (!currentUser) return;
    await ReviewsAPI.create({ orderId, reviewerId: currentUser.id, reviewerName: currentUser.name, targetUserId, rating, comment });
    fetchAndSetData();
  };

  const sendMessage = async (orderId: string, text: string) => {
    if (!currentUser) return;
    await MessagesAPI.create({ orderId, senderId: currentUser.id, content: text });
    fetchAndSetData();
  };

  const handleAuth = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };
  const handleSignup = (newUser: User) => setUsers(prev => [...prev, newUser]);
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  const t = translations[lang];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage t={t} isDarkMode={isDarkMode} onToggleTheme={toggleTheme} onToggleLanguage={toggleLanguage} />} />
        <Route 
          path="/dashboard" 
          element={
            <Dashboard 
              currentUser={currentUser}
              isLoading={isLoading}
              users={users}
              orders={orders}
              activeChatOrderId={activeChatOrderId}
              setActiveChatOrderId={setActiveChatOrderId}
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
              toggleLanguage={toggleLanguage}
              lang={lang}
              handleAuth={handleAuth}
              handleSignup={handleSignup}
              handleLogout={handleLogout}
              createOrder={createOrder}
              placeBid={placeBid}
              selectBidder={selectBidder}
              payStoreEscrow={payStoreEscrow}
              payDeliveryEscrow={payDeliveryEscrow}
              updateOrderStatus={updateOrderStatus}
              submitReview={submitReview}
              sendMessage={sendMessage}
              t={t}
            />
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
