import Map "mo:core/Map";
import Int "mo:core/Int";
import Time "mo:core/Time";

module {
  type Session = { #morning; #evening };
  type MilkType = { #vlc; #thekadari };

  type OldCollectionEntry = {
    date : Time.Time;
    session : Session;
    farmerID : Int;
    weight : Float;
    fat : Float;
    snf : ?Float;
    rate : Float;
    milkType : MilkType;
  };

  type OldActor = {
    collections : Map.Map<Int, [OldCollectionEntry]>;
  };

  type NewCollectionEntry = {
    id : Int;
    date : Time.Time;
    session : Session;
    farmerID : Int;
    weight : Float;
    fat : Float;
    snf : ?Float;
    rate : Float;
    milkType : MilkType;
  };

  type NewActor = {
    collections : Map.Map<Int, [NewCollectionEntry]>;
  };

  public func run(old : OldActor) : NewActor {
    let newCollections = old.collections.map<Int, [OldCollectionEntry], [NewCollectionEntry]>(
      func(farmerID, entries) {
        entries.map(
          func(oldEntry) { { oldEntry with id = 0 } }
        );
      }
    );
    { collections = newCollections };
  };
};
