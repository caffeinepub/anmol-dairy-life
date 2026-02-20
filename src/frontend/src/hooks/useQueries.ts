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
    staleTime: 3 * 60 * 1000, // 3 minutes - farmers list doesn't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes cache
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
    staleTime: 10 * 60 * 1000, // 10 minutes - rates change infrequently
    gcTime: 30 * 60 * 1000, // 30 minutes cache
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

// Collections - Paginated
export function useGetAllCollectionsForSession(session: Session, page: number = 0) {
  const { actor, isFetching } = useActor();

  return useQuery<CollectionEntry[]>({
    queryKey: ['collections', session, page],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCollectionsForSession(session, BigInt(page));
    },
    enabled: !!actor && !isFetching,
  });
}

// Lazy query for bill generation - only fetches when explicitly triggered
export function useGetCollectionsForBill(farmerID: FarmerID | null, enabled: boolean = false) {
  const { actor, isFetching } = useActor();

  return useQuery<CollectionEntry[]>({
    queryKey: ['collections', 'bill', farmerID?.toString()],
    queryFn: async () => {
      if (!actor || !farmerID) return [];
      // Fetch all pages for the farmer
      const allCollections: CollectionEntry[] = [];
      let page = 0;
      let hasMore = true;
      
      while (hasMore) {
        const pageData = await actor.getPaginatedCollections(farmerID, BigInt(page));
        if (pageData.length === 0) {
          hasMore = false;
        } else {
          allCollections.push(...pageData);
          page++;
        }
      }
      
      return allCollections;
    },
    enabled: !!actor && !isFetching && !!farmerID && enabled,
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

// Transactions - Paginated
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

export function useGetFarmerTransactions(farmerID: FarmerID | null, page: number = 0) {
  const { actor, isFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['transactions', farmerID?.toString(), page],
    queryFn: async () => {
      if (!actor || !farmerID) return [];
      return actor.getFarmerTransactions(farmerID, BigInt(page));
    },
    enabled: !!actor && !isFetching && !!farmerID,
  });
}

// Fetch all transactions for PDF export (non-paginated)
export function useGetAllFarmerTransactions(farmerID: FarmerID | null, enabled: boolean = false) {
  const { actor, isFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['transactions', 'all', farmerID?.toString()],
    queryFn: async () => {
      if (!actor || !farmerID) return [];
      // Fetch all pages
      const allTransactions: Transaction[] = [];
      let page = 0;
      let hasMore = true;
      
      while (hasMore) {
        const pageData = await actor.getFarmerTransactions(farmerID, BigInt(page));
        if (pageData.length === 0) {
          hasMore = false;
        } else {
          allTransactions.push(...pageData);
          page++;
        }
      }
      
      return allTransactions;
    },
    enabled: !!actor && !isFetching && !!farmerID && enabled,
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
