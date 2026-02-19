import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Farmer, CollectionEntry, Transaction, InventoryEntry, ProductSale, FarmerID, Session, MilkType } from '../backend';

// Farmers
export function useGetAllFarmers() {
  const { actor, isFetching } = useActor();

  return useQuery<Farmer[]>({
    queryKey: ['farmers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFarmers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetFarmer(id: FarmerID | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Farmer | null>({
    queryKey: ['farmer', id?.toString()],
    queryFn: async () => {
      if (!actor || !id) return null;
      try {
        return await actor.getFarmer(id);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useAddFarmer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; phone: string; milkType: MilkType }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addFarmer(data.name, data.phone, data.milkType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
    },
  });
}

export function useUpdateFarmerDetails() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: FarmerID; name: string; phone: string; milkType: MilkType; customerID: FarmerID }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateFarmerDetails(data.id, data.name, data.phone, data.milkType, data.customerID);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmers'] });
      queryClient.invalidateQueries({ queryKey: ['farmer'] });
    },
  });
}

// Rates
export function useGetRates() {
  const { actor, isFetching } = useActor();

  return useQuery<{ vlc: number; thekadari: number }>({
    queryKey: ['rates'],
    queryFn: async () => {
      if (!actor) return { vlc: 0, thekadari: 0 };
      return actor.getRates();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateRates() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { vlcRate: number; thekadariRate: number }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateRates(data.vlcRate, data.thekadariRate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rates'] });
    },
  });
}

// Collections
export function useGetAllCollectionsForSession(session: Session) {
  const { actor, isFetching } = useActor();

  return useQuery<CollectionEntry[]>({
    queryKey: ['collections', session],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCollectionsForSession(session);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCollectionEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      farmerID: FarmerID;
      weight: number;
      fat: number;
      snf: number | null;
      rate: number;
      session: Session;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addCollectionEntry(
        data.farmerID,
        data.weight,
        data.fat,
        data.snf,
        data.rate,
        data.session
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });
}

// Transactions
export function useGetFarmerBalance(farmerID: FarmerID | null) {
  const { actor, isFetching } = useActor();

  return useQuery<number>({
    queryKey: ['balance', farmerID?.toString()],
    queryFn: async () => {
      if (!actor || !farmerID) return 0;
      return actor.getFarmerBalance(farmerID);
    },
    enabled: !!actor && !isFetching && !!farmerID,
  });
}

export function useGetFarmerTransactions(farmerID: FarmerID | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['transactions', farmerID?.toString()],
    queryFn: async () => {
      if (!actor || !farmerID) return [];
      return actor.getFarmerTransactions(farmerID);
    },
    enabled: !!actor && !isFetching && !!farmerID,
  });
}

export function useAddTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { farmerID: FarmerID; description: string; amount: number }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addTransaction(data.farmerID, data.description, data.amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });
}

// Inventory
export function useGetAllInventory() {
  const { actor, isFetching } = useActor();

  return useQuery<InventoryEntry[]>({
    queryKey: ['inventory'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllInventory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddInventoryEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { productName: string; quantity: number }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addInventoryEntry(data.productName, data.quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useUpdateInventory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { productName: string; quantity: number }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateInventory(data.productName, data.quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

// Product Sales
export function useGetAllProductSales() {
  const { actor, isFetching } = useActor();

  return useQuery<ProductSale[]>({
    queryKey: ['sales'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProductSales();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddProductSale() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      farmerID: FarmerID | null;
      productName: string;
      quantity: number;
      pricePerUnit: number;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addProductSale(data.farmerID, data.productName, data.quantity, data.pricePerUnit);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });
}
