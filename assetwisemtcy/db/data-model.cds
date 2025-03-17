namespace com.mindset.assetwise;

using {
  managed,
  cuid,
  sap.common.CodeList
} from '@sap/cds/common';

  @assert.unique : {barcodeNo : [barcodeNo] }
entity AssetMaster : managed, cuid {
  key ID                    : UUID                                 @Core.Computed;
      matType               : String                               @title: 'Material Type';
      name                  : String                               @title: 'Name';
      desc1                 : String                               @title: 'Description 1';
      desc2                 : String                               @title: 'Description 2';
      desc3                 : String                               @title: 'Description 3';
      group                 : String                               @title: 'Group';
      subGroup              : String                               @title: 'Sub Group';
      barcodeNo             : String                               @title: 'Barcode No';
      serialNo              : String                               @title: 'Serial No';
      components            : String                               @title: 'Components';
      serviceIntervals      : String                               @title: 'Service Intervals';
      serviceIntervalPeriod : Association to formatType            @title: 'Service Interval Period';
      termLife              : String                               @title: 'Term Life';
      termLifePeriod        : Association to formatType            @title: 'Term Life Period';
      status                : String                               @title: 'Status';
      poNumber              : String                               @title: 'PO Number';
      procuredDate          : Date                                 @title: 'Procurement Date';
      procuredCost          : Double                               @title: 'Procurement Cost';
      procuredCostCur       : String                               @title: 'Procurement Cost Currency';
      assetNetValue         : Double                               @title: 'Net Value';
      assetCurType          : String                               @title: 'Net Value Currency';
      @Core.Computed: false
      insured               : Boolean default false                @title: 'Insured';
      manufacturedBy        : String                               @title: 'Manufactured By';
      insurancePartner      : String                               @title: 'Insurance Partner';
      insurancePolicyNo     : String                               @title: 'Insurance Policy Number';
      @Core.Computed: false
      claimsInCurrentYear   : Boolean default false                @title: 'Claims in Current Year';
      claimDetails          : String                               @title: 'Claim details';
      previousRenewalDate   : Date                                 @title: 'Previous Renewal Date';
      previousRenewalPremium : Decimal(10, 2)                      @title: 'Previous Renewal Premium';
      nextRenewalDate      : Date                                  @title: 'Next Renewal Date';
      assetVendor           : String                               @title: 'Vendor';
      ownedTeam             : String                               @title: 'Owned Team';
      Owner                 : String                               @title: 'Owner';
      userTeam              : String                               @title: 'User Team';
      user                  : String                               @title: 'User';
      baseLocation          : String                               @title: 'Base Location';
      funcLocation          : String                               @title: 'Functional Location';
      handedOverDate        : Date                                 @title: 'Handed Over Date';
      returnDate            : Date                                 @title: 'Return Date';
      lost                  : Boolean default false                @title: 'Lost';
      breakdown             : Boolean default false                @title: 'Breakdown';
      servProvider1         : String                               @title: 'Service Provider 1';
      servProvider2         : String                               @title: 'Service Provider 2';
      servProvider3         : String                               @title: 'Service Provider 3';
      latestServiceDate     : Date                                 @title: 'Latest Service Date';
      serviceCost           : Double                               @title: 'Service Cost';
      serviceCostCur        : String                               @title: 'Service Cost Currency';
      latestServiceVendor   : String                               @title: 'Latest Service Vendor';
      assetScrappedDate     : Date                                 @title: 'Scrapped Date';
      assetScrappedValue    : String                               @title: 'Scrapped Value';
      assetScrappedValueCur : String                               @title: 'Scrapped Value Currency';
      assetScrappedOwner    : String                               @title: 'Scrapped Owner';
      openTextBox1          : String                               @title: 'Additional Text';
      openTextBox2          : String                               @title: 'Additional Text';
      openTextBox3          : String                               @title: 'Additional Text';
      openTextBox4          : String                               @title: 'Additional Text';
      openTextBox5          : String                               @title: 'Additional Text';
      attachments           : Association to many Attachments
                                on $self.ID = attachments.asset_ID;
      versions              : Association to many AssetHistory
                                on $self.ID = versions.ID;
      profilePicContent     : LargeBinary                 @Core.MediaType: 'image/png';
      ImageUrl              : String;
      profilePicUpdated     : Boolean default false;
}
entity Employee : managed, cuid {
    key ID                      : UUID    @Core.Computed;
        assets                  : Association to many AssetMaster
                                      on $self.name = assets.user;
        name                    : String  @title: 'Name';
        code                    : String   @title: 'Code';
        email                   : String @title: 'Email ID';
        team                    : String @title: 'Team';
        managerName             : String  @title: 'Reporting Manager';
        managerCode             : String   @title: 'Reporting Manager Employee Code';
        managerEmail            : String  @title: 'Reporting Mangager Email';
        isOwner                 : Boolean @title: 'Owner';
        isManager               : Boolean @title: 'Manager';
        isUser                  : Boolean @title: 'User';
        hasCreatable            : Boolean @title: 'Has Creatable';
        hasUpdatble             : Boolean @title: 'Has Editable';
}

entity Teams: managed {
    key name                    : String(6);
        description             : String;
}
entity MaterialType : managed {
    key name           : String @title: 'Name';
        //desc           : String @title: 'Description';
        assignedAssets     : Association to many AssetMaster
                                 on $self.name = assignedAssets.matType;
        assignedCurrencies : Composition of many MaterialTypeCurrency
                                 on assignedCurrencies.materialType.name = $self.name;
        assignedBaseLocations : Composition of many MaterialTypeBaseLocation
                                 on $self.name = assignedBaseLocations.materialType.name;
        assignedGroups : Composition of many MaterialTypeGroup
                                 on $self.name = assignedGroups.materialType.name;
        assignedFunctionalLocations : Composition of many MaterialTypeFunctionalLocation
                                 on $self.name = assignedFunctionalLocations.materialType.name;
        assignedSubGroups : Composition of many MaterialTypeSubGroup
                                 on $self.name = assignedSubGroups.materialType.name;
}

entity Attachments : managed, cuid {
    key ID        : UUID         @Core.Computed;
        asset_ID  : String;
        content   : LargeBinary  @Core.MediaType: mediaType  @Core.ContentDisposition.Filename: fileName  @Core.ContentDisposition.Type: 'inline';
        mediaType : String       @Core.IsMediaType;
        fileName  : String;
        url       : String;
}
entity AssetStatus : managed {
    key name : String;
    description    : String;
}
entity Currency : CodeList {
  key code      : String(3); //> ISO 4217 alpha-3 codes
      symbol    : String(5); //> for example, $, €, £, ₪, ...//> for example, 0 or 2
      assignedMaterialTypes : Association to many MaterialTypeCurrency
                                    on $self = assignedMaterialTypes.currency;
}
entity formatType : CodeList {
    key code : String enum {
            Days  = 'DD';
            Weeks = 'WK';
            Month = 'MM';
            Years = 'YY';
        };
}
entity MaterialTypeCurrency {
    key currency_code: String(3);
    key materialType : Association to many MaterialType;
    currency     : Association to many Currency on $self.currency_code = currency.code;
}
entity BaseLocationVH {
    key code             : String;
        assignedMaterialTypes       : Association to many MaterialTypeBaseLocation
                                          on $self = assignedMaterialTypes.baseLocation;
        assignedFunctionalLocations : Association to many FunctionalLocationVH
                                          on $self.code = assignedFunctionalLocations.baseLocationCode;
}
entity MaterialTypeBaseLocation {
    key materialType : Association to many MaterialType;
    key baseLocation : Association to many BaseLocationVH;
}
entity GroupVH {
    key name       : String;
        assignedMaterialTypes : Association to many MaterialTypeGroup
                                    on $self = assignedMaterialTypes.group;
        assignedSubGroups     : Association to many SubGroupVH
                                    on $self.name = assignedSubGroups.group_name;
}
entity MaterialTypeGroup {
    key materialType : Association to many MaterialType;
    key group        : Association to many GroupVH;
}
entity FunctionalLocationVH {
    key ID           : UUID @Core.Computed;
    key code : String;
    baseLocationCode: String;
    assignedMaterialTypes       : Association to many MaterialTypeFunctionalLocation
                                          on $self = assignedMaterialTypes.functionalLocation;
}
entity MaterialTypeFunctionalLocation {
    key materialType : Association to many MaterialType;
    key functionalLocation        : Association to many FunctionalLocationVH;
    baseLocation: Association to many BaseLocationVH; 
}
entity SubGroupVH {
        key ID           : UUID @Core.Computed;
        key name : String;
        group_name: String;
        assignedMaterialTypes       : Association to many MaterialTypeSubGroup
                                          on $self = assignedMaterialTypes.subGroup;
}
entity MaterialTypeSubGroup {
    key materialType : Association to many MaterialType;
    key subGroup        : Association to many SubGroupVH;
    group : Association to many GroupVH;
}
entity AssetHistory : managed, cuid {
  key ID                    : String;
  key version               : Integer default 0;
      matType               : String                               @title: 'Material Type';
      name                  : String                               @title: 'Name';
      desc1                 : String                               @title: 'Description 1';
      desc2                 : String                               @title: 'Description 2';
      desc3                 : String                               @title: 'Description 3';
      group                 : String                               @title: 'Group';
      subGroup              : String                               @title: 'Sub Group';
      barcodeNo             : String                               @title: 'Barcode No';
      serialNo              : String                               @title: 'Serial No';
      components            : String                               @title: 'Components';
      serviceIntervals      : String                               @title: 'Service Intervals';
      serviceIntervalPeriod : Association to formatType            @title: 'Service Interval Period';
      termLife              : String                               @title: 'Term Life';
      termLifePeriod        : Association to formatType            @title: 'Term Life Period';
      status                : String                               @title: 'Status';
      poNumber              : String                               @title: 'PO Number';
      procuredDate          : Date                                 @title: 'Procurement Date';
      procuredCost          : Double                               @title: 'Procurement Cost';
      procuredCostCur       : String                                @title: 'Procurement Cost Currency';
      assetNetValue         : Double                               @title: 'Net Value';
      assetCurType          : String                                @title: 'Net Value Currency';
      manufacturedBy        : String                               @title: 'Manufactured By';
      insured               : Boolean                               @title: 'Insured';
      insurancePartner      : String                                @title: 'Insurance Partner';
      insurancePolicyNo     : String                                @title: 'Insurance Policy Number';
      claimsInCurrentYear   : Boolean                                @title: 'Claims in Current Year';
      claimDetails          : String                                @title: 'Claim details';
      previousRenewalDate   : Date                                @title: 'Previous Renewal Date';
      previousRenewalPremium : Decimal(10, 2)                       @title: 'Previous Renewal Premium';
      nextRenewalDate      : Date                                @title: 'Next Renewal Date';
      assetVendor           : String                               @title: 'Vendor';
      ownedTeam             : String                               @title: 'Owned Team';
      Owner                 : String                               @title: 'Owner';
      userTeam              : String                               @title: 'User Team';
      user                  : String                               @title: 'User';
      baseLocation          : String                               @title: 'Base Location';
      funcLocation          : String                               @title: 'Functional Location';
      handedOverDate        : Date                                 @title: 'Handed Over Date';
      returnDate            : Date                                 @title: 'Return Date';
      lost                  : Boolean                              @title: 'Lost';
      breakdown             : Boolean                              @title: 'Breakdown';
      servProvider1         : String                               @title: 'Service Provider 1';
      servProvider2         : String                               @title: 'Service Provider 2';
      servProvider3         : String                               @title: 'Service Provider 3';
      latestServiceDate     : Date                                 @title: 'Latest Service Date';
      serviceCost           : Double                               @title: 'Service Cost';
      serviceCostCur        : String                                @title: 'Service Cost Currency';
      latestServiceVendor   : String                               @title: 'Latest Service Vendor';
      assetScrappedDate     : Date                                 @title: 'Scrapped Date';
      assetScrappedValue    : String                               @title: 'Scrapped Value';
      assetScrappedValueCur : String                                @title: 'Scrapped Value Currency';
      assetScrappedOwner    : String                               @title: 'Scrapped Owner';
      openTextBox1          : String                               @title: 'Additional Text';
      openTextBox2          : String                               @title: 'Additional Text';
      openTextBox3          : String                               @title: 'Additional Text';
      openTextBox4          : String                               @title: 'Additional Text';
      openTextBox5          : String                               @title: 'Additional Text';
      attachments           : Association to many Attachments
                                on $self.ID = attachments.asset_ID;
      profilePicUpdated     : Boolean default false;
};



//Workflow entities
entity APRequest: managed {
    key ID                      : String;
        reqType                 : String(3);
        requesterID             : String    @title: 'Requestor ID';
        requesterName           : String;
        currentApproverID       : String;
        currentApproverName     : String;
        currentStatus           : String;
        managerID               : String;
        managerName             : String;
        assigneeID              : String;
        assigneeName            : String;
        assigneeTeam            : String;
        managerApprovalStatus   : String(4);
        assigneeAcceptStatus    : String(4);
        numOfLevels             : Integer default 2;
        handOverStatus          : String(3);
        overallStatus           : String(3);
        handOverDate            : DateTime;
        handOverLoc             : String;
        returnDate              : DateTime;
        returnLoc               : String;
        returnStatus            : String(3);
        transferDate            : DateTime;
        transferBaseLoc         : String;
        transferFuncLoc         : String;
        transferStatus          : String(3);
        serviceDate             : DateTime;
        serviceBaseLoc          : String;
        serviceFuncLoc          : String;
        seriviceStatus          : String(3);
        deleteflag              : Boolean default false;
        lineitems               : Composition of many APRequestLineItem on lineitems.request = $self;
        comments                : Composition of many Comments on comments.request = $self;
        attachments             : Composition of many TransactionalAttachments on attachments.request = $self;
}

entity TransactionalAttachments : managed, cuid {
    key ID        : UUID         @Core.Computed;
    key request   : Association to APRequest;
        content   : LargeBinary  @Core.MediaType: mediaType  @Core.ContentDisposition.Filename: fileName  @Core.ContentDisposition.Type: 'inline';
        mediaType : String       @Core.IsMediaType;
        fileName  : String;
        url       : String;
}

entity APRequestLineItem: managed, cuid {
    key ID                  : UUID;
    key request             : Association to APRequest;
        assetID             : String;
        assetName           : String;
        assetDesc1          : String;
        assetDesc2          : String;
        assetDesc3          : String;
        quantity            : String;
        baseLocation        : String;
        functionalLocation  : String;
        barcode             : String;
        serialNo            : String;
        expectedDate        : Date;
        comment             : String;
}

entity Comments: cuid, managed {
    key ID             : UUID;
    key request        : Association to APRequest;
        role           : String;
        name           : String;
        email          : String;
        action         : String(1);  
        comment        : String;
}

entity RequestTypes: managed {
    key code             : String(3);
        name             : String;
}

entity Statuses: managed {
    key code             : String(3);
        name             : String;
}

entity Actions: managed {
    key code             : String(4);
        name             : String;
}

entity ActionsbyAssignee: managed {
    key code             : String(4);
        name             : String;
}