using EmployeeService as service from '../../srv/EmpService';

annotate service.Certifications with @(
 odata.draft.enabled: true,
    UI : {
    HeaderInfo : {
       TypeName : 'Certificate',
       TypeNamePlural : 'Certificates',
       Title : {
          $Type : 'UI.DataField',
          Value : description
       },
       Description : {
          $Type : 'UI.DataField',
            Value : name
       },
    },
    Identification : [{
        Label : 'Certifications',
        Value : name }],
    // Define the table columns
    LineItem : [
      { $Type : 'UI.DataField',
         Value : name},
       {  $Type : 'UI.DataField',
         Value : description}
       
    ]
 },
  UI.SelectionFields : [description,name]
 );
annotate service.Certifications with @(UI : {
     Facets : [{
        $Type : 'UI.ReferenceFacet',
        Label : 'Certifications',
        Target : '@UI.FieldGroup#Main',
     }],
     FieldGroup #Main : {Data : [
       {Value : name},
       {Value : description}
       
    ]},
 });