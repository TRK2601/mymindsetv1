using EmployeeService as service from '../../srv/EmpService';

annotate service.Skills with @(
 odata.draft.enabled: true,
    UI : {
    HeaderInfo : {
       TypeName : 'Skill',
       TypeNamePlural : 'Skills',
       Title : {
          $Type : 'UI.DataField',
          Value : name
       },
       Description : {
          $Type : 'UI.DataField',
            Value : description
       }
    },
    Identification : [{
        Label : 'Skill',
        Value : description }],
    // Define the table columns
      LineItem      : [
         {
            $Type: 'UI.DataField',
            Value: name
         },
         {
            $Type: 'UI.DataField',
            Value: description
         },
         {
            $Type             : 'UI.DataFieldForAction',
            Action            : 'EmployeeService.mergeSkills',
            InvocationGrouping: #ChangeSet,
            Label             : 'Merge',

         }
      ]
 },
  UI.SelectionFields : [description,name]
 );
annotate service.Skills with @(UI : {
     Facets : [{
        $Type : 'UI.ReferenceFacet',
        Label : 'Skills',
        Target : '@UI.FieldGroup#Main',
     }],
     FieldGroup #Main : {Data : [
       {Value : name},
       {Value : description}
    ]},
 });
