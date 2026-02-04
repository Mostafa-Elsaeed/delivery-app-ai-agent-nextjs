import { useEffect, useCallback } from "react";
import { Wallets as WalletsAPI } from "../src/api";
import { User } from "../types";

export const useWallet = (
  currentUser: User | null,
  setCurrentUser: (user: User | null) => void,
) => {
  const fetchWallet = useCallback(async () => {
    if (!currentUser?.id) return;

    try {
      const walletData = await WalletsAPI.get(currentUser.id);
      if (walletData) {
        setCurrentUser({
          ...currentUser,
          wallet: {
            balance: Number(walletData.balance),
            escrowHeld: Number(walletData.escrow),
            transactions: [], // Transactions logic can be added later
          },
        });
      }
    } catch (error) {
      console.error("Failed to fetch wallet:", error);
    }
  }, [currentUser?.id, setCurrentUser]);

  useEffect(() => {
    fetchWallet();
    const id = setInterval(fetchWallet, 15000);
    return () => clearInterval(id);
  }, [fetchWallet]);

  const payEscrow = async (
    userId: string,
    balance: number,
    escrow: number,
    newOrderStatus: any,
  ) => {
    // Current specific implementations from App.tsx can be generalized here or kept specialized
    // For now, these are handled in App.tsx / DashboardPage.tsx using WalletsAPI directly
  };

  return { fetchWallet };
};
