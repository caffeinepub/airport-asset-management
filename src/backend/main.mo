import Map "mo:core/Map";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Order "mo:core/Order";
import List "mo:core/List";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  module Asset {
    public type Category = {
      #furniture;
      #itEquipment;
      #vehicles;
      #machinery;
      #officeSupplies;
      #other;
    };

    public type Status = {
      #active;
      #underMaintenance;
      #retired;
      #inStorage;
    };

    public type Specification = {
      name : Text;
      category : Category;
      serialNumber : Text;
      purchaseDate : Time.Time;
      cost : Float;
      supplier : Text;
      status : Status;
      location : Text;
      assignedTo : ?Text;
      notes : Text;
    };

    public type Data = {
      id : Nat;
      name : Text;
      category : Category;
      serialNumber : Text;
      purchaseDate : Time.Time;
      cost : Float;
      supplier : Text;
      status : Status;
      location : Text;
      assignedTo : ?Text;
      notes : Text;
    };

    public func compare(a : Data, b : Data) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module Assignment {
    public type Data = {
      id : Nat;
      assetId : Nat;
      assignedTo : Text;
      assignedBy : Text;
      assignedAt : Int;
      returnedAt : ?Int;
    };

    public func compare(a : Data, b : Data) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module MaintenanceLog {
    public type Data = {
      id : Nat;
      assetId : Nat;
      maintenanceType : Text;
      description : Text;
      performedBy : Text;
      performedAt : Int;
      nextDueDateText : ?Text;
      cost : Float;
    };

    public func compare(a : Data, b : Data) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module InspectionLog {
    public type Outcome = {
      #pass;
      #fail;
    };

    public type Data = {
      id : Nat;
      assetId : Nat;
      inspectorName : Text;
      inspectedAt : Int;
      outcome : InspectionLog.Outcome;
      notes : Text;
    };

    public func compare(a : Data, b : Data) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module AssetStats {
    public type Data = {
      total : Nat;
      underMaintenance : Nat;
      assigned : Nat;
      recentlyAdded : Nat;
    };

    public func compare(a : Data, b : Data) : Order.Order {
      Nat.compare(a.total, b.total);
    };
  };

  public type AssetId = Nat;

  let assets = Map.empty<AssetId, Asset.Data>();
  let assignments = Map.empty<Nat, Assignment.Data>();
  let maintenanceLogs = Map.empty<Nat, MaintenanceLog.Data>();
  let inspectionLogs = Map.empty<Nat, InspectionLog.Data>();

  var nextAssetId = 1;
  var nextAssignmentId = 1;
  var nextMaintenanceLogId = 1;
  var nextInspectionLogId = 1;

  public type InternalRole = {
    #systemAdmin;
    #financeManager;
    #airportManager;
    #procurementOfficer;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    role : InternalRole;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Helper function to check if caller has write permissions
  // SystemAdmin (#admin) and FinanceManager (#user) can write
  func canWrite(caller : Principal) : Bool {
    let role = AccessControl.getUserRole(accessControlState, caller);
    switch (role) {
      case (#admin) { true };  // SystemAdmin
      case (#user) { true };   // FinanceManager
      case (#guest) { false }; // AirportManager or ProcurementOfficer (read-only)
    };
  };

  // Helper function to check if caller is authenticated (not anonymous)
  func isAuthenticated(caller : Principal) : Bool {
    AccessControl.hasPermission(accessControlState, caller, #user) or
    AccessControl.isAdmin(accessControlState, caller);
  };

  // Asset CRUD Operations
  public shared ({ caller }) func createAsset(asset : Asset.Specification) : async AssetId {
    if (not canWrite(caller)) {
      Runtime.trap("Unauthorized: Only SystemAdmin and FinanceManager can create assets");
    };

    let assetData : Asset.Data = {
      id = nextAssetId;
      name = asset.name;
      category = asset.category;
      serialNumber = asset.serialNumber;
      purchaseDate = asset.purchaseDate;
      cost = asset.cost;
      supplier = asset.supplier;
      status = asset.status;
      location = asset.location;
      assignedTo = asset.assignedTo;
      notes = asset.notes;
    };

    assets.add(nextAssetId, assetData);
    let id = nextAssetId;
    nextAssetId += 1;
    id;
  };

  public query ({ caller }) func getAsset(assetId : AssetId) : async ?Asset.Data {
    // All authenticated users can read
    assets.get(assetId);
  };

  public shared ({ caller }) func updateAsset(assetId : AssetId, updatedAsset : Asset.Specification) : async Bool {
    if (not canWrite(caller)) {
      Runtime.trap("Unauthorized: Only SystemAdmin and FinanceManager can update assets");
    };

    switch (assets.get(assetId)) {
      case (null) { false };
      case (?_) {
        let assetData : Asset.Data = {
          id = assetId;
          name = updatedAsset.name;
          category = updatedAsset.category;
          serialNumber = updatedAsset.serialNumber;
          purchaseDate = updatedAsset.purchaseDate;
          cost = updatedAsset.cost;
          supplier = updatedAsset.supplier;
          status = updatedAsset.status;
          location = updatedAsset.location;
          assignedTo = updatedAsset.assignedTo;
          notes = updatedAsset.notes;
        };
        assets.add(assetId, assetData);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteAsset(assetId : AssetId) : async Bool {
    if (not canWrite(caller)) {
      Runtime.trap("Unauthorized: Only SystemAdmin and FinanceManager can delete assets");
    };

    switch (assets.get(assetId)) {
      case (null) { false };
      case (?_) {
        assets.remove(assetId);
        true;
      };
    };
  };

  public query ({ caller }) func listAssets(filterStatus : ?Asset.Status, filterCategory : ?Asset.Category) : async [Asset.Data] {
    // All authenticated users can read
    assets.values().toArray().filter(
      func(asset) {
        let statusMatches = switch (filterStatus) {
          case (null) { true };
          case (?status) { asset.status == status };
        };
        let categoryMatches = switch (filterCategory) {
          case (null) { true };
          case (?category) { asset.category == category };
        };
        statusMatches and categoryMatches;
      }
    );
  };

  public query ({ caller }) func getAssetStats() : async AssetStats.Data {
    // All authenticated users can read
    var total = 0;
    var underMaintenance = 0;
    var assigned = 0;
    var recentlyAdded = 0;

    let now = Int.abs(Time.now());
    let oneWeekMicros : Int = 7 * 24 * 60 * 60 * 1_000_000;

    assets.values().forEach(
      func(asset) {
        total += 1;
        switch (asset.status) {
          case (#underMaintenance) { underMaintenance += 1 };
          case (#active) {
            switch (asset.assignedTo) {
              case (?_) { assigned += 1 };
              case (null) {};
            };
          };
          case (_) {};
        };
        if (now - Int.abs(asset.purchaseDate) < oneWeekMicros) {
          recentlyAdded += 1;
        };
      }
    );

    {
      total;
      underMaintenance;
      assigned;
      recentlyAdded;
    };
  };

  // Assignment Operations
  public shared ({ caller }) func assignAsset(assetId : AssetId, assignedTo : Text, assignedBy : Text) : async Bool {
    if (not canWrite(caller)) {
      Runtime.trap("Unauthorized: Only SystemAdmin and FinanceManager can assign assets");
    };

    switch (assets.get(assetId)) {
      case (null) { false };
      case (?_) {
        let assignment : Assignment.Data = {
          id = nextAssignmentId;
          assetId;
          assignedTo;
          assignedBy;
          assignedAt = Time.now();
          returnedAt = null;
        };
        assignments.add(nextAssignmentId, assignment);
        nextAssignmentId += 1;
        true;
      };
    };
  };

  public shared ({ caller }) func returnAsset(assignmentId : Nat) : async Bool {
    if (not canWrite(caller)) {
      Runtime.trap("Unauthorized: Only SystemAdmin and FinanceManager can return assets");
    };

    switch (assignments.get(assignmentId)) {
      case (null) { false };
      case (?assignment) {
        let updatedAssignment : Assignment.Data = {
          id = assignment.id;
          assetId = assignment.assetId;
          assignedTo = assignment.assignedTo;
          assignedBy = assignment.assignedBy;
          assignedAt = assignment.assignedAt;
          returnedAt = ?Time.now();
        };
        assignments.add(assignmentId, updatedAssignment);
        true;
      };
    };
  };

  public query ({ caller }) func getAssignmentHistory(assetId : AssetId) : async [Assignment.Data] {
    // All authenticated users can read
    assignments.values().toArray().filter(func(assignment) { assignment.assetId == assetId });
  };

  // Maintenance Operations
  public shared ({ caller }) func addMaintenanceLog(assetId : AssetId, maintenanceType : Text, description : Text, performedBy : Text, nextDueDateText : ?Text, cost : Float) : async Bool {
    if (not canWrite(caller)) {
      Runtime.trap("Unauthorized: Only SystemAdmin and FinanceManager can add maintenance logs");
    };

    let log : MaintenanceLog.Data = {
      id = nextMaintenanceLogId;
      assetId;
      maintenanceType;
      description;
      performedBy;
      performedAt = Time.now();
      nextDueDateText;
      cost;
    };

    maintenanceLogs.add(nextMaintenanceLogId, log);
    nextMaintenanceLogId += 1;
    true;
  };

  public query ({ caller }) func getMaintenanceLogs(assetId : AssetId) : async [MaintenanceLog.Data] {
    // All authenticated users can read
    maintenanceLogs.values().toArray().filter(func(log) { log.assetId == assetId });
  };

  // Inspection Operations
  public shared ({ caller }) func addInspectionLog(assetId : AssetId, inspectorName : Text, outcome : InspectionLog.Outcome, notes : Text) : async Bool {
    if (not canWrite(caller)) {
      Runtime.trap("Unauthorized: Only SystemAdmin and FinanceManager can add inspection logs");
    };

    let log : InspectionLog.Data = {
      id = nextInspectionLogId;
      assetId;
      inspectorName;
      inspectedAt = Time.now();
      outcome;
      notes;
    };

    inspectionLogs.add(nextInspectionLogId, log);
    nextInspectionLogId += 1;
    true;
  };

  public query ({ caller }) func getInspectionLogs(assetId : AssetId) : async [InspectionLog.Data] {
    // All authenticated users can read
    inspectionLogs.values().toArray().filter(func(log) { log.assetId == assetId });
  };

  // Role Management
  public shared ({ caller }) func manageUserRoles(userId : Principal, role : InternalRole) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only SystemAdmin can manage user roles");
    };

    // Map internal roles to AccessControl roles
    // SystemAdmin -> #admin
    // FinanceManager -> #user
    // AirportManager, ProcurementOfficer -> #guest (read-only)
    switch (role) {
      case (#systemAdmin) {
        AccessControl.assignRole(accessControlState, caller, userId, #admin);
      };
      case (#financeManager) {
        AccessControl.assignRole(accessControlState, caller, userId, #user);
      };
      case (#airportManager or #procurementOfficer) {
        AccessControl.assignRole(accessControlState, caller, userId, #guest);
      };
    };
    true;
  };
};
