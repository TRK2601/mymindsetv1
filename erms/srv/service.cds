using {com.mindset.erms as ers } from '../db/data-model';

annotate emp_reimbersment.Employees with @odata.draft.enabled : false;

//  @(requires: 'authenticated-user')
service emp_reimbersment {
    entity Employees  as projection on ers.Employee;
    entity Reimbersments as projection on ers.Reimbersment;
    entity Remarks as projection on ers.Remark;
    entity Attachments as projection on ers.Attachment;
    entity Tasks as projection on ers.Task; 
    entity ExpenseTypes as projection on ers.ExpenseType; 
    // This service only for dummy data 
    // entity Dummy as projection on ers.Dummy;

    // function getWFInitData(reimbersment_Id_ID: String, ID: String) returns array of String;
    function getWFInitData() returns array of String;

    function getWFLogsData(wf_instance_id: String) returns array of String;

    function getWFTaskUpdateData(wf_task_id: String, type: String) returns array of String;
    function getWFTokenData() returns array of String;

     entity Files as projection on ers.Files;
    //  action uploadHandler(data: Files);
    //  function uploadHandler(data: many{ fileName: String; fileSize: Integer; fileType: String; fileContent: Binary}) returns array of String;

}
// Test case
service EmpData {
  entity EmployeeTestData  as projection on ers.EmployeeTestData;
  entity WfTrigger  as projection on ers.WfTrigger;
}


// Aggregation and analytical annotations
annotate emp_reimbersment.Reimbersments with@(
//Header-level annotations
Aggregation.ApplySupported: {
  PropertyRestrictions: true,
  Transformations: [
    'aggregate',
    'topcount',
    'bottomcount',
    'identity',
    'concat',
    'groupby',
    'filter',
    'top',
    'skip',
    'orderby',
    'search'
  ],
  AggregatableProperties: [
    {
      $Type: 'Aggregation.AggregatablePropertyType',
      Property: type
    },
    {
      $Type: 'Aggregation.AggregatablePropertyType',
      Property: amount
    }
  ],
  GroupableProperties: [
    amount,
    day,
    type
  ]
},
//UI annotation
UI: {
  Chart: {
    Title: 'Default',
    Description: 'Default chart',
    ChartType: #Column,
    Dimensions: [
      type
    ],
    Measures: [
      amount
    ],
    DimensionAttributes: [
      {
        $Type: 'UI.ChartDimensionAttributeType',
        Dimension: type,
        Role: #Series
      }
    ]
  }
})
{
//Element-level annotations
type@(title: '{i18n>Type Expenses}',
  Analytics.Dimension: true,
  Role: #Series);amount@(title: '{i18n>Amount}',
  Analytics.Measure: true,
  Aggregation.default: #SUM,
  );
}




// @(restrict: [
//         {
//             grant: ['*'],
//             to   : ['com.mindset.role.resourcemanager']
//         },
//         {
//             grant: ['READ'],
//             to   : [
//                 'com.mindset.role.india.managers',
//                 'com.mindset.role.us.managers',
//                 'com.mindset.role.india.employees',
//                 'com.mindset.role.us.employees'
//             ]
//         },
//         {
//             grant: [
//                 'CREATE',
//                 'UPDATE'
//             ],
//             to   : [
//                 'com.mindset.role.india.employees',
//                 'com.mindset.role.us.employees'
//             ],
//             where: 'Email = $user'
//         },
//         {
//             grant: ['WRITE'],
//             to   : [
//                 'com.mindset.role.india.managers',
//                 'com.mindset.role.us.managers'
//             ],
//             where: 'Email = $user'
//         }
//     ])      