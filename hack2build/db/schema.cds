namespace com.mindset;

using {
    managed,
    cuid
} from '@sap/cds/common';

entity AssetCalibrationMaster : managed, cuid {
    key assetCalibrationId                 : UUID        @title: 'Asset ID';
        matType                            : String      @title: 'Material Type';
        serialNumber                       : String(50)  @title: 'Serial Number';
        assetName                          : String(150) @title: 'Asset Name';
        manufacturer                       : String(200);
        barcode                            : String(50)  @title: 'Barcode';
        baseLocation                       : String(30)  @title: 'Base Location';
        functionalLocation                 : String(30)  @title: 'Functional Location';
        owner                              : String(50)  @title: 'Owner';
        user                               : String(50)  @title: 'User';
        assetModel                         : String;
        assetDescription                   : String;
        serviceTenure                      : String(30);
        calibrationTenure                  : String(30);
        latestCalibrationDate              : Date;
        latestCalibrationVendor            : String;
        latestCalibrationCertificateNumber : String;
        latestCalibrationCost              : Integer;
        futureCalibrationDate              : Date;
        uom                                : String;
        minFahrenheit                      : String;
        maxFahrenheit                      : String;
        inputValue                         : String;
        outputValue                        : String;
        conversionUnits                    : String;
        toleranceLimit                     : String;
        previousIssuesDetected             : String;
        calibrationHistory                 : Composition of many CalibrationHistory
                                                 on calibrationHistory.assetCalibrationId = $self;
        attachments                        : Association to many Attachments
                                                 on $self.assetCalibrationId = attachments.asset_ID;


}

entity CalibrationHistory {
    key Id                 : UUID;
        calibrationVendor  : String;
        calibrationDate    : Date;
        calibrationTenure  : String;
        calibrationCost    : Integer;
        certificateNumber  : String;
        assetCalibrationId : Association to AssetCalibrationMaster;
        issuesDetected     : String;
        attachments        : Association to many Attachments
                                 on $self.Id = attachments.asset_ID;

}

entity Attachments : managed, cuid {
    key ID            : UUID         @Core.Computed;
        asset_ID      : UUID; //Association to Asset Master Information
        content       : LargeBinary  @Core.MediaType: mediaType  @Core.ContentDisposition.Filename: fileName  @Core.ContentDisposition.Type: 'inline';
        mediaType     : String       @Core.IsMediaType;
        fileName      : String;
        url           : String;
        calibrationId : Association to CalibrationHistory;
}

entity LabAssessmentInformation {
    key ID                     : UUID;
        //General Information
        labdeptname            : String;
        labusername            : String;
        formFilledDate         : DateTime;
        role                   : String;
        universityid           : Association to UniversityUserInformation;
        //Equipment Information
        serialNumber           : String;
        assetName              : String;
        materialType           : String;
        equipmentDescription   : String(250);
        assetModel             : String;
        //Experiment Test Result
        inputParameters        : String;
        outputParameters       : String;
        labTestResults         : String;
        roomCondition          : String;
        testObservationByUser  : String;
        //Equipment Performance
        assetUsageFrequency    : String(50);
        observedDeviation      : String(250);
        changesInEnvironment   : String(250);
        regulatoryRequirements : String(250);
        additionalComments     : String(250);

}

entity UniversityUserInformation {
    key UserId        : String @Core.Computed;
        roletype      : String;
        userName      : String;
        labtestreview : Association to many LabAssessmentInformation
                            on $self.UserId = labtestreview.ID;

}

// __ This is for future reference, when having relation with Asset Master Information
/*entity AssetMaster : managed, cuid {
    key ID                    : UUID                        @Core.Computed;
        matType               : String                      @title         : 'Material Type';
        name                  : String                      @title         : 'Name';
        desc1                 : String                      @title         : 'Description 1';
        desc2                 : String                      @title         : 'Description 2';
        desc3                 : String                      @title         : 'Description 3';
        group                 : String                      @title         : 'Group';
        subGroup              : String                      @title         : 'Sub Group';
        barcodeNo             : String                      @title         : 'Barcode No';
        serialNo              : String                      @title         : 'Serial No';
        components            : String                      @title         : 'Components';
        serviceIntervals      : String                      @title         : 'Service Intervals';
        serviceIntervalPeriod : Association to formatType   @title         : 'Service Interval Period';
        termLife              : String                      @title         : 'Term Life';
        termLifePeriod        : Association to formatType   @title         : 'Term Life Period';
        poNumber              : String                      @title         : 'PO Number';
        procuredDate          : Date                        @title         : 'Procurement Date';
        procuredCost          : Double                      @title         : 'Procurement Cost';
        procuredCostCur       : Association to currencyType @title         : 'Procurement Cost Currency';
        assetNetValue         : Double                      @title         : 'Net Value';
        assetCurType          : Association to currencyType @title         : 'Net Value Currency';
        assetVendor           : String                      @title         : 'Vendor';
        ownedTeam             : String                      @title         : 'Owned Team';
        Owner                 : String                      @title         : 'Owner';
        userTeam              : String                      @title         : 'User Team';
        user                  : String                      @title         : 'User';
        baseLocation          : String                      @title         : 'Base Location';
        funcLocation          : String                      @title         : 'Functional Location';
        handedOverDate        : Date                        @title         : 'Handed Over Date';
        returnDate            : Date                        @title         : 'Return Date';
        breakdown             : Boolean                     @title         : 'Breakdown';
        servProvider1         : String                      @title         : 'Service Provider 1';
        servProvider2         : String                      @title         : 'Service Provider 2';
        servProvider3         : String                      @title         : 'Service Provider 3';
        latestServiceDate     : Date                        @title         : 'Latest Service Date';
        serviceCost           : Double                      @title         : 'Service Cost';
        serviceCostCur        : Association to currencyType @title         : 'Service Cost Currency';
        latestServiceVendor   : String                      @title         : 'Latest Service Vendor';
        assetScrappedDate     : Date                        @title         : 'Scrapped Date';
        assetScrappedValue    : String                      @title         : 'Scrapped Value';
        assetScrappedValueCur : Association to currencyType @title         : 'Scrapped Value Currency';
        assetScrappedOwner    : String                      @title         : 'Scrapped Owner';
        openTextBox1          : String                      @title         : 'Additional Text';
        openTextBox2          : String                      @title         : 'Additional Text';
        openTextBox3          : String                      @title         : 'Additional Text';
        openTextBox4          : String                      @title         : 'Additional Text';
        openTextBox5          : String                      @title         : 'Additional Text';
        attachments           : Association to many Attachments
                                    on $self.ID = attachments.asset_ID;
        versions              : Association to many AssetHistory
                                    on $self.ID = versions.ID;
        content               : LargeBinary                 @Core.MediaType: 'image/png';
        ImageUrl              : String;
        //student                          : Association to Student;
        //labtestreview                      : Association to many LabAssessmentInformation
                                                 //on labtestreview.serialNumber = $self.serialNumber;
} */
