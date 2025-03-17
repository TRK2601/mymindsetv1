namespace com.mindset.erms;
using { managed } from '@sap/cds/common';

entity Employee : managed {
    key ID: UUID @Core.Computed;
        EmpId           : String @title: 'Emp ID';
        name            : String  @title: 'Name';
        empEail         : String  @title: 'Emp Email';
        contact         : String  @title: 'Contact';
        location        : String  @title: 'Location';
        department      : String  @title: 'Department';
        managerName     : String  @title: 'Manager Name';
        managerEmail    : String  @title: 'Manager Email';
        startDate       : Date    @title: 'Start Date';
        endDate         : Date    @title: 'End Date';
        role            : String  @title: 'Role';
        totalAmount     : Double  @title: 'Total Amount';
        status          : String  @title: 'Status';

        // Emp Association
        reimbersment: Association to many Reimbersment on reimbersment.reimbersment_Id =  $self;  
        task: Association to many Task on task.task_Id =  $self; 
}
entity Reimbersment {
    key ID              : UUID   @Core.Computed @title;
        expense_date    : Date   @title: 'Expense Date';
        description     : String @title: 'Description';
        bill_no         : String @title: 'Bill No';
        type            : String @title: 'Type';
        type_desc       : String @title: 'Type Desc';
        status          : String @title: 'Status';
        amount          : Double @title: 'Expense Amount';
        day             : Integer;
        EmpId           : String;
        wf_instance_id  : String;
        // Association
        reimbersment_Id : Association to Employee;       
        attachment      : Association to many Attachment on attachment.attachment_Id =  $self;
        remark          : Association to many Remark on remark.remark_Id = $self;
          
}

entity Attachment: managed {
    key ID              : UUID @Core.Computed;
        name            : String;
        data            : LargeBinary  @Core.MediaType: mediaType  @Core.ContentDisposition.Filename: fileName  @Core.ContentDisposition.Type: 'inline';
        mediaType       : String       @Core.IsMediaType;
        fileName        : String;
        url             : String;
        attachment_Id   : Association to Reimbersment;
}

entity Remark: managed {
    key ID          : UUID @Core.Computed;
        remak_desc  : String @title: 'Remak Desc';    
        remark_Id   : Association to Reimbersment;
}

entity Task: managed  {
    key ID          : UUID;
        status_desc : String @title: 'Status Desc';
        task_Id     : Association to Employee;
}

entity ExpenseType: managed  {
    key ID          : UUID;
        type_id : String @title: 'Type Id';
        type_desc: String @title: 'Type Desc';
}

entity EmployeeTestData : managed {
    key EmpId          : String
                                     @Core.Computed;
        Name           : String;
        PhoneNo        : String;
        Email          : String;
        About          : String;
        Profile        : LargeBinary @Core.MediaType: 'image/png';
        Location       : String;
        Role           : String;
        Department     : String;
        Availability   : String;
        CurrentProject : String;
        Manager        : String;
}
entity WfTrigger {
    data: array of {
        reimbersment_Id_ID: String;
        ID: String;
    };
}


 entity Files {
    key ID : UUID;
    fileName : String;
    fileSize : Integer;
    fileType : String;
    fileContent : Binary;
  }



// entity Dummy {
//     key ID: UUID;
//         reimbersment_Id_ID: String;
//         definitionId: String;
//         context: many  {
//             _name: String;
//             email: String;
//             department: String;
//             employeeID: String;
//             manager: String;
//             office: String;
//             totalAmount: String;
//             isTotalAmountMoreThen10000: String;
//             upload: String;
//             userComments: String;      
//             data: many {
//                 date: Date;
//                 particulars: String;
//                 billNO: String;
//                 amount: Integer;
//             }; 
//         };    
// }