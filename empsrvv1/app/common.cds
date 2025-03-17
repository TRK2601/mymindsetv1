using com.mindset as admin from '../db/schema';
using from '../srv/EmpService';

 // Annotate Fields
 annotate admin.Certifications with {
 
 name  @title : 'Certifications';
 ID  @( title : 'F4 Certification',
       UI.Hidden,
     Common : {Text : name }
 ) };

 annotate admin.Employees with 
 {
  name  @title : 'Employee Name';
 ID  @( 
      UI.Hidden,
      Common : {Text : name }
 );
 } ;

 annotate admin.EmployeeCertifications with 
 {
  date  @title : 'Valid From';
 certificationLink  @title : 'Certification URL' ;
   
 } ;

  annotate admin.Skills with 
 {
  name  @title : 'Skills';
 description  @title : 'Description' ;
   
 } ;




 annotate admin.EmployeeCertifications with {
    certification @Common.ValueList : {
        $Type : 'Common.ValueListType',
       
        Parameters : [
           {
                $Type : 'Common.ValueListParameterInOut',
                ValueListProperty : 'ID',
                LocalDataProperty : certification_ID, 
            },
            {
       $Type : 'Common.ValueListParameterDisplayOnly',
       ValueListProperty : 'name'
       },
        
        ],
        CollectionPath : 'Certifications',
       SearchSupported : true,
        Label : 'List of Certifications',
        
       
    }
};