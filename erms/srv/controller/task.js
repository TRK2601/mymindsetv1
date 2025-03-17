const cds = require('@sap/cds');
const dotenv = require('dotenv');
const axios = require('axios');
const  onTokenData  = require('./get_tkendata');
const { Reimbersment, Employee } = cds.entities('com.mindset.erms');

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports._readWFLogsData = async function(req, res) {
    const { wf_instance_id } = req.data;
    const oTokenData = await onTokenData.onReadTokenData(req);
    if (oTokenData && wf_instance_id) {
        let sAccessToken =  oTokenData && oTokenData.data && oTokenData.data.access_token;
        const sWFLogsdata = "https://spa-api-gateway-bpi-us-prod.cfapps.us10.hana.ondemand.com/workflow/rest/v1/workflow-instances/" + wf_instance_id + "/execution-logs";
        return await axios.get(sWFLogsdata,{
            headers: {
                'content-type': `application/json`,
                'Authorization': "Bearer "+ sAccessToken,
                'x-qos':0
            }
        }).then(async response => {
            return response.data;   
        }).catch(err => {
            return err;
        });
    } else {
        return {
            "data": [
              {
                "reimbersment_Id_ID": "WorkFlow Token data trigger error...!",
                "ID": ""
              }
            ]
          };
    }
};
/**
 * {"status":"COMPLETED","decision":"reject","context":{"eName":"Ravi","role":"Dev"}}
 * {"status":"COMPLETED","decision":"approve","context":{"eName":"Ravi","role":"Dev"}}
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */

/**{
    "context": {},
    "status": "COMPLETED",
    "decision": "string",
    "subject": "string",
    "description": "string",
    "recipientUsers": "string",
    "recipientGroups": "string",
    "processor": "string",
    "dueDate": "2024-04-01T09:12:13.606Z",
    "priority": "VERY_HIGH",
    "confidenceLevel": 0
 }
 */
exports._getWFTaskUpdateData = async function(req, res) {
    // type = 'approve' or 'reject'
    const { wf_task_id, type } = req.data;
    const oTokenData = await onTokenData.onReadTokenData(req, res);
    if (oTokenData && wf_task_id) {
        let sAccessToken =  oTokenData && oTokenData.data && oTokenData.data.access_token;
        const sWFTaskLogsdata = "https://spa-api-gateway-bpi-us-prod.cfapps.us10.hana.ondemand.com/workflow/rest/v1/task-instances/" + wf_task_id;

        let oPayload = {
            "status": "COMPLETED",
            "decision": type,
            "processor": "action user id",
            "context": {}
         };
        return await axios.patch(sWFTaskLogsdata, oPayload ,{
            headers: {
                'content-type': `application/json`,
                'Authorization': "Bearer "+ sAccessToken,
                'x-qos':0
            }
        }).then(async response => {
            return response;   
        }).catch(err => {
            return err;
        });
    } else {
        return {
            "data": [
              {
                "reimbersment_Id_ID": "WorkFlow Token data trigger error...!",
                "ID": ""
              }
            ]
          };
    }
};


