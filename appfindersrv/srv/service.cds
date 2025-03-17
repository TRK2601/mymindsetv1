using {com.mindset.accelerator.merlincapmsrv as schema} from '../db/data-model';
// @(requires: 'authenticated-user')
@path: '/api/v2/srv/ZMINDSET_S4APPFINDER_SRV'
service ZMINDSET_S4_APP_FINDER_SRV {
  entity VariantSet as projection on schema.Variant;
  entity UserSet as projection on schema.User;
  entity CatalogSet as projection on schema.Catalog;
  entity GroupSet as projection on schema.Group;
  entity RoleSet as projection on schema.Role;
  entity Roles_CatalogsSet as projection on schema.Roles_Catalogs;
  entity AppMapSet as projection on schema.AppMap;
  entity FeedbackSet as projection on schema.Feedback;
  entity SystemConnectionInfo as projection on schema.SystemConnectionInfo;
    function myfuntion() returns String;

  // TBD Test case for public interface
  entity ShareInfoSet as projection on schema.ShareInfo;
  // entity STO3NReportSet as projection on schema.STO3N_Repost;
   function onValidatePassKey(passKey: String) returns array of String;
   function onGetDataByID(ID: String) returns array of String;
   // Test case function
   function onTestCase() returns array of String;
}

/**
 * This service is use only for external Anonymous application (public access user app)
 */
@path: '/api/v2/srv/ZMINDSET_S4APPFINDER_EXT_ANONYMOUS_SRV'
service ZMINDSET_S4_APP_FINDER_ANONYMOUS_SRV  {
  function onValidatePassKey(passKey: String) returns array of String;
  function onGetDataByID(ID: String) returns array of String;

  // Test case function
   function onTestCase() returns array of String;
}





