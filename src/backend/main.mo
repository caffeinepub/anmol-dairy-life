import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Migration "migration";

// Use migration function specified in the migration module during upgrades
(with migration = Migration.run)
actor {
  type FarmerID = Int;

  type MilkType = {
    #vlc;
    #thekadari;
  };

  type Farmer = {
    customerID : FarmerID;
    name : Text;
    phone : Text;
    milkType : MilkType;
  };

  module Farmer {
    public func compare(f : Farmer, g : Farmer) : Order.Order {
      Int.compare(f.customerID, g.customerID);
    };
  };

  type Session = {
    #morning;
    #evening;
  };

  type CollectionEntry = {
    id : Int;
    date : Time.Time;
    session : Session;
    farmerID : FarmerID;
    weight : Float;
    fat : Float;
    snf : ?Float;
    rate : Float;
    milkType : MilkType;
  };

  type Transaction = {
    id : Int;
    timestamp : Time.Time;
    farmerID : FarmerID;
    description : Text;
    amount : Float;
  };

  module Transaction {
    public func compare(t : Transaction, u : Transaction) : Order.Order {
      Int.compare(t.id, u.id);
    };

    public func compareByTimestamp(a : Transaction, b : Transaction) : Order.Order {
      Int.compare(a.timestamp, b.timestamp);
    };
  };

  type Product = {
    name : Text;
  };

  type InventoryEntry = {
    product : Product;
    quantityInStock : Float;
  };

  type ProductSale = {
    id : Int;
    farmerID : ?FarmerID;
    productName : Text;
    quantity : Float;
    pricePerUnit : Float;
    totalAmount : Float;
    timestamp : Time.Time;
  };

  module ProductSale {
    public func compare(a : ProductSale, b : ProductSale) : Order.Order {
      Text.compare(a.productName, b.productName);
    };

    public func compareByTimestamp(a : ProductSale, b : ProductSale) : Order.Order {
      Int.compare(a.timestamp, b.timestamp);
    };
  };

  let farmers = Map.empty<FarmerID, Farmer>();
  var nextFarmerID = 1;
  var vlcRate : Float = 0;
  var thekadariRate : Float = 0;

  let collections = Map.empty<FarmerID, [CollectionEntry]>();
  let transactions = Map.empty<FarmerID, [Transaction]>();
  let inventory = Map.empty<Text, InventoryEntry>();
  let sales = Map.empty<Int, ProductSale>();

  let pageSize : Nat = 50;

  public shared ({ caller }) func addFarmer(name : Text, phone : Text, milkType : MilkType) : async FarmerID {
    let id = nextFarmerID;
    let farmer : Farmer = {
      customerID = id;
      name;
      phone;
      milkType;
    };
    farmers.add(id, farmer);
    nextFarmerID += 1;
    id;
  };

  public shared ({ caller }) func updateRates(vRate : Float, tRate : Float) : async () {
    vlcRate := vRate;
    thekadariRate := tRate;
  };

  public query ({ caller }) func getFarmer(id : FarmerID) : async Farmer {
    switch (farmers.get(id)) {
      case (null) { Runtime.trap("Farmer does not exist") };
      case (?farmer) { farmer };
    };
  };

  public query ({ caller }) func getRates() : async { vlc : Float; thekadari : Float } {
    { vlc = vlcRate; thekadari = thekadariRate };
  };

  public query ({ caller }) func getAllFarmers() : async [Farmer] {
    let iter = farmers.values();
    iter.toArray().sort();
  };

  public shared ({ caller }) func updateFarmerDetails(
    id : FarmerID,
    name : Text,
    phone : Text,
    milkType : MilkType,
    customerID : FarmerID,
  ) : async () {
    switch (farmers.get(id)) {
      case (null) { Runtime.trap("Farmer does not exist") };
      case (?_) {
        let updatedFarmer : Farmer = {
          customerID;
          name;
          phone;
          milkType;
        };
        farmers.add(id, updatedFarmer);
      };
    };
  };

  public shared ({ caller }) func addCollectionEntry(
    farmerID : FarmerID,
    weight : Float,
    fat : Float,
    snf : ?Float,
    rate : Float,
    session : Session,
  ) : async () {
    let entry : CollectionEntry = {
      id = nextFarmerID;
      date = Time.now();
      session;
      farmerID;
      weight;
      fat;
      snf;
      rate;
      milkType = switch (farmers.get(farmerID)) {
        case (null) { Runtime.trap("Farmer does not exist") };
        case (?farmer) { farmer.milkType };
      };
    };

    let updatedEntries = switch (collections.get(farmerID)) {
      case (null) { [entry] };
      case (?existing) { existing.concat([entry]) };
    };
    collections.add(farmerID, updatedEntries);
    nextFarmerID += 1;
  };

  public shared ({ caller }) func updateCollectionEntry(
    farmerID : FarmerID,
    entryID : Int,
    weight : Float,
    fat : Float,
    snf : ?Float,
    rate : Float,
    session : Session,
    milkType : MilkType,
  ) : async () {
    switch (collections.get(farmerID)) {
      case (null) { Runtime.trap("No entries found for this farmer") };
      case (?entries) {
        let updatedEntries = entries.map(
          func(e) { if (e.id == entryID) { { e with weight; fat; snf; rate; session; milkType } } else { e } }
        );
        collections.add(farmerID, updatedEntries);
      };
    };
  };

  public shared ({ caller }) func addTransaction(farmerID : FarmerID, description : Text, amount : Float) : async Int {
    let transactionID = nextFarmerID;
    let transaction : Transaction = {
      id = transactionID;
      timestamp = Time.now();
      farmerID;
      description;
      amount;
    };

    let updatedTransactions = switch (transactions.get(farmerID)) {
      case (null) { [transaction] };
      case (?existing) { existing.concat([transaction]) };
    };
    transactions.add(farmerID, updatedTransactions);
    nextFarmerID += 1;
    transactionID;
  };

  public shared ({ caller }) func updateTransaction(
    farmerID : FarmerID,
    transactionID : Int,
    description : Text,
    amount : Float,
  ) : async () {
    switch (transactions.get(farmerID)) {
      case (null) { Runtime.trap("No transactions found for this farmer") };
      case (?txns) {
        let updatedTxns = txns.map(
          func(t) {
            if (t.id == transactionID) {
              {
                t with
                description;
                amount;
              };
            } else { t };
          }
        );
        transactions.add(farmerID, updatedTxns);
      };
    };
  };

  public shared ({ caller }) func addInventoryEntry(productName : Text, quantity : Float) : async () {
    let product : Product = { name = productName };
    let entry : InventoryEntry = {
      product;
      quantityInStock = quantity;
    };
    inventory.add(productName, entry);
  };

  public shared ({ caller }) func updateInventory(productName : Text, quantity : Float) : async () {
    switch (inventory.get(productName)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?entry) {
        let updatedEntry : InventoryEntry = {
          product = entry.product;
          quantityInStock = entry.quantityInStock + quantity;
        };
        inventory.add(productName, updatedEntry);
      };
    };
  };

  public shared ({ caller }) func addProductSale(
    farmerID : ?FarmerID,
    productName : Text,
    quantity : Float,
    pricePerUnit : Float,
  ) : async Int {
    let saleID = nextFarmerID;
    let sale : ProductSale = {
      id = saleID;
      farmerID;
      productName;
      quantity;
      pricePerUnit;
      totalAmount = quantity * pricePerUnit;
      timestamp = Time.now();
    };
    sales.add(saleID, sale);
    nextFarmerID += 1;

    switch (inventory.get(productName)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?entry) {
        let updatedEntry : InventoryEntry = {
          product = entry.product;
          quantityInStock = entry.quantityInStock - quantity;
        };
        inventory.add(productName, updatedEntry);
      };
    };

    switch (farmerID) {
      case (null) { () };
      case (?id) { ignore addTransaction(id, "Product sale: " # productName, -(sale.totalAmount : Float)) };
    };

    saleID;
  };

  public shared ({ caller }) func updateProductSale(
    saleID : Int,
    farmerID : ?FarmerID,
    productName : Text,
    quantity : Float,
    pricePerUnit : Float,
  ) : async () {
    switch (sales.get(saleID)) {
      case (null) { Runtime.trap("Sale does not exist") };
      case (?_) {
        let updatedSale : ProductSale = {
          id = saleID;
          farmerID;
          productName;
          quantity;
          pricePerUnit;
          totalAmount = quantity * pricePerUnit;
          timestamp = Time.now();
        };
        sales.add(saleID, updatedSale);

        switch (inventory.get(productName)) {
          case (null) { Runtime.trap("Product does not exist") };
          case (?entry) {
            let updatedEntry : InventoryEntry = {
              product = entry.product;
              quantityInStock = entry.quantityInStock - quantity;
            };
            inventory.add(productName, updatedEntry);
          };
        };

        switch (farmerID) {
          case (null) { () };
          case (?id) { ignore addTransaction(id, "Product sale: " # productName, -(updatedSale.totalAmount : Float)) };
        };
      };
    };
  };

  public query ({ caller }) func getFarmerBalance(farmerID : FarmerID) : async Float {
    var balance : Float = 0;
    switch (transactions.get(farmerID)) {
      case (null) {};
      case (?txns) {
        for (txn in txns.values()) {
          balance += txn.amount;
        };
      };
    };
    balance;
  };

  public query ({ caller }) func getFarmerTransactions(farmerID : FarmerID, page : Nat) : async [Transaction] {
    switch (transactions.get(farmerID)) {
      case (null) { [] };
      case (?txns) {
        let sortedTxns = txns.sort(Transaction.compareByTimestamp);
        let start = page * pageSize;
        if (start >= sortedTxns.size()) {
          return [];
        };
        let end = Nat.min(start + pageSize, sortedTxns.size());
        sortedTxns.sliceToArray(start, end);
      };
    };
  };

  public query ({ caller }) func getAllInventory() : async [InventoryEntry] {
    let iter = inventory.values();
    iter.toArray();
  };

  public query ({ caller }) func getAllCollectionsForSession(session : Session, page : Nat) : async [CollectionEntry] {
    var allEntries : [CollectionEntry] = [];
    for ((_, entries) in collections.entries()) {
      allEntries := allEntries.concat(entries.filter(func(entry) { entry.session == session }));
    };

    let start = page * pageSize;
    if (start >= allEntries.size()) {
      return [];
    };
    let end = Nat.min(start + pageSize, allEntries.size());
    allEntries.sliceToArray(start, end);
  };

  public query ({ caller }) func getAllProductSales() : async [ProductSale] {
    let iter = sales.values();
    iter.toArray().sort(ProductSale.compareByTimestamp);
  };

  public query ({ caller }) func getPaginatedCollections(farmerID : FarmerID, page : Nat) : async [CollectionEntry] {
    switch (collections.get(farmerID)) {
      case (null) { [] };
      case (?entries) {
        let start = page * pageSize;
        if (start >= entries.size()) {
          return [];
        };
        let end = Nat.min(start + pageSize, entries.size());
        entries.sliceToArray(start, end);
      };
    };
  };
};
