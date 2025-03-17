namespace com.mindset;

using {
    managed,
    sap.common.CodeList
} from '@sap/cds/common';


entity Employee : managed {
    key EmpId          : String
                                     @Core.Computed;
        Name           : String;
        PhoneNo        : String;
        Email          : String;
        About          : String;
        Picture        : LargeBinary @Core.MediaType: 'image/png';
        Profile        : LargeBinary @Core.MediaType: 'image/png';
        Location       : String;
        Role           : String;
        Department     : String;
        Availability   : String;
        CurrentProject : String;
        Manager        : String;
        DeleteFlag     : Boolean;
        Projects       : Composition of many EmpProject
                             on Projects.Proj = $self;
        Blogs          : Composition of many EmpBlog
                             on Blogs.Blog = $self;
        Skills         : Composition of many EmpSkill
                             on Skills.Skill = $self;
        Certifications : Composition of many EmpCertification
                             on Certifications.Certification = $self;
        Trainings      : Composition of many EmpTraining
                             on Trainings.Training = $self;
        Events         : Composition of many EmpEvent
                             on Events.Event = $self;
}


entity EmpProject : managed {
    key ID          : String;
        ClientName  : String;
        Name        : String;
        Description : String;
        Status      : String;
    key Proj        : Association to Employee;
}

entity EmpBlog : managed {
    key ID            : String;
        Name          : String;
        BlogLink      : String;
        PublishedDate : String;
        ReviewedBy    : String;
        Comments      : String;
    key Blog          : Association to Employee;
}

entity EmpSkill : managed {
    key ID          : String;
        Name        : String;
        Description : String;
        Proficiency : String;
    key Skill       : Association to Employee;
}

entity EmpCertification : managed {
    key ID                  : String;
        Name                : String;
        Description         : String;
        Skills              : String;
        CertificationNumber : String;
        Date                : String;
        ExpiryDate          : String;
        CertificationLink   : String;
        Comments            : String;
    key Certification       : Association to Employee;

}

entity EmpTraining : managed {
    key ID            : String;
        Name          : String;
        Skills        : String;
        TrainingHours : String;
        FromDate      : String;
        ToDate        : String;
        Comments      : String;
    key Training      : Association to Employee;
}

entity EmpEvent : managed {
    key ID                : String;
        Name              : String;
        EventDate         : String;
        ParticipationType : String;
        Comments          : String;
    key Event             : Association to Employee;
}

entity UsefulLink : managed {
    key ID          : String;
        Name        : String;
        LinkAddress : String;
}

entity EmployeeAdmin : managed {
    key ID         : String;
        Skill      : Composition of many TechnicalSkill
                         on Skill.Skill = $self;
        Role       : Composition of many Role
                         on Role.Role = $self;
        Department : Composition of many Department
                         on Department.Department = $self;
        Location   : Composition of many Location
                         on Location.Location = $self;
}

entity TechnicalSkill : managed {
    key ID          : String;
        Name        : String;
        Description : String;
    key Skill       : Association to EmployeeAdmin;
}

entity Role : managed {
    key ID          : String;
        Name        : String;
        Description : String;
    key Role        : Association to EmployeeAdmin;
}

entity Department : managed {
    key ID          : String;
        Name        : String;
        Description : String;
    key Department  : Association to EmployeeAdmin;
}

entity Location : managed {
    key ID       : String;
        Name     : String;
    key Location : Association to EmployeeAdmin;
}

entity UtilityKey : managed {
    key ConfigId    : String;
        ConfigKey   : String;
        ConfigName  : String;
        NavToDetail : Composition of many UtilityDetail
                          on NavToDetail.Config = $self;
}

entity UtilityDetail : managed {
    key Id          : String;
        Name        : String;
        Description : String;
    key Config      : Association to UtilityKey;
}
// entity ClientProject{
//     key ID : String;
//     ClientName : String;
//     Projects : Composition of many ProjectDetail on Projects.client = $self;
// }

// entity ProjectDetail{
//     key ID : String;
//     ProjectName : String;
//     ProjectDescription : String;
//     key client : Association to ClientProject;
// }

// New Data model

entity Employees: managed  {
    key ID             : UUID        @Core.Computed;
        name           : String;
        phoneNo        : String;
        email          : String;
        about          : String;
        profile        : LargeBinary @Core.MediaType: 'image/png';
        location       : Association to Locations;
        role           : Association to Roles;
        department     : Association to Departments;
        availability   : String;
        currentProject : String;
        manager        : Association to Employees;
        deleteFlag     : Boolean;
        linkedInId     : String;
       slackID        : String;
        projects       : Composition of many EmployeeProjects
                             on projects.employee = $self;
        blogs          : Composition of many EmployeeBlogs
                             on blogs.employee = $self;
        skills         : Composition of many EmployeeSkills
                             on skills.employee = $self;
        certifications : Composition of many EmployeeCertifications
                             on certifications.employee = $self;
        trainings      : Composition of many EmployeeTrainings
                             on trainings.employee = $self;
        events         : Composition of many EmployeeEvents
                             on events.employee = $self;
}

entity Roles : managed {
    key ID          : UUID @Core.Computed;
        name        : String;
        description : String;
        employees   : Association to many Employees
                          on employees.role = $self;
}

entity Departments : managed {
    key ID          : UUID @Core.Computed;
        name        : String;
        description : String;
        employees   : Association to many Employees
                          on employees.department = $self;
}

entity Locations : managed {
    key ID          : UUID @Core.Computed;
        name        : String;
        description : String;
        employees   : Association to many Employees
                          on employees.location = $self;
}
@assert.unique : {
   empSkill: [ employee,skill ]
}
entity EmployeeSkills : managed {
    key employee    : Association to Employees;
    key skill       : Association to Skills;
        proficiency : Association to SkillProficiencies;
}

@assert.unique : {
   name: [ name ]
}
entity Skills : managed {
    key ID             : UUID   @Core.Computed;
        name           : String @title: 'Skills';
        description    : String;
        employees      : Composition of many EmployeeSkills
                             on employees.skill = $self;
     //   certifications : Association to many EmployeeCertifications
                       //      on certifications.skill = $self;
}

entity SkillProficiencies : CodeList {
    key code           : String enum {
            Beginner     = 'B';
            Intermediate = 'I';
            Expert       = 'E';
            Aspirational = 'A';
        };
        name           : String;
        description    : String;
        employeeSkills : Association to many EmployeeSkills
                             on employeeSkills.proficiency = $self;
}

entity EmployeeCertifications : managed {
    key employee            : Association to Employees;
    key certification       : Association to Certifications @title: 'Certifications';
    //    skill               : Association to Skills;
        certificationNumber : String                        @title: 'Certification No.';
        date                : Date                          @title: 'Date'; //Search-Term: #TimeAndDate
        expiryDate          : Date                          @title: 'Expiry Date'; //Search-Term: #TimeAndDate
        certificationLink   : String;
        comments            : String;
}

entity Certifications : managed {
    key ID          : UUID   @Core.Computed  @title: 'Certifications';
        name        : String @title: 'Certification Name';
        description : String @title: 'Description';
        employees   : Composition of many EmployeeCertifications
                          on employees.certification = $self;
}

entity EmployeeProjects : managed {
    key employee : Association to Employees;
    key project  : Association to Projects;
}

entity Projects : managed {
    key ID          : UUID @Core.Computed;
        name        : String;
        client      : String;
        description : String;
        status      : String;
        employees   : Composition of many EmployeeProjects
                          on employees.project = $self;
}

entity EmployeeEvents : managed {
    key ID                : UUID @Core.Computed;
        name              : String;
        eventDate         : Date @title: 'Event Date';
        location          : String;
        description       : String;
        employee          : Association to Employees;
        participationType : Association to ParticipationTypes;
        comments          : String;
}

// entity Events : managed {
//     key ID          : UUID @Core.Computed;
//         name        : String;
//         eventDate   : String;
//         location    : String;
//         description : String;
//         employees   : Composition of many EmployeeEvents
//                           on employees.event = $self;
// }

entity EmployeeBlogs : managed {
    key ID            : UUID @Core.Computed;
        name          : String;
        blogLink      : String;
        publishedDate : Date @title: 'Published Date';
        reviewedBy    : Association to Employees;
        comments      : String;
        employee      : Association to Employees;
}

entity EmployeeTrainings : managed {
    key ID            : UUID @Core.Computed;
        employee      : Association to Employees;
        name          : String;
        skill         : Association to Skills;
        trainingHours : Integer;
        fromDate      : Date @title: 'From Date';
        toDate        : Date @title: 'To Date';
        comments      : String;
}

//entity ParticipationType : CodeList {
  //  key ID    : UUID;
  //      name  : String;
  //      order : Integer;
//}

entity ParticipationTypes : CodeList {
    key code         : String enum {
            Host     = 'H';
            CoHost  = 'C';
            Participants  = 'P';
            Moderator = 'M';
            Other = 'O'
        };
        name  : String;
        description : String;
        employeeEvents : Association to many EmployeeEvents
                             on employeeEvents.participationType = $self;
}

