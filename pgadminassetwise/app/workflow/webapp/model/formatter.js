sap.ui.define([], function() {
    "use strict";
    return {
        formatDate: function(sDateTime){
            var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                UTC: true
            });
            if(sDateTime){
                if(sDateTime.indexOf(',') === -1){
                    return oDateFormat.format(new Date(sDateTime));
                } else {
                    return sDateTime;
                }
            }
            return null;
        },
        setCurrentStatus: function(sKey, sManagerApprovalStatus, sAssigneeAcceptStatus, sCurrentStatus){
            if(sKey === "toBeReviewed"){
                return 'Awaiting for your approval';
            } else if(sKey === 'myReq' && (sManagerApprovalStatus === 'RJCT' || sAssigneeAcceptStatus === 'RJCT')){
                return 'Need to take an action';
            }
            return sCurrentStatus;
        },
        setOverallStatus: function(sInput, sOverallStatus){
            var sState, sText;
            switch(sOverallStatus) {
                case "CLS":
                    sState = 'Success';
                    sText = "Closed";
                    break;
                case "WIP":
                    sState = 'Warning';
                    sText = "Pending";
                    break;
                default:
                    sState = 'Error';
                    sText = "Open";
            }
            if(sInput === 'text'){
                return sText;
            } else if(sInput === 'state'){
                return sState;
            }
        },
        highlightLineItemStatus: function(managerApprovalStatus, assigneeAcceptStatus){
            var sHighlight = 'None';
            if(managerApprovalStatus === 'RJCT' || assigneeAcceptStatus === 'RJCT'){
                sHighlight = 'Error';
            }
            return sHighlight;
        },
        editLineItems: function(oRequest){
            var bFlag = false;
            if(oRequest.overallStatus === 'CLS'){
                bFlag = false;
            } else {
                if(!oRequest.ID || oRequest.ResubmitReqbyRequester || (oRequest.LoggedInUserRole === 'Assignee' && !oRequest.assigneeAcceptStatus)){
                    bFlag = true;
                }
            }
            return bFlag;
        },
        showSection: function(sReqType, oRequest){
            var bVisible = false;
            if(sReqType === oRequest.reqType && (oRequest.UpdateReqbyRequester || oRequest.LoggedInUserRole === 'Assignee' || oRequest.overallStatus === 'CLS')){
                bVisible = true;
            }
            return bVisible;
        },
        updateSrvReqRelatedStatuses: function(oRequest){
            var bFlag = false;
            if(oRequest.overallStatus === 'CLS'){
                bFlag = false;
            } else {
                if(oRequest.UpdateReqbyRequester || oRequest.LoggedInUserRole === 'Assignee'){
                    bFlag = true;
                }
            }
            return bFlag;
        },
        handleSubmitBtn: function(sInput, oRequest){
            var sText = 'Submit';
            var bVisible = false;
            if(oRequest.overallStatus === 'CLS'){
                bVisible = false;
            } else {
                if(!oRequest.ID || oRequest.ResubmitReqbyRequester || oRequest.UpdateReqbyRequester || (oRequest.LoggedInUserRole === 'Assignee' && oRequest.assigneeAcceptStatus === 'APRV')){
                    bVisible = true;
                }
                if(oRequest.ID){
                    sText = 'Update';
                }
            }
            if(sInput === 'text'){
                return sText;
            } else if(sInput === 'visible'){
                return bVisible;
            }
        }
    };
});