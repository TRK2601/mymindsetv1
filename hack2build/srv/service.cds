using com.mindset as myData from '../db/schema';
//@(restrict: 'authenticated-user')

@path: '/api/v1/hack2build'
service MyService {
    entity AssetCalibrationMasterSrv as  projection on myData.AssetCalibrationMaster;
    entity LabAssessmentInfoSrv as projection on myData.LabAssessmentInformation;
    entity CalibrationHistorySrv as projection on myData.CalibrationHistory;
    entity UniversityUserInformationSrv as projection on myData.UniversityUserInformation;
    entity AttachmentSev as projection on myData.Attachments;
    // calling materialtyp entityset from the AssetWise CAP application.
    //calling unbounded function.
    function AssetInformation() returns array of String;
    
}
