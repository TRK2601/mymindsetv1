using { com.mindset.assetwise as schema } from '../db/data-model';

annotate assetwise.AssetMaster with @odata.draft.enabled : true;
annotate assetwise.AssetMaster with @fiori.draft.enabled : true;

service assetwise @(path: '/odata/v4/assetwise') {
    entity AssetMaster as projection on schema.AssetMaster;
    entity Employee as projection on schema.Employee;
    entity MaterialType as projection on schema.MaterialType;
    entity Attachments as projection on schema.Attachments;
    entity Currency as projection on schema.Currency;
    entity MaterialTypeCurrency as projection on schema.MaterialTypeCurrency;
    entity BaseLocation as projection on schema.BaseLocationVH;
    entity MaterialTypeBaseLocation as projection on schema.MaterialTypeBaseLocation;
    entity Groups as projection on schema.GroupVH;
    entity MaterialTypeGroup as projection on schema.MaterialTypeGroup;
    entity FunctionalLocation as projection on schema.FunctionalLocationVH;
    entity MaterialTypeFunctionalLocation as projection on schema.MaterialTypeFunctionalLocation;
    entity SubGroup as projection on schema.SubGroupVH;
    entity MaterialTypeSubGroup as projection on schema.MaterialTypeSubGroup;
    entity formatType  as projection on schema.formatType;
    entity AssetHistory as projection on schema.AssetHistory;
    entity APRequests as projection on schema.APRequest;
    entity APRequestLineItems as projection on schema.APRequestLineItem;
    entity TransactionalAttachments as projection on schema.TransactionalAttachments;
    entity Comments as projection on schema.Comments;
    entity RequestTypes as projection on schema.RequestTypes;
    // entity Statuses as projection on schema.Statuses;
    entity Actions as projection on schema.Actions;
    entity ActionsbyAssignee as projection on schema.ActionsbyAssignee;
    entity Teams as projection on schema.Teams;
    entity AssetStatus as projection on schema.AssetStatus;
    function ReadAPRequests(emailID: String) returns array of String;
    function userInfo() returns String; // using req.user approach (user attribute - of class cds.User - from the request object)
    action postMultipleData (records:array of AssetMaster) returns String;
}