const cds = require('@sap/cds')
const { WebClient } = require('@slack/web-api');
const { Employees,Skills, EmployeeSkills } = cds.entities('com.mindset');

let webClient, channel, usersStore = [], notifyEmpCount;

const logger = cds.log('app')
logger.info ('CDS Logger Active')

//used to load environment(user-provided) values for  local development by using default-env.json file
var xsenv = require("@sap/xsenv")
xsenv.loadEnv();

const init = async () => {
  await _loadSlackProfile();
};

/**
 * This function is responsible for generate a slack web api instance
 *  and read the members from mindset slack workspace .
 */

async function _loadSlackProfile() {
  //retrive slack bot token from Cloud Foundry user-provided variables
  const token = process.env.SLACK_BOT_KEY;
  webClient = new WebClient(token);
  try {
    //read members from workspace using slack api method called users.list()
    const result = await webClient.users.list();
    await saveUsers(result.members);
  }
  catch (error) {
    logger.error(error);
  }
}

async function saveUsers(usersArray) {
  usersArray.forEach(function (user) {
    if (user.id !== "USLACKBOT" && user.is_bot === false) {
      usersStore.push(user);
    }
  });
}

function convertDateToDays(modifiedDate) {
  let targetDate = new Date(modifiedDate);
  let currentDate = new Date();
  let timeDifferenceMs = currentDate.getTime() - targetDate.getTime();
  let days = Math.floor(timeDifferenceMs / (1000 * 60 * 60 * 24));
  return days;
}

async function _customHandlerForSlackNotify() {
  await _sendNotificationProcess();
  if (notifyEmpCount > 0) {
    return "Sent slack notifications successfully";
  } else {
    return "No employee's found for send notification";
  }
}

/**
 * This function is responsible for finding slack id's of valid employees
 *  and store them into DB permanently.
 */
/*
async function _saveSlackIDsInToDB(employees) {
  return Promise.all(employees.map(async employee => {
    if (!employee.slackID && !employee.deleteFlag) {
      usersStore.forEach(async user => {
        if (user.profile) {
          let email = user.profile.email;
          if (email === employee.email) {
            let id = user['id'];
            let [ID, slackid] = [employee.ID, id];
            let srv = await cds.connect.to('EmployeeService');
            let sSrv = srv.tx();
            //update slack id's  into DB.
            await sSrv.run(
              UPDATE(Employees, ID)
                .with({
                  slackID: slackid
                })
            );
            sSrv.commit();
          }
        }
      })
    }
  }))

}
*/
/**
 * This function is responsible to getting Slack updated employee information
 * and identify the employees to send notifications.  
 */
const _sendNotificationProcess = async () => {
  try {
    const notifyEmployees = [];
    //Retrieve last modified days check from Cloud Foundry user-provided variables
    const notifyDay = process.env.LAST_MODIFIED_DAYS_CHECK;
    //getting updated employees information after slack ID's in db.
    let srv = await cds.connect.to('EmployeeService');
    let sSrv = srv.tx();
    let employees = await sSrv.run(SELECT.from(Employees).where({ deleteFlag: false }));
    logger.info('Found Employees: ', employees);
    sSrv.commit();
    //find notify employees information
    employees.forEach(async emp => {
      if (emp.modifiedAt) {
        let days = convertDateToDays(emp.modifiedAt);
        if (days >= parseInt(notifyDay)) {
          usersStore.forEach(async user => {
            if (user.profile) {
              let email = user.profile.email;
              if (email === emp.email) {
                let slackId = user['id'];
                let uniqueEmployee = {};
                id = emp['ID'];
                emp['slackID'] = slackId;
                uniqueEmployee[id] = emp;
                for (i in uniqueEmployee) {
                  notifyEmployees.push(uniqueEmployee[i]);
                }
              }
            }
          })

        }
      }
    });

    notifyEmpCount = notifyEmployees.length;
    //send notification to identified employee's
    notifyEmployees.forEach(async employee => {
      try {
        await sendNotificationMessage(employee);
      }
      catch (error) {
        logger.error(error);
      }
    });
  } catch (error) {
    logger.log(error)
  }
}

/**
 * This function is responsible for posting Slack messages to users through Slack bot app 
 * @param {Object} employee 
 */
async function sendNotificationMessage(employee) {
  //Open conversation in the  employee portal channel with respective users.
  let result = await webClient.conversations.open({ users: employee.slackID });
  let days = employee.modifiedAt && convertDateToDays(employee.modifiedAt);
  if (result.ok) {
    let ch = result.channel;
    channel = ch["id"];
    //Retrieve message template from Cloud Foundry user-provided variables
    //and replaced with slack DM ID and last modified days
    let msg = process.env.MSG_TEMPLATE;
    msg = JSON.parse(msg);
    let msgTemplate = [...msg];
    let dmIDText = msgTemplate[0].text.text.replace("{0}", employee.slackID);
    let daysText = msgTemplate[1].text.text.replace("{$}", days);
    msgTemplate[0].text.text = dmIDText;
    msgTemplate[1].text.text = daysText;
    logger.info('Sending Slack Message to: ', employee.email, msgTemplate);
    //send message to user using chat.postMessage slack api method
    try {
      await webClient.chat.postMessage(
        {
          channel: channel,
          as_user: true,
          blocks: msgTemplate
        });
    }
    catch (error) {
      logger.error(error);
    }
  }
}
function proficiencyUpdateRequired(currentValue, newValue) {
  let retResponse = false;
  const aSkillProficiencies = ['A', 'B', 'I', 'E'];
  if (aSkillProficiencies.indexOf(currentValue) < aSkillProficiencies.indexOf(newValue)) {
    let retResponse = true;
  }
  return retResponse;
}


module.exports = async function (srv) {
  await init(srv);
  // Custom logic for EmployeeHeaderSet
  srv.before('UPDATE', 'EmployeeHeaderSet', (req) => {
    if (req.data.DeleteFlag === true) {
      if (req.user.is('com.mindset.role.resourcemanager')) {
        // Allow the operation
      } else {
        req.reject(402);
      }
    }
  });

  // Custom logic for Employees entity set
  srv.before('UPDATE', 'Employees', (req) => {
    if (req.data.deleteFlag === true) {
      if (req.user.is('com.mindset.role.resourcemanager')) {
        // Allow the operation
      } else {
        req.reject(402);
      }
    }
  });
  /**
* Merges skills one by one by executing these steps
* 
*  1. Look up employees with skills that will be merged
*  2. Delete the skill that is being merged
*  3. Check if the new skill we are merging to already exists
*  4. If it doesn't exist, create it
*  5. Looping through employees with each skill and checking employees with the new merged skill exist
*  6. If it doesn't exist, create it
*  7. Update proficiency for the employee with the merged skill to the highest level
* 
* @param req {Object} The request.
* @param req.params[0].ID {String} the list item Id.
* @param req.body {Object} The JSON payload.
* @return {string}
*/
  // Custom logic for update slack DM ID's into database and send slack notifications
 
  srv.on('mergeSkills', 'Skills', async (req) => {
    let result;
     let db = await cds.connect.to('db');
    // let tx = srv.tx();
    if (req.params) {
      try {
      let employeesWithSkillToBeMerged = [];
            employeesWithSkillToBeMerged = await db.run(
          SELECT
            .from('com.mindset.EmployeeSkills')
            .where({ skill_ID: req.params[0].ID }))
        let updatedSkill;

        try {
          await db.run(
            DELETE
              .from('com.mindset.Skills')
              .where({ ID: req.params[0].ID }));
          updatedSkill = await INSERT.into(Skills, {
            name: req.data.SkillName,
            description: req.data.SkillName
          })
        } catch (insertError) {
          logger.log(`SKill catch ${insertError}`);
        }
        let mergedRecord = await db.run(
          SELECT
            .from('com.mindset.Skills')
            .where({ name: req.data.SkillName }))
        let mergedSkillId = mergedRecord[0].ID;
        let mergedEmployeeSkillRecords ;
        let idx = 0;
        try{
        for ( idx;idx < employeesWithSkillToBeMerged.length ;idx++) {
          logger.log(`inside forloop times `)
          
          try{
            await INSERT.into(EmployeeSkills, {
              employee_ID: employeesWithSkillToBeMerged[idx].employee_ID,
              skill_ID: mergedSkillId,
              proficiency_code: employeesWithSkillToBeMerged[idx].proficiency_code
            })
          }catch (e) {
            // will update proficiency here  
            try{
            let existingMergedSkill = await db.run(
              SELECT
                .from('com.mindset.EmployeeSkills')
                .where({ 
                  employee_ID: employeesWithSkillToBeMerged[idx].employee_ID,
                  skill_ID: mergedSkillId    
                   }));
            logger.log(`inside   2  of empskill error catch`)
            logger.log(`inside   length of mergedSkills ${existingMergedSkill.length}`)
            if(existingMergedSkill && existingMergedSkill.length > 0 ){
              logger.log(`before  proficiency update required `)
              // printing catch block data 
              logger.log(`proficiency of the current emp skill ${employeesWithSkillToBeMerged[idx].proficiency_code} `)
              logger.log(`proficiency of the merged  emp skill ${existingMergedSkill[0].proficiency_code} `)
              if (proficiencyUpdateRequired(existingMergedSkill[0].proficiency_code,employeesWithSkillToBeMerged[idx].proficiency_code)) {
               logger.log(`inside proficiency update required `)
                existingMergedSkill[0].proficiency_code = employeesWithSkillToBeMerged[idx].proficiency_code;
                logger.log(`logging proficiency  of the merged  emp skill ${existingMergedSkill[0].proficiency_code} `)
             
              await UPSERT.into(EmployeeSkills).entries(existingMergedSkill[0])
            }
            }
          }catch(insideCAtch){
            logger.log(`inside catch of try of catch errro ${insideCAtch}`)
          }             
            logger.log(`empskill  catch ${e}`);
            //await tx.rollback(e); // will rethrow e
          }
        }
      }catch(forError){
        logger.log(`for loop error ${forError}`);
      }
        result = "Success";
      } catch (e) {
        logger.log(`error catch ${e}`);
        //await tx.rollback(e); // will rethrow e
      }
    }
    return result;
  });
  srv.on('sendSlackNotification', _customHandlerForSlackNotify);
  srv.on('getSlackID', _returnSlackID);
  
  
}

async function _returnSlackID(req) {
  let slackId = "";
  if(req.data && req.data.email){   
    usersStore.forEach(async user => {
      if (user.profile) {
        let email = user.profile.email;
        if (email === req.data.email) {
           slackId = user['id'];         
        }
      }
    })
  } 
  return slackId.toString();
}
