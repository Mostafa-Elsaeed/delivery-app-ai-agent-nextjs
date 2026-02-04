import { useState, useEffect, useCallback } from "react";
import { Order, OrderStatus, Order as OrderType, UserRole } from "../types";
import {
  Orders as OrdersAPI,
  Bids as BidsAPI,
  Messages as MessagesAPI,
  Reviews as ReviewsAPI,
} from "../src/api";
import { getSocket } from "../src/realtime";

// Helper to map DB order to UI Order type (Moved from App.tsx)
export const mapOrder = (dbOrder: any): OrderType => ({
  id: dbOrder.id,
  storeId: dbOrder.storeId,
  storeName: dbOrder.storeName,
  productName: dbOrder.productName,
  productPrice: Number(dbOrder.productPrice),
  deliveryFeeOffer: Number(dbOrder.suggestedDeliveryFee),
  deliveryAddress: dbOrder.destination,
  clientName: dbOrder.clientName || "",
  clientPhone: dbOrder.clientPhone || "",
  status: dbOrder.status as OrderStatus,
  bids: (dbOrder.bids || []).map((b: any) => ({
    id: b.id,
    deliveryGuyId: b.deliveryGuyId,
    deliveryGuyName: b.deliveryGuyName,
    amount: Number(b.proposedFee || b.amount),
    timestamp: new Date(b.timestamp).getTime(),
  })),
  messages: [],
  selectedBidId: dbOrder.chosenBidId,
  deliveryGuyId: dbOrder.deliveryGuyId,
  storeEscrowPaid: dbOrder.storeDeposited,
  deliveryEscrowPaid: dbOrder.riderDeposited,
  createdAt: new Date(dbOrder.created_at).getTime(),
  storeReviewed: false,
  riderReviewed: false,
});

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<any[]>([]); // simplified for now

  const fetchAndSetData = useCallback(async () => {
    const [ordersData, reviewsData, messagesData, bidsData] = await Promise.all(
      [OrdersAPI.list(), ReviewsAPI.list(), MessagesAPI.list(), BidsAPI.list()],
    );

    // Build Users map for ratings
    const userMap = new Map<string, any>();
    const ensureUser = (id: string) => {
      if (!userMap.has(id)) {
        userMap.set(id, {
          id,
          email: "",
          name: "",
          role: UserRole.DELIVERY,
          reviews: [],
          wallet: { balance: 0, escrowHeld: 0, transactions: [] },
        });
      }
    };

    reviewsData?.forEach((r: any) => {
      ensureUser(r.targetUserId);
      userMap.get(r.targetUserId)!.reviews.push({
        id: r.id,
        reviewerId: r.reviewerId,
        reviewerName: r.reviewerName,
        rating: r.rating,
        comment: r.comment,
        timestamp: new Date(r.timestamp).getTime(),
      });
    });
    setUsers(Array.from(userMap.values()));

    if (ordersData) {
      const mappedOrders = ordersData.map((dbOrder) => {
        const baseOrder = mapOrder(dbOrder);
        if (!baseOrder.bids || baseOrder.bids.length === 0) {
          const matchingBids =
            bidsData?.filter((b: any) => b.orderId === dbOrder.id) || [];
          baseOrder.bids = matchingBids.map((b: any) => ({
            id: b.id,
            deliveryGuyId: b.userId || b.deliveryGuyId,
            deliveryGuyName: b.userName || b.deliveryGuyName || "Rider",
            amount: Number(b.amount || b.proposedFee),
            timestamp: new Date(b.timestamp).getTime(),
          }));
        }
        baseOrder.messages =
          messagesData
            ?.filter((m: any) => m.orderId === dbOrder.id)
            .map((m: any) => ({
              id: m.id,
              senderId: m.senderId,
              text: m.text,
              timestamp: new Date(m.timestamp).getTime(),
            })) || [];
        baseOrder.storeReviewed = (reviewsData || []).some(
          (r: any) =>
            r.orderId === dbOrder.id && r.reviewerId === dbOrder.storeId,
        );
        baseOrder.riderReviewed = (reviewsData || []).some(
          (r: any) =>
            r.orderId === dbOrder.id && r.reviewerId === dbOrder.deliveryGuyId,
        );
        return baseOrder;
      });

      mappedOrders.forEach(async (o) => {
        if (
          o.status === OrderStatus.AWAITING_ESCROW &&
          o.storeEscrowPaid &&
          o.deliveryEscrowPaid
        ) {
          await OrdersAPI.setStatus(o.id, OrderStatus.READY_FOR_PICKUP);
        }
      });
      setOrders(mappedOrders);
    }
  }, []);

  useEffect(() => {
    fetchAndSetData();
    const id = setInterval(fetchAndSetData, 15000);
    const socket = getSocket(
      import.meta.env.VITE_API_BASE || "http://localhost:3000",
    );
    const refetch = () => fetchAndSetData();

    const events = [
      "orders.created",
      "orders.updated",
      "bids.created",
      "bids.updated",
      "wallets.updated",
      "messages.created",
      "reviews.created",
    ];

    events.forEach((event) => socket.on(event, refetch));

    return () => {
      clearInterval(id);
      events.forEach((event) => socket.off(event, refetch));
      socket.close();
    };
  }, [fetchAndSetData]);

  const createOrder = async (orderData: any) => {
    await OrdersAPI.create(orderData);
    fetchAndSetData();
  };

  const placeBid = async (orderId: string, userId: string, amount: number) => {
    const existingBid = orders
      .find((o) => o.id === orderId)
      ?.bids.find((b) => b.deliveryGuyId === userId);
    if (existingBid) {
      await BidsAPI.update(existingBid.id, { amount });
    } else {
      await BidsAPI.create({ orderId, userId, amount });
    }
    fetchAndSetData();
  };

  const selectBidder = async (orderId: string, bidId: string) => {
    await OrdersAPI.setStatus(orderId, OrderStatus.AWAITING_ESCROW);
    fetchAndSetData();
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await OrdersAPI.setStatus(orderId, status);
    fetchAndSetData();
  };

  const submitReview = async (reviewData: any) => {
    await ReviewsAPI.create(reviewData);
    fetchAndSetData();
  };

  const sendMessage = async (messageData: any) => {
    await MessagesAPI.create(messageData);
    fetchAndSetData();
  };

  return {
    orders,
    users,
    fetchAndSetData,
    createOrder,
    placeBid,
    selectBidder,
    updateOrderStatus,
    submitReview,
    sendMessage,
  };
};
