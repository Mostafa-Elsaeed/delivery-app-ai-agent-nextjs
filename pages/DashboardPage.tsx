
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoot } from '../context/RootContext';
import { useOrders } from '../hooks/useOrders';
import { useWallet } from '../hooks/useWallet';
import { UserRole, OrderStatus } from '../types';
import { Wallets as WalletsAPI } from '../src/api';

import Navbar from '../components/Navbar';
import AuthPortal from '../components/AuthPortal';
import StorePortal from '../components/StorePortal';
import DeliveryPortal from '../components/DeliveryPortal';
import ChatModal from '../components/ChatModal';

const DashboardPage: React.FC = () => {
  const { 
    currentUser, setCurrentUser, isLoading, 
    isDarkMode, toggleTheme, lang, toggleLanguage, t 
  } = useRoot();
  
  const { 
    orders, users, createOrder, placeBid, selectBidder, 
    updateOrderStatus, submitReview, sendMessage 
  } = useOrders();

  useWallet(currentUser, setCurrentUser);
  
  const [activeChatOrderId, setActiveChatOrderId] = useState<string | null>(null);
  const navigate = useNavigate();

  if (!currentUser) {
    if (isLoading) return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
    
    return (
      <AuthPortal 
        onAuth={setCurrentUser} 
        existingUsers={users} 
        onSignup={(user) => {}} // existingUsers is updated via useOrders
        isDarkMode={isDarkMode} 
        onToggleTheme={toggleTheme} 
        t={t} 
        onToggleLanguage={toggleLanguage} 
      />
    );
  }

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  // Specialized handlers for Escrow payments (keeping current logic)
  const handlePayStoreEscrow = async (orderId: string) => {
    if (!currentUser?.wallet) return;
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const selectedBid = order.bids.find(b => b.id === order.selectedBidId);
    const fee = selectedBid ? selectedBid.amount : order.deliveryFeeOffer;

    if (currentUser.wallet.balance < fee) return alert("Insufficient balance");

    await WalletsAPI.update(currentUser.id, {
      balance: currentUser.wallet.balance - fee,
      escrow: currentUser.wallet.escrowHeld + fee,
    });

    const newStatus = order.deliveryEscrowPaid ? OrderStatus.READY_FOR_PICKUP : OrderStatus.AWAITING_ESCROW;
    await updateOrderStatus(orderId, newStatus);
  };

  const handlePayDeliveryEscrow = async (orderId: string) => {
    if (!currentUser?.wallet) return;
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (currentUser.wallet.balance < order.productPrice) return alert("Insufficient balance");

    await WalletsAPI.update(currentUser.id, {
      balance: currentUser.wallet.balance - order.productPrice,
      escrow: currentUser.wallet.escrowHeld + order.productPrice,
    });

    const newStatus = order.storeEscrowPaid ? OrderStatus.READY_FOR_PICKUP : OrderStatus.AWAITING_ESCROW;
    await updateOrderStatus(orderId, newStatus);
  };

  const activeChatOrder = orders.find(o => o.id === activeChatOrderId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 animate-in fade-in duration-500">
      <Navbar
        role={currentUser.role}
        onLogout={handleLogout}
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
            onCreate={(pn, pp, df, da, cn, cp) => createOrder({
              storeId: currentUser.id, storeName: currentUser.name,
              productName: pn, productPrice: pp, suggestedDeliveryFee: df,
              destination: da, clientName: cn, clientPhone: cp, status: OrderStatus.BIDDING
            })}
            onSelectBidder={selectBidder}
            onPayEscrow={handlePayStoreEscrow}
            onOpenChat={setActiveChatOrderId}
            onUpdateStatus={updateOrderStatus}
            onReview={(oid, tuid, r, c) => submitReview({
              orderId: oid, reviewerId: currentUser.id, reviewerName: currentUser.name,
              targetUserId: tuid, rating: r, comment: c
            })}
            t={t}
          />
        ) : (
          <DeliveryPortal
            currentUser={currentUser}
            orders={orders}
            users={users}
            onBid={(oid, amt) => placeBid(oid, currentUser.id, amt)}
            onPayEscrow={handlePayDeliveryEscrow}
            onUpdateStatus={updateOrderStatus}
            onOpenChat={setActiveChatOrderId}
            onReview={(oid, tuid, r, c) => submitReview({
              orderId: oid, reviewerId: currentUser.id, reviewerName: currentUser.name,
              targetUserId: tuid, rating: r, comment: c
            })}
            t={t}
          />
        )}
      </main>

      {activeChatOrder && (
        <ChatModal
          order={activeChatOrder}
          currentUserId={currentUser.id}
          onClose={() => setActiveChatOrderId(null)}
          onSend={(text) => sendMessage({
            orderId: activeChatOrder.id, senderId: currentUser.id, content: text
          })}
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

export default DashboardPage;
