import Map "mo:core/Map";
import Int "mo:core/Int";
import Text "mo:core/Text";

module {
  type FarmerID = Int;

  type MilkType = {
    #vlc;
    #thekadari;
  };

  type OldFarmer = {
    customerID : FarmerID;
    name : Text;
    phone : Text;
    milkType : MilkType;
    rate : Float;
  };

  type NewFarmer = {
    customerID : FarmerID;
    name : Text;
    phone : Text;
    milkType : MilkType;
  };

  type OldActor = {
    farmers : Map.Map<FarmerID, OldFarmer>;
    var nextFarmerID : Nat;
    collections : Map.Map<FarmerID, [CollectionEntry]>;
    transactions : Map.Map<FarmerID, [Transaction]>;
    inventory : Map.Map<Text, InventoryEntry>;
    sales : Map.Map<Int, ProductSale>;
  };

  type Session = {
    #morning;
    #evening;
  };

  type Product = { name : Text };

  type CollectionEntry = {
    date : Int;
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
    timestamp : Int;
    farmerID : FarmerID;
    description : Text;
    amount : Float;
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
    timestamp : Int;
  };

  type NewActor = {
    farmers : Map.Map<FarmerID, NewFarmer>;
    var nextFarmerID : Nat;
    collections : Map.Map<FarmerID, [CollectionEntry]>;
    transactions : Map.Map<FarmerID, [Transaction]>;
    inventory : Map.Map<Text, InventoryEntry>;
    sales : Map.Map<Int, ProductSale>;
    var vlcRate : Float;
    var thekadariRate : Float;
  };

  public func run(old : OldActor) : NewActor {
    let newFarmers = old.farmers.map<FarmerID, OldFarmer, NewFarmer>(
      func(_id, oldFarmer) {
        {
          customerID = oldFarmer.customerID;
          name = oldFarmer.name;
          phone = oldFarmer.phone;
          milkType = oldFarmer.milkType;
        };
      }
    );
    {
      farmers = newFarmers;
      var nextFarmerID = old.nextFarmerID;
      collections = old.collections;
      transactions = old.transactions;
      inventory = old.inventory;
      sales = old.sales;
      var vlcRate = 0.0;
      var thekadariRate = 0.0;
    };
  };
};
