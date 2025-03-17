const cds = require('@sap/cds');
const exp = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const  onTokenData  = require('./get_tkendata');
const { Reimbersment, Employee } = cds.entities('com.mindset.erms');

/**
 * Get the Bearer token and send to UX
 * @method Get
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports._readData = async function(req, res) {
    const oReqData = structuredClone(req.data.data[0]);
    const { reimbersment_Id_ID, ID } = oReqData;
    const oTokenData = await onTokenData.onReadTokenData(req);
    if (oReqData && oTokenData) {
        let srv = await cds.connect.to('emp_reimbersment');
        const oReimbersment = await srv.read(Reimbersment).where('reimbersment_Id_ID =', reimbersment_Id_ID).and('ID =', ID);
        console.log("Level2 : " + oReimbersment);
        // const oReimbersment = await srv.read(Reimbersment).where('reimbersment_Id_ID =', reimbersment_Id_ID);
        if (!oReimbersment || oReimbersment.length === 0) {
            const odata = await onUpdateDependingSetData(req, res, oReqData, false, false);  
            return {
                "data": [
                  {
                    "reimbersment_Id_ID": "oReimbersment trigger error...!",
                    "ID": ""
                  }
                ]
              };

        }
        const oEmployee = await srv.read(Employee) .where('ID =', reimbersment_Id_ID);
        if (!oEmployee || oEmployee.length === 0) {
            const odata = await onUpdateDependingSetData(req, res, oReqData, false, false); 
            console.log("Level5 : " + odata);
            return {
                "data": [
                  {
                    "reimbersment_Id_ID": "oEmployee trigger error...!",
                    "ID": ""
                  }
                ]
              };
        }

        if (oEmployee && oEmployee.length > 0 && oReimbersment && oReimbersment.length > 0) {                
            let sAccessToken =  oTokenData && oTokenData.data && oTokenData.data.access_token; 
            const oEmployeesdata = oEmployee[0];      
            const oReimbersmentdata = oReimbersment[0];
            let sURL = 'https://spa-api-gateway-bpi-us-prod.cfapps.us10.hana.ondemand.com/workflow/rest/v1/workflow-instances';            
            let sData = {
                "definitionId": "us10.mindsetbtpdev.expensemanagement1.expenseManagement",
                "context": {
                    "_name": oEmployeesdata.name || "",
                    "department": oEmployeesdata.department || "",
                    "email": oEmployeesdata.empEail || "",
                    "employeeID": oEmployeesdata.EmpId ||  "",
                    "manager": oEmployeesdata.managerEmail || "",
                    "office": oEmployeesdata.location || "",
                    "data": [
                        {
                            "date": oReimbersmentdata.expense_date || new Date(),
                            "particulars": oReimbersmentdata.type ||  "",
                            "billNO": oReimbersmentdata.bill_no || "",
                            "amount": oReimbersmentdata.amount || 0
                        }
                    ],
                    "totalAmount": oReimbersmentdata.amount ? oReimbersmentdata.amount.toString() : "0",
                    "isTotalAmountMoreThen10000": oReimbersmentdata.amount && oReimbersmentdata.amount > 10000 ?  "Yes" : "No",
                    "upload": "spa-res:cmis:folderid:GAgSH-veVg5z2EKG6D4VzghLkfxyZCm3kZxDO-YJzbo",
                    "userComments": oReimbersmentdata.type_desc || ""
                }
            };  
            
            console.log(sAccessToken);
            console.log("************************************");
            console.log(sData.toString());

            console.log("************************************");
            return await axios.post(sURL, sData, {
                headers: {
                    'content-type': `application/json`,
                    'Authorization': "Bearer "+ sAccessToken,
                    'x-qos':0
                }
            }).then(async response => {                
                console.log("*******************oReqData*****************");        
                let odata =  await onUpdateDependingSetData(req, res, oReqData, response, true);  
                return {
                    "data": [
                    {
                        "reimbersment_Id_ID": "Successs...!",
                        "ID": ""
                    }
                    ]
                }; 
            }).catch(async err => {
                console.log("*******************oReqData Error*****************");    
                const odata = await onUpdateDependingSetData(req, res, oReqData, false, false);  
                return {
                    "data": [
                    {
                        "reimbersment_Id_ID": "oReimbersment trigger error...!",
                        "ID": ""
                    }
                    ]
                };
            }); 
        } else {
            const odata = await onUpdateDependingSetData(req, res, oReqData, false, false);
            return {
                "data": [
                  {
                    "reimbersment_Id_ID": "oEmployee & oReimbersment data error...!",
                    "ID": ""
                  }
                ]
              };
        }
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
}

/**
 * Invoke the Data api from CAP app
 * @method POST
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function onUpdateDependingSetData(req, res, oReqData, oWfObj, bFlage) {
    const { reimbersment_Id_ID, ID } = oReqData;
    let srv = await cds.connect.to('emp_reimbersment');    
    try {
        if (bFlage) {
            let newReimbursement = {
                wf_instance_id: oWfObj.data.id
            }
            const odata = await srv.run(UPDATE(Reimbersment).set(newReimbursement).where({ ID: ID }));
            console.log("Level16 : ..........!"  + odata);
            return {
                "data": [
                  {
                    "reimbersment_Id_ID": "Done: Success...!" + oWfObj.data.id + "}",
                    "ID": ""                 
                 }
                ]
              };
        } else {
            const odata =  await srv.run(DELETE(Reimbersment).where({ ID: ID }));
            console.log("Level17 : ..........!"  + odata);
            return {
                "data": [
                  {
                    "reimbersment_Id_ID": "Done: deleted...!}",
                    "ID": ""                  
                }
                ]
            };
        }          
    } catch (error) {        
        // await sSrv.rollback(error);
        console.log("Level18 : Data Error..........!" );
        return  error;
    }
}