const cds = require('@sap/cds');

const { Readable, PassThrough } = require('stream');

const { AssetMaster, MaterialType, AssetHistory, APRequest} = cds.entities

var newAssetId;
var newAsset;

const inputValidation = async(req) => {
  // Check if Field2 is less than Field1
  if(req.data.assetNetValue && req.data.procuredCost){
  if ( req.data.assetNetValue > req.data.procuredCost) {
    req.error('Net Value must be less than or equal to Procured Cost');
  }
}
if(req.data.assetScrappedValue && req.data.assetNetValue){
  if (req.data.assetScrappedValue > req.data.assetNetValue) {
    req.error('Scrapped Value must be less than or equal to Net Value');
  }
}
}

// const barCodeCheck = async (req) => {
//   // const barCode = req.data.barcodeNo;
//   if(req.data.barcodeNo){
//   const statusA = await SELECT `barcodeNo,ID` .from (AssetMaster).where ({barcodeNo:req.data.barcodeNo})
//   // const {status} = await SELECT `from ${AssetMaster} { barcodeNo as barcode }` .where ({'barcodeNo' : req.data.barcodeNo})
//   if(statusA.length>0){
//     const cusId = statusA[0].ID;
//     if(cusId!=req.data.ID){
//       req.error('This Barcode Number exists already, please enter a different number');
//     }
//   }
//   }
// }

const serialNumCheck = async (req) => { 
  if(req.data.serialNo){
  const statusB = await SELECT `serialNo,matType,ID` .from (AssetMaster).where ({serialNo:req.data.serialNo}) .and ({matType:req.data.matType})
  if(statusB.length>0){
    const cusId = statusB[0].ID;
    if(cusId!=req.data.ID){
      req.error('This Serial Number exists already, please enter a different number');
    }
  }
  }
}

const createHistory = async(req) => {
  var getOldAsset = JSON.parse(JSON.stringify(req.data));
  delete getOldAsset.profilePicContent;
  delete getOldAsset.ImageUrl;
  const getHistory = await SELECT.from(AssetHistory).where({ID:req.data.ID}).orderBy({ref:['version'],sort:'desc'}).limit(1);
  if(getHistory[0]){
    getOldAsset.version = parseInt(getHistory[0].version) + 1;
  }
  else{
    getOldAsset.version = 0;
  }
  getOldAsset.version = getOldAsset.version.toString();
  const pushOldAsset = await INSERT.into(AssetHistory,getOldAsset);
}

const createInitialVersion = async(req) => {
  if(req.data.records){
    var records = structuredClone(req.data.records);
    // for(let i = 0;i < records.length;i++){
    //   await INSERT.into(AssetHistory,records[i]);
    // }
      await INSERT.into(AssetHistory,records);
  }else{
    var oRemoveContent = JSON.parse(JSON.stringify(req.data));
    delete oRemoveContent.profilePicContent;
    delete oRemoveContent.ImageUrl;
    // for(var key in req.data){
    //   if(key !== 'profilePicContent' && key !== 'ImageUrl'){
    //     oRemoveContent[key] = req.data[key]; 
    //   }
    // }
    oRemoveContent.version = '0';
    const createVersion = await INSERT.into(AssetHistory,oRemoveContent);
  }
}

const assetIDFactoryFunc = (req) => {
  newAsset = true;
  var resTimeStamp = new Date().toISOString();
  resCurrDate = resTimeStamp.slice(0,10).split("-").join("");
  resCurrTime = resTimeStamp.slice(11,16).split(":").join("");
  var barcode = req.barcodeNo;
  newBarcode = barcode.length < 12 ? '0'.repeat(12 - barcode.length) + barcode : barcode;
  var newID = resCurrDate + '-' + resCurrTime + '-' + '0000' + '-' + '0000' + '-' + newBarcode;
  return newID;
}

const createCustomID = async (req) => {
    //ID Creation
    try{
      if(req.data.records){
        var records = req.data.records
        for(let i = 0;i < records.length;i++){
          var newID = assetIDFactoryFunc(records[i]);
          req.data.records[i].ID = newID;
        }
      }else{
        var newID = assetIDFactoryFunc(req.data);
        req.data.ID = newID;
        newAssetId = newID;
      }
      }catch(err){
        req.error(err);
      }
}

const assetIdCheck = async (req, res, next) => {
  const imgBuffer = Buffer.from(req.data.content, 'base64');
  var oPassThrough = new PassThrough();
  oPassThrough.push(imgBuffer);
  oPassThrough.push(null);
  req.data.content = oPassThrough;
  if(newAsset){
    req.data.asset_ID = newAssetId;
  }
  newAsset = false;
}

const assetImgUpl = async (req) => {
  if (req.data.profilePicContent && req.data.profilePicUpdated) {
    // req.data.profilePicContent = JSON.parse(JSON.stringify(req.data.profilePicContent))
    const path = req.path.split(".")[1];
    const entityUrl = req._.req.originalUrl.replace("$batch", path);
    const image_path = entityUrl + `(ID=${req.data.ID},IsActiveEntity=true)` + '/profilePicContent' + `?${Date.now()}`;
    var imageBuffer = req.data.profilePicContent;
    var decoder = new TextDecoder("utf-8");
    const chunks = [];
    imageBuffer.on('data', chunk => {
      chunks.push(chunk);
    });
      imageBuffer.on('end', async() => {
        var result = Buffer.concat(chunks.map(chunk => Buffer.from(chunk, 'base64')));
        var decoded = decoder.decode(result);
        const imgBuffer = Buffer.from(decoded, 'base64');
        var oPassThrough = new PassThrough();
        oPassThrough.push(imgBuffer);
        oPassThrough.push(null);
        req.data.profilePicUpdated = false;
        req.data.profilePicContent = oPassThrough;
        req.data.ImageUrl = image_path;
      });
  }
}

const createCustomRequestID = async (req) => {
  //Reuest ID Creation
  var sStartNo = 6600660001;
  var sEndNo = 6600669999;
  var aIDs;
  const aCreatedReqIDs = await SELECT `ID`.from(APRequest);
  if(aCreatedReqIDs.length === 0){
    req.data.ID = sStartNo.toString();
  } else {
    aIDs = aCreatedReqIDs.map(function(el){
      return parseInt(el.ID);
    });
    var iMaxVal = aIDs.reduce((a, b) => Math.max(a, b), -Infinity);
    req.data.ID = (iMaxVal+1).toString();
  }
  if(req.data.currentApproverID === req.data.assigneeID){
    req.data.numOfLevels = 1;
  }
  //update statuses for a new req
  req.data.overallStatus = 'OPN';
  req.data.currentStatus = "Awaiting for manager approval";
}

async function getAPRequestbyEmailID(req){
  const { emailID } = req.data;
  let srv = await cds.connect.to('assetwise'),
      // sSrv = srv.tx(), 
      aRequesterData,aApproverData, aManagerReviewedData, aAssigneeReviewedData,
      aResult= [];
  
  if(emailID){
      try {
        aRequesterData = await SELECT.from(APRequest).where({requesterID:emailID});
        aApproverData = await SELECT.from(APRequest).where({currentApproverID:emailID});
        aManagerReviewedData = await SELECT.from(APRequest).where({managerID:emailID});
        aAssigneeReviewedData = await SELECT.from(APRequest).where({assigneeID:emailID});
        // await sSrv.commit(); 
        try {
            if(aRequesterData && aRequesterData.length > 0) { 
                aRequesterData.forEach(function(data){
                  data['IsRequester'] = true;
                  data['IsApprover'] = false;
                  data['IsReviewed'] = false;
                });
            }
            if(aApproverData && aApproverData.length > 0) { 
                aApproverData.forEach(function(data){
                  data['IsRequester'] = false;
                  data['IsApprover'] = true;
                  data['IsReviewed'] = false;
                });
            }
            if(aManagerReviewedData && aManagerReviewedData.length > 0) {
              aManagerReviewedData = aManagerReviewedData.filter(function(el){
                return el.managerApprovalStatus === 'APRV' || el.managerApprovalStatus === 'RJCT';
              });
              aManagerReviewedData.forEach(function(data){
                data['IsRequester'] = false;
                data['IsApprover'] = false;
                data['IsReviewed'] = true;
              });
            }
            if(aAssigneeReviewedData && aAssigneeReviewedData.length > 0) {
              aAssigneeReviewedData = aAssigneeReviewedData.filter(function(el){
                return el.assigneeAcceptStatus === 'APRV' || el.assigneeAcceptStatus === 'RJCT';
              });
              aAssigneeReviewedData.forEach(function(data){
                data['IsRequester'] = false;
                data['IsApprover'] = false;
                data['IsReviewed'] = true;
              });
            }
            return aResult.concat(aRequesterData,aApproverData, aManagerReviewedData, aAssigneeReviewedData);
        } catch (error) {
            return aResult;
        }                
      } catch (error) {
          // await sSrv.rollback(error);
      }
     
  } else {
      req.error("Function call error..!  Could you please check passing param?");
  }
}

const handleApprovalProcess = async (req) => {
  var aData = await SELECT.from(APRequest).where({ID:req.data.ID});
  var oCurrentObj;
  if(req.data && aData.length > 0){
    oCurrentObj = structuredClone(req.data);
    oCurrentObj = Object.assign({}, aData[0], oCurrentObj);
    if(oCurrentObj.numOfLevels === 1){
      req.data.currentApproverID = oCurrentObj.assigneeAcceptStatus === 'RJCT' || oCurrentObj.assigneeAcceptStatus === 'APRV' ? null : oCurrentObj.currentApproverID;
      req.data.currentApproverName = oCurrentObj.assigneeAcceptStatus === 'RJCT' || oCurrentObj.assigneeAcceptStatus === 'APRV' ? null : oCurrentObj.currentApproverName;
      if(oCurrentObj.assigneeAcceptStatus === 'APRV'){
        if(oCurrentObj.reqType === "APR" && oCurrentObj.handOverStatus === "CLS"){
          req.data.overallStatus = 'CLS';
        } else if(oCurrentObj.reqType === "ATR" && oCurrentObj.transferStatus === "CLS"){
          req.data.overallStatus = 'CLS';
        } else if(oCurrentObj.reqType === "ARR" && oCurrentObj.returnStatus === "CLS"){
          req.data.overallStatus = 'CLS';
        } else if(oCurrentObj.reqType === "ASR" && oCurrentObj.seriviceStatus === "CLS"){
          req.data.overallStatus = 'CLS';
        }
      }
    } else {
      if(req.data.managerApprovalStatus === 'APRV'){
        req.data.currentApproverID = oCurrentObj.assigneeID;
        req.data.currentApproverName = oCurrentObj.assigneeName;
        req.data.currentStatus = "Awaiting for assignee approval";
      }
      if(req.data.requesterID && (oCurrentObj.managerApprovalStatus === 'RJCT' || oCurrentObj.assigneeAcceptStatus === 'RJCT')){
        req.data.managerApprovalStatus = null;
        req.data.assigneeAcceptStatus = null;
        req.data.currentApproverID = req.data.managerID;
        req.data.currentApproverName = req.data.managerName;
        req.data.currentStatus = "Awaiting for manager approval";
      }
      if(oCurrentObj.managerApprovalStatus || oCurrentObj.assigneeAcceptStatus){
        req.data.overallStatus = 'WIP';
      }
      if(req.data.managerApprovalStatus === 'RJCT' || req.data.assigneeAcceptStatus === 'RJCT'){
        if(req.data.managerApprovalStatus === 'RJCT'){
          req.data.currentStatus = "Sent back to requester";
        } else if(req.data.assigneeAcceptStatus === 'RJCT'){
          req.data.currentStatus = "Sent back to requester";
        }
        req.data.currentApproverID = null;
        req.data.currentApproverName = null;
      }
      if(oCurrentObj.managerApprovalStatus === 'APRV' && oCurrentObj.assigneeAcceptStatus === 'APRV'){
          if(oCurrentObj.reqType === "APR"){
            if(oCurrentObj.handOverStatus === "CLS"){
              req.data.overallStatus = 'CLS';
            }
            req.data.currentStatus = req.data.overallStatus !== "CLS" ? "Awaiting for handover completion" : "Handover has been completed";
          } else if(oCurrentObj.reqType === "ATR"){
            if(oCurrentObj.transferStatus === "CLS"){
              req.data.overallStatus = 'CLS';
            }
            req.data.currentStatus = req.data.overallStatus !== "CLS" ? "Awaiting for transfer completion" : "Transfer has been completed";
          } else if(oCurrentObj.reqType === "ARR"){
            if(oCurrentObj.returnStatus === "CLS"){
              req.data.overallStatus = 'CLS';
            }
            req.data.currentStatus = req.data.overallStatus !== "CLS" ? "Awaiting for return completion" : "Return has been completed";
          } else if(oCurrentObj.reqType === "ASR"){
            if(oCurrentObj.seriviceStatus === "CLS"){
              req.data.overallStatus = 'CLS';
            }
            req.data.currentStatus = req.data.overallStatus !== "CLS" ? "Awaiting for service completion" : "Service has been completed";
          }
        req.data.currentApproverID = null;
        req.data.currentApproverName = null;
      }

    }
  }
  else{
    req.error("Some error");
  }
}

const getMassUpload = async(req,next) =>{
  var records = req.data.records
  for(let i = 0;i<records.length;i++){
    var recordExists= await SELECT.from(AssetMaster).where({ID:records[i].ID});
    if(recordExists.length !== 0){
      await UPDATE(AssetMaster).where({ID:records[i].ID}).set(records[i]);
      const getHistory = await SELECT.from(AssetHistory).where({ID:records[i].ID}).orderBy({ref:['version'],sort:'desc'}).limit(1);
      records[i].version = getHistory[0].version + 1
    }
    else{
      if(records[i].ID !== undefined){
        return req.error(`${records[i].ID} ID does not exist!!`)
      }else{
        records[i].ID = assetIDFactoryFunc(records[i])
      }
        await INSERT.into(AssetMaster,records[i]);
    }
    await INSERT.into(AssetHistory,records[i]);
  }
}

const catchError = async(err,req) => {
  err.message = 'Oh no! ' + err.message
}

module.exports = function (srv) {
    // srv.before('postMultipleData', createCustomID);
    // srv.before('postMultipleData', createInitialVersion);
    srv.before("POST", "AssetMaster", createCustomID);
    srv.before("PUT", "AssetMaster", assetImgUpl);
    srv.before("POST", "AssetMaster", assetImgUpl);
    srv.on('postMultipleData',getMassUpload);
    srv.before("POST","AssetMaster",createInitialVersion);
    srv.before("POST", "AssetMaster", inputValidation);
    // srv.before("CREATE", "AssetMaster", barCodeCheck);
    srv.before("CREATE", "AssetMaster", serialNumCheck);
    srv.before("UPDATE","AssetMaster",createHistory);
    srv.before("UPDATE", "AssetMaster", inputValidation);
    // srv.before("SAVE", "AssetMaster", barCodeCheck);
    srv.before("SAVE","AssetMaster", serialNumCheck);
    srv.before("POST", "Attachments", assetIdCheck);
    srv.before("POST", "APRequests", createCustomRequestID);
    srv.before("UPDATE", "APRequests", handleApprovalProcess);
    // srv.on('error', catchError)
    srv.on('ReadAPRequests', getAPRequestbyEmailID);
    srv.on('userInfo', req => {
      const user = {
          id : req.user.id,
          tenant : req.user.tenant,
          _roles: req.user._roles,
          attr : req.user.attr
      }

      return user;
  });
};
