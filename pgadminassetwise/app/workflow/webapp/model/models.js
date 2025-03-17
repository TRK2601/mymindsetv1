sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], 
    /**
     * provide app-view type models (as in the first "V" in MVVC)
     * 
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.ui.Device} Device
     * 
     * @returns {Function} createDeviceModel() for providing runtime info for the device the UI5 app is running on
     */
    function (JSONModel, Device) {
        "use strict";

        return {
            createDeviceModel: function () {
                var oModel = new JSONModel(Device);
                oModel.setDefaultBindingMode("OneWay");
                return oModel;
            },
            createRequestModel:function(){
                var oModel = new JSONModel({
                    reqTypeFilterVal:"",
                    reqNameFilterValue:"",
                    pagemode : "create",
                    request:{
                        reqType:"APR",
                        assigneeName:"",
                        managerApprovalStatus:"",
                        assigneeAcceptStatus:"",
                        handOverStatus:"",
                        overallStatus:"",
                        comment:"",
                        lineitems:[],
                        handOverDate:null,
                        recieptAckmnt:"",
                        handOverLoc:"",
                        handoverComments:"",
                        currentApproverID:"",
                        currentApproverName:"",
                        assigneeID:"",
                        assigneeTeam:"",
                        returnStatus:"",
                        transferStatus:"",
                        seriviceStatus:"",
                        returnDate:null,
                        returnLoc:"",
                        transferDate:null

                    }
                });
                oModel.setDefaultBindingMode("TwoWay");
                return oModel;
            }

    };
});