using {com.mindset as mymodel} from '../db/schema';

@path: 'srv/EmployeeService'

service EmployeeService @(requires: 'authenticated-user') {

    entity EmployeeHeaderSet @(restrict: [
        {
            grant: ['*'],
            to   : ['com.mindset.role.resourcemanager']
        },
        {
            grant: ['READ'],
            to   : [
                'com.mindset.role.india.managers',
                'com.mindset.role.us.managers',
                'com.mindset.role.india.employees',
                'com.mindset.role.us.employees'
            ]
        },
        {
            grant: [
                'CREATE',
                'UPDATE'
            ],
            to   : [
                'com.mindset.role.india.employees',
                'com.mindset.role.us.employees'
            ],
            where: 'Email = $user'
        },
        {
            grant: ['WRITE'],
            to   : [
                'com.mindset.role.india.managers',
                'com.mindset.role.us.managers'
            ],
            where: 'Email = $user'
        }
    ])                              as projection on mymodel.Employee;

    //    service EmployeeService {
    //    entity EmployeeHeaderSet        as projection on mymodel.Employee;
    entity EmployeeProjectSet       as projection on mymodel.EmpProject;
    entity EmployeeSkillSet         as projection on mymodel.EmpSkill;
    entity EmployeeBlogSet          as projection on mymodel.EmpBlog;
    entity EmployeeCertificationSet as projection on mymodel.EmpCertification;
    entity EmployeeTrainingSet      as projection on mymodel.EmpTraining;
    entity EmployeeEventSet         as projection on mymodel.EmpEvent;
    entity UsefulLinkSet            as projection on mymodel.UsefulLink;
    entity EmployeeAdminSet         as projection on mymodel.EmployeeAdmin
    entity TechnicalSkillSet        as projection on mymodel.TechnicalSkill
    entity RoleSet                  as projection on mymodel.Role;
    entity DepartmentSet            as projection on mymodel.Department;
    entity LocationSet              as projection on mymodel.Location;
    entity UtilityKeySet            as projection on mymodel.UtilityKey;
    entity UtilityDetailSet         as projection on mymodel.UtilityDetail;

    // entity ClientProjectSet as projection on mymodel.ClientProject

    // entity ProjectDetailSet as projection on mymodel.ProjectDetail

    // New Data model projections

    entity Employees @(restrict: [
        {
            grant: ['*'],
            to   : ['com.mindset.role.resourcemanager']
        },
        {
            grant: ['READ'],
            to   : [
                'com.mindset.role.india.managers',
                'com.mindset.role.us.managers',
                'com.mindset.role.india.employees',
                'com.mindset.role.us.employees'
            ]
        },
        {
            grant: [
                'CREATE',
                'UPDATE'
            ],
            to   : [
                'com.mindset.role.india.employees',
                'com.mindset.role.us.employees'
            ],
            where: 'email = $user'
        },
        {
            grant: ['WRITE'],
            to   : [
                'com.mindset.role.india.managers',
                'com.mindset.role.us.managers'
            ],
            where: 'email = $user'
        }
    ])                              as projection on mymodel.Employees;

   // @odata.draft.enabled: true
    entity Roles                    as projection on mymodel.Roles;

    entity Departments              as projection on mymodel.Departments;
    entity Locations                as projection on mymodel.Locations;
    entity EmployeeSkills           as projection on mymodel.EmployeeSkills;
    // @odata.draft.enabled: false
    entity EmployeeCertifications   as projection on mymodel.EmployeeCertifications;
    entity EmployeeProjects         as projection on mymodel.EmployeeProjects;
    entity EmployeeEvents           as projection on mymodel.EmployeeEvents;
    entity EmployeeBlogs            as projection on mymodel.EmployeeBlogs;
    entity Skills                   as projection on mymodel.Skills actions {
                                           @Common.IsActionCritical
                                           @Common.SideEffects#GlobalSideEffect.TargetEntities :['/EmployeeService.EntityContainer/Skills']
                                    action mergeSkills(SkillName : String @Common.Label:'Skill Name') returns String;
                                       };
    entity SkillProficiencies       as projection on mymodel.SkillProficiencies;
    entity Certifications           as projection on mymodel.Certifications;
    entity Projects                 as projection on mymodel.Projects;
    entity EmployeeTrainings        as projection on mymodel.EmployeeTrainings;
    entity ParticipationType        as projection on mymodel.ParticipationTypes;
    
    function sendSlackNotification() returns String;
    function getSlackID(email:String) returns String;
    
}

