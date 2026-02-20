import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface InventoryEntry {
    quantityInStock: number;
    product: Product;
}
export type Time = bigint;
export interface ProductSale {
    id: bigint;
    farmerID?: FarmerID;
    productName: string;
    pricePerUnit: number;
    totalAmount: number;
    timestamp: Time;
    quantity: number;
}
export interface CollectionEntry {
    id: bigint;
    fat: number;
    snf?: number;
    weight: number;
    farmerID: FarmerID;
    date: Time;
    rate: number;
    milkType: MilkType;
    session: Session;
}
export type FarmerID = bigint;
export interface Farmer {
    name: string;
    milkType: MilkType;
    customerID: FarmerID;
    phone: string;
}
export interface Product {
    name: string;
}
export interface Transaction {
    id: bigint;
    farmerID: FarmerID;
    description: string;
    timestamp: Time;
    amount: number;
}
export enum MilkType {
    vlc = "vlc",
    thekadari = "thekadari"
}
export enum Session {
    morning = "morning",
    evening = "evening"
}
export interface backendInterface {
    addCollectionEntry(farmerID: FarmerID, weight: number, fat: number, snf: number | null, rate: number, session: Session): Promise<void>;
    addFarmer(name: string, phone: string, milkType: MilkType): Promise<FarmerID>;
    addInventoryEntry(productName: string, quantity: number): Promise<void>;
    addProductSale(farmerID: FarmerID | null, productName: string, quantity: number, pricePerUnit: number): Promise<bigint>;
    addTransaction(farmerID: FarmerID, description: string, amount: number): Promise<bigint>;
    getAllCollectionsForSession(session: Session, page: bigint): Promise<Array<CollectionEntry>>;
    getAllFarmers(): Promise<Array<Farmer>>;
    getAllInventory(): Promise<Array<InventoryEntry>>;
    getAllProductSales(): Promise<Array<ProductSale>>;
    getFarmer(id: FarmerID): Promise<Farmer>;
    getFarmerBalance(farmerID: FarmerID): Promise<number>;
    getFarmerTransactions(farmerID: FarmerID, page: bigint): Promise<Array<Transaction>>;
    getPaginatedCollections(farmerID: FarmerID, page: bigint): Promise<Array<CollectionEntry>>;
    getRates(): Promise<{
        vlc: number;
        thekadari: number;
    }>;
    updateCollectionEntry(farmerID: FarmerID, entryID: bigint, weight: number, fat: number, snf: number | null, rate: number, session: Session, milkType: MilkType): Promise<void>;
    updateFarmerDetails(id: FarmerID, name: string, phone: string, milkType: MilkType, customerID: FarmerID): Promise<void>;
    updateInventory(productName: string, quantity: number): Promise<void>;
    updateProductSale(saleID: bigint, farmerID: FarmerID | null, productName: string, quantity: number, pricePerUnit: number): Promise<void>;
    updateRates(vRate: number, tRate: number): Promise<void>;
    updateTransaction(farmerID: FarmerID, transactionID: bigint, description: string, amount: number): Promise<void>;
}
