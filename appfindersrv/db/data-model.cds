using { Currency, managed, cuid } from '@sap/cds/common';
namespace com.mindset.accelerator.merlincapmsrv;

entity User {
    key id              : UUID;
        email           : String;
        userName        : String;
        designation     : String;
        organization    : String;
        contactNo       : String;
        plannedusage    : String;
        comments        : String;
        variants        : Association to many Variant on variants.user = $self;
        catalog         : Association to many Catalog on catalog.user = $self;
        group           : Association to many Group on group.user = $self;
        role            : Association to many Role on role.user = $self;
        currentStep     : String;
        status          : String;
        activateApps    : array of {
                                    tCode : String;
                                    appID : String;
                                    zTcode: String;
                                };
}

entity Variant {
    key id              : UUID;
        user            : Association to User;
        name            : String;
        values          : array of {  
                                        tCode : String;
                                        appID : String;
                                        zTcode: String;
                                   };
        email           : String;
        owner           : String;
        versionID       : String;
        versionDesc     : String;
        sharedTo        : array of String;
        currentStep     : String;
        shareinfo_id    : String;
}
entity Feedback {
    key id              : UUID;
        user            : String;
        usefulRating    : Integer;
        agreeRating     : Integer;
        comment1        : String;
        comment2        : String;
        comment3        : String;
        appRating          : Integer;
}

entity Catalog {
    key id              : UUID;
        user            : Association to User;
        role            : array of String;
        catID           : String;
        name            : String;
        type            : String;
}
entity Group {
    key id              : UUID;
        user            : Association to User;
        role            : array of String;
        groupID         : String;
        name            : String;
}

entity Role {
    key id              : UUID;
        user            : Association to User;
        roleID          : String;
        name            : String;
        catalog         : array of String;
        group           : array of String;
}

// link table entity for many-to-many relationship
entity Roles_Catalogs {
  role : Association to Role;
  catalog : Association to Catalog;
}

entity AppMap {
    key id              : UUID;
        name            : String;
        zTcode          : String;
        tCode           : String;
        roleID          : String;
        roleDesc        : String;
        catID           : String;
        catDesc         : String;
        groupID         : String;
        groupDesc       : String;
}
entity SystemConnectionInfo {
    url: String;
    tr: String;
    userName: String;
    password: String;
    data: String;
}
// TBD Test case for public interface
entity ShareInfo : managed {
    key id : UUID @title : 'ID';
        selectedVersion: String @title : 'Version';
        passKey: String @title : 'Pass Key';
        createdBy: String @title : 'Created By';
        customerName: String @title : 'Customer Name';
        STO3NRepost: Boolean @title : 'Is Uploaded File';
        tcodes: many {
                tcode: String @title : 'TCode';
                appids: many {
                    appid: String @title : 'App ID';
                } null;
        } null ;
        count: Integer default 0 @title : 'Access Count'; 
        lastAccessDate: DateTime @title : 'Last Access';
        top_overall_tran: many {
            Report_or_Transaction_name: String;
            Number_of_Dialog_Steps: Integer;
        };
        top_standard_tran: many {
            Report_or_Transaction_name: String;
            Number_of_Dialog_Steps: Integer;
        };
        top_custom_tran: many {
            Report_or_Transaction_name: String;
            Number_of_Dialog_Steps: Integer;
        }; 
        svariant : String @title : 'Variant Name';
        svariant_id : String @title : 'Variant ID';

}

// TBD Not used
entity STO3N_Repost: managed {
    key id : UUID;
        selectedVersion: String;
        createdBy: String;
        customerName: String;
        top_overall_tran: many {
            Report_or_Transaction_name: String;
            Number_of_Dialog_Steps: Integer;
        };
        top_standard_tran: many {
            Report_or_Transaction_name: String;
            Number_of_Dialog_Steps: Integer;
        };
        top_custom_tran: many {
            Report_or_Transaction_name: String;
            Number_of_Dialog_Steps: Integer;
        };    
}