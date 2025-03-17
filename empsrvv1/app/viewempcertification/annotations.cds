using EmployeeService as service from '../../srv/EmpService';

 annotate service.EmployeeCertifications with @(UI : {

   
    HeaderInfo : {
       TypeName : 'Certification',
       TypeNamePlural : 'Certifications',
       Title : {
          $Type : 'UI.DataField',
          Value : employee.name
       },
       Description : {
          $Type : 'UI.DataField',
            Value :certification.ID 
       }
    },
    
  
    LineItem : [

      { $Type : 'UI.DataField',
         Value : employee.name,
          ![@UI.Importance] : #High,
           
         },
           { $Type : 'UI.DataField',
         Value : certification.name,
               ![@UI.Importance] : #High,
           },
         { $Type : 'UI.DataFieldWithUrl',
           Label : 'Certification Link',
          Url : certificationLink,
          Value : certificationLink,
              ![@UI.Importance] : #High
           },
         { $Type : 'UI.DataField',
         Value : certificationNumber,
          ![@UI.Importance] : #High
         
       },
         { $Type : 'UI.DataField',
         Value : date,
         ![@UI.Importance] : #High
           },
       { $Type : 'UI.DataField',
         Value : expiryDate,
         ![@UI.Importance] : #High
        },
         { $Type : 'UI.DataField',
   Value : certification_ID,
   ![@UI.Hidden] : true   
 }          
      
       
    ],

//Default Ordering With Name
PresentationVariant : {
  Text           : 'Default',
  SortOrder      : [{Property  : employee.name ,
                      Descending : true }],
    Visualizations : ['@UI.LineItem']
},

 },
//Selection Fields
  UI.SelectionFields : [date,certification_ID]  
 );

// Disabling the Create and Delete Buttons

annotate service.EmployeeCertifications with @( UI.DeleteHidden: true);   
annotate service.EmployeeCertifications with @( UI.CreateHidden: true);   

annotate service.EmployeeCertifications with @(UI : {
     Facets : [{
        $Type : 'UI.ReferenceFacet',
        Label : 'Details',
        Target : '@UI.FieldGroup#Main',
     }],
     FieldGroup #Main : {Data : [
       {Value : employee.name},
       {Value : certification.name},
       {Value : certificationNumber},
       {Value : date},
       {Value : expiryDate},
       { $Type : 'UI.DataFieldWithUrl',
           Label : 'Certification Link',
          Url : certificationLink,
          Value : certificationLink},
       
    ]},
 });
