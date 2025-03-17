sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/m/MessageToast",
    "sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/Text",
	"sap/m/TextArea",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, formatter, Fragment, Filter, MessageToast, Dialog, Button, Label, mobileLibrary, Text, TextArea, MessageBox) {
        "use strict";
        var oController, oGlobalModel, sViewBindingCtxPath, sServiceURL;
        // shortcut for sap.m.ButtonType
	    var ButtonType = mobileLibrary.ButtonType;
        // shortcut for sap.m.DialogType
	    var DialogType = mobileLibrary.DialogType;
        return Controller.extend("com.mindset.ui.assetwise.workflow.controller.Detail", {
            formatter: formatter,
            onInit: function () {
                oController = this;
                var oOwnerComponent = this.getOwnerComponent();
                sServiceURL = oOwnerComponent.getModel().getServiceUrl();
                oGlobalModel = oOwnerComponent.getModel("GlobalModel");
                this.getView().setBindingContext(oGlobalModel.createBindingContext('/request'), "GlobalModel");
                sViewBindingCtxPath = this.getView().getBindingContext('GlobalModel').getPath();
                this._oBundle = oOwnerComponent.getModel('i18n').getResourceBundle();
                this.oRouter = oOwnerComponent.getRouter();
                this.oRouter.getRoute("detailPage").attachPatternMatched(this._onPatternMatch, this);
                oGlobalModel.setProperty("/lineItemFieldEnabled", true);
            },
            _onPatternMatch:function(oEvent){
                var aMainTableData = oGlobalModel.getProperty("/ReadAPRequestsSet");
                var sID = oEvent.getParameters().arguments.id;
                var oSelObj;
                oGlobalModel.setProperty("/pagemode","detail");
                this.handleRequestTypeChange();
                this.getView().setBusy(true);
                if(sID){
                    jQuery.ajax({
                        url: "/odata/v4/assetwise/APRequests/"+sID +"?$expand=lineitems,comments",
                        async: false,
                        dataType: "json",
                        contentType: "application/json",
                        type: "GET",                    
                        success: function (data, o, i) {
                            this.getView().setBusy(false);
                            oSelObj = aMainTableData.find(function(el){
                                return el.ID === sID;
                            });
                            if(data && oSelObj){
                                data['IsApprover'] = oSelObj.IsApprover;
                                data['IsRequester'] = oSelObj.IsRequester;
                                data['IsEditableForRequester'] = false;
                                data['ResubmitReqbyRequester'] = false;
                                data['UpdateReqbyRequester'] = false;
                                if(data.IsRequester){
                                    if(data.managerApprovalStatus === 'RJCT' || data.assigneeAcceptStatus === 'RJCT'){
                                        data['ResubmitReqbyRequester'] = true;
                                    }
                                    if(data.managerApprovalStatus === 'APRV' && data.assigneeAcceptStatus === 'APRV'){
                                        data['UpdateReqbyRequester'] = true;
                                    }
                                }
                                if(oGlobalModel.getProperty("/LoggedInUserID").toLowerCase().trim() === data['assigneeID'].toLowerCase().trim()){
                                    data['LoggedInUserRole'] = "Assignee";
                                } else if(oGlobalModel.getProperty("/LoggedInUserID").toLowerCase().trim() === data['managerID'].toLowerCase().trim()){
                                    data['LoggedInUserRole'] = "Manager";
                                } else if(oGlobalModel.getProperty("/LoggedInUserID").toLowerCase().trim() === data['requesterID'].toLowerCase().trim()){
                                    data['LoggedInUserRole'] = "Requester";
                                }
                                oGlobalModel.setProperty("/request", jQuery.extend(true,{},data));
                            }
                        }.bind(this),
                        error: function (e, t, o) {
                            this.getView().setBusy(false);
                            MessageToast.show("Sorry, an error has occurred. Please reload application");
                        }.bind(this)
                    });
                }

            },
            onAddLineItemsPress:function(){
                var oModel = this.getOwnerComponent().getModel("GlobalModel");
                var aLineItems = oModel.getProperty(sViewBindingCtxPath+"/lineitems");
                var Obj = {
                        assetID:"",
                        assetName:"",
                        assetDesc1:"",
                        assetDesc2:"",
                        assetDesc3:"",
                        quantity:"",
                        baseLocation:"",
                        functionalLocation: "",
                        barcode : "",
                        serialNo : "",
                        expectedDate : null,
                        comment : ""                        
                };
                aLineItems.push(Obj);    
                oModel.setProperty(sViewBindingCtxPath+"/lineitems", jQuery.extend(true,[],aLineItems));
            },
            onRowDeletepress:function(oEvent){
                var oSrc = oEvent.getSource();
                var sPath = oSrc.getBindingContext("GlobalModel").getPath();
                var sSelectedIdx = sPath.split("/")[2];
                var oModel = this.getView().getModel("GlobalModel");
                var aLineItems = oModel.getProperty(sViewBindingCtxPath+"/lineitems");
                aLineItems.splice(sSelectedIdx, 1);
                oModel.setProperty(sViewBindingCtxPath+"/lineitems", jQuery.extend(true,[],aLineItems));
            },
            onPressApprove: function(){
                this._showCommentDlg(oGlobalModel.getProperty(sViewBindingCtxPath+"/LoggedInUserRole"), 'A');
            },
            onPressReject: function(){
                this._showCommentDlg(oGlobalModel.getProperty(sViewBindingCtxPath+"/LoggedInUserRole"), 'R');
            },
            onPressSubmit: function(){
                var oViewBindingObj = oGlobalModel.getProperty(sViewBindingCtxPath);
                this._showCommentDlg(oGlobalModel.getProperty(sViewBindingCtxPath+"/LoggedInUserRole"), oViewBindingObj.ID ? 'U' : 'S');
            },
            _showCommentDlg: function(sRole, sAction){
                var oModel = this.getView().getModel("GlobalModel");
                var aComments = $.extend(true, [], oModel.getProperty(sViewBindingCtxPath+"/comments"));
                var bIsApprover = oModel.getProperty(sViewBindingCtxPath+"/IsApprover");
                var sLoggedInUserRole = oGlobalModel.getProperty(sViewBindingCtxPath+"/LoggedInUserRole");
                var bIsRequester = oModel.getProperty(sViewBindingCtxPath+"/IsRequester");
                oModel.setProperty(sViewBindingCtxPath+'/comment', '');
                this.oCmtDialog = new Dialog({
                    type: DialogType.Message,
                    title: "Confirm",
                    content: [
                        new Label({
                            text: "Do you want to submit this request?",
                            labelFor: "submissionNote",
                            visible: bIsApprover ? false : true
                        }),
                        new TextArea("submissionNote", {
                            value: "{GlobalModel>comment}",
                            width: "100%",
                            placeholder: bIsApprover ? this._oBundle.getText('addNoteReq') : this._oBundle.getText('addNoteOpt'),
                            liveChange: function (oEvent) {
                                var sText = oEvent.getParameter("value");
                                if(sAction === 'R'){
                                    this.oCmtDialog.getButtons()[0].setEnabled(sText.length > 0);
                                }
                            }.bind(this),
                            change: function(oEvent){
                                var sText = oEvent.getParameter("value");
                                aComments.push({
                                    name: oGlobalModel.getProperty("/LoggedInUserName") ? oGlobalModel.getProperty("/LoggedInUserName") : oGlobalModel.getProperty("/LoggedInUserID").split('@')[0],
                                    email: oGlobalModel.getProperty("/LoggedInUserID"),
                                    action: sAction,
                                    role: sLoggedInUserRole ? sLoggedInUserRole : 'Requester',
                                    comment: sText,
                                });
                                oModel.setProperty(sViewBindingCtxPath+"/comments", $.extend(true, [],aComments));
                            }.bind(this)
                        })
                    ],
                    buttons: [
                        new Button({
                            type: sAction === 'A' ? ButtonType.Accept : sAction === 'R' ? ButtonType.Reject : ButtonType.Emphasized,
                            text: sAction === 'A' ? "Approve" : sAction === 'R' ? "Reject" : sAction === 'U' ? "Update" : "Submit",
                            enabled: sAction === 'R' ? false : true,
                            press: function () {
                                this.oCmtDialog.close();
                                this.oCmtDialog.destroy();
                                this._processRequest(sRole, sAction);
                            }.bind(this)
                        }),
                        new Button({
                            text: "Cancel",
                            press: function () {
                                this.oCmtDialog.close();
                                this.oCmtDialog.destroy();
                            }.bind(this)
                        })
                    ]
                });
                this.getView().addDependent(this.oCmtDialog);
                this.oCmtDialog.open();
            },
            onDateChange: function(oEvent){
                var oSrc = oEvent.getSource();
                var sProp = oSrc.data('property');
                oGlobalModel.setProperty(sViewBindingCtxPath+"/"+sProp, oSrc.getValue());
            },
            _processRequest:function(sRole, sAction){
                var callType, sEntityPath, pageMode = oGlobalModel.getProperty("/pagemode");
                var oViewBindingObj = oGlobalModel.getProperty(sViewBindingCtxPath);
                var sCurrApproveId, sCurrentApproverName, oPostPayload = {}; 
                var sReqType = oViewBindingObj.reqType;
                var sMsg;
                if(sAction === 'S' || sAction === 'U'){
                    callType = oViewBindingObj.ID ? "PATCH" :"POST";
                    sEntityPath = oViewBindingObj.ID ? "/APRequests/" + oViewBindingObj.ID : "/APRequests";
                    sCurrApproveId = oViewBindingObj.ID ? oViewBindingObj.currentApproverID : oGlobalModel.getProperty("/LoginEmployeeData")[0].managerEmail;
                    sCurrentApproverName = oViewBindingObj.ID ? oViewBindingObj.currentApproverName : oGlobalModel.getProperty("/LoginEmployeeData")[0].managerName;
                    oPostPayload = {
                        "reqType"               : sReqType,
                        "requesterID"           : oGlobalModel.getProperty("/LoggedInUserID"),
                        "requesterName"         : oGlobalModel.getProperty("/LoggedInUserName"),
                        "currentApproverID"     : sCurrApproveId,
                        "currentApproverName"   : sCurrentApproverName,
                        "managerID"             : oGlobalModel.getProperty("/LoginEmployeeData")[0].managerEmail,
                        "managerName"           : oGlobalModel.getProperty("/LoginEmployeeData")[0].managerName,
                        "assigneeID"            : oViewBindingObj.assigneeID,
                        "assigneeName"          : oViewBindingObj.assigneeName,
                        "lineitems"             : oViewBindingObj.lineitems,
                        "assigneeTeam"          : oViewBindingObj.assigneeTeam,
                        "comments"              : oViewBindingObj.comments                  
                    };
                    if(oViewBindingObj.UpdateReqbyRequester || (oViewBindingObj.LoggedInUserRole === 'Assignee' && oViewBindingObj.assigneeAcceptStatus === 'APRV')){
                        oPostPayload = this._postRequestWiseStatues(sReqType, {}, oViewBindingObj);
                        oPostPayload["comments"] = oViewBindingObj.comments;
                    }
                } else {
                    callType = "PATCH";
                    sEntityPath = "/APRequests/" + oViewBindingObj.ID;
                    if(sRole === "Manager"){
                        oPostPayload = {                                                                                     
                            "managerApprovalStatus" : sAction === 'A' ? 'APRV' : 'RJCT',
                            "comments"              : oViewBindingObj.comments
                        }; 

                    }else if(oViewBindingObj.LoggedInUserRole === "Assignee"){
                        oPostPayload = {                                                      
                            "lineitems"             : oViewBindingObj.lineitems,      
                            "assigneeAcceptStatus"  : sAction === 'A' ? 'APRV' : 'RJCT',
                            "comments"              : oViewBindingObj.comments               
                        };
                        oPostPayload = this._postRequestWiseStatues(sReqType, oPostPayload, oViewBindingObj);
                    }    
                }
                      
                jQuery.ajax({
                    url: sServiceURL+sEntityPath,
                    async: false,
                    dataType: "json",
                    contentType: "application/json",
                    type: callType,
                    data: JSON.stringify(oPostPayload),
                    success: function (data, o, i) {
                        if(sAction === 'S'){
                            sMsg = "Request has been submitted. Your manager will be notified to take an action";
                        } else if (sAction === 'U'){
                            if(oViewBindingObj.ResubmitReqbyRequester){
                                sMsg = "Request has been updated. Your manager will be notified to take an action";
                            } else if (oViewBindingObj.UpdateReqbyRequester || (oViewBindingObj.LoggedInUserRole === 'Assignee' && oViewBindingObj.assigneeAcceptStatus === 'APRV')){
                                sMsg = "Request has been updated";
                            }
                        } else if (sAction === 'A'){
                            sMsg = oViewBindingObj.LoggedInUserRole === "Assignee" ? "Request has been confirmed" : "Request has been approved";
                        } else if (sAction === 'R'){
                            sMsg = "Request has been rejected";
                            MessageBox.information(sMsg, {
                                onClose: function () {
                                    const oRouter = oController.getOwnerComponent().getRouter();
                                    oRouter.navTo("RouteMain");  
                                }.bind(this)
                            });
                            return;
                        }
                        MessageBox.success(sMsg, {
                            onClose: function () {
                                const oRouter = oController.getOwnerComponent().getRouter();
			                    oRouter.navTo("RouteMain");  
                            }.bind(this)
                        });
                                              
                    }.bind(this),
                    error: function (e, t, o) {
                        MessageBox.error("Sorry, an error has occurred");
                    }
                });                
            },
            _postRequestWiseStatues: function(sReqType, oPostPayload, oViewBindingObj){
                var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                    pattern: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
                });
                if(sReqType === "AAR"){
                    oPostPayload["handOverDate"] = oViewBindingObj.handOverDate ? oDateFormat.format(new Date(oViewBindingObj.handOverDate)) : null;
                    oPostPayload["handOverLoc"]  = oViewBindingObj.handOverLoc;
                    oPostPayload["handOverStatus"] = oViewBindingObj.handOverStatus;
                }else if(sReqType === "ARR"){
                    oPostPayload["returnDate"] = oViewBindingObj.returnDate ? oDateFormat.format(new Date(oViewBindingObj.returnDate)) : null;
                    oPostPayload["returnLoc"]  = oViewBindingObj.returnLoc;
                    oPostPayload["returnStatus"] = oViewBindingObj.returnStatus;
                }else if(sReqType === "ATR"){
                    oPostPayload["transferDate"] = oViewBindingObj.transferDate ? oDateFormat.format(new Date(oViewBindingObj.transferDate)) : null;
                    oPostPayload["transferBaseLoc"]  = oViewBindingObj.transferBaseLoc;
                    oPostPayload["transferFuncLoc"] = oViewBindingObj.transferFuncLoc;
                    oPostPayload["transferStatus"] = oViewBindingObj.transferStatus;
                }else if(sReqType === "ASR"){
                    oPostPayload["serviceDate"] = oViewBindingObj.serviceDate ? oDateFormat.format(new Date(oViewBindingObj.serviceDate)) : null;
                    oPostPayload["serviceBaseLoc"]  = oViewBindingObj.serviceBaseLoc;
                    oPostPayload["serviceFuncLoc"] = oViewBindingObj.serviceFuncLoc;
                    oPostPayload["seriviceStatus"] = oViewBindingObj.seriviceStatus;
                }
                return oPostPayload;
            },
            onAssignToVHelpReqPress:function(oEvent){
                var sInputValue = oEvent.getSource().getValue(),
				oView = this.getView();
                if (!this._pValueHelpDialog) {
                    this._pValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "com.mindset.ui.assetwise.workflow.fragments.Dialogs.AssignToValueHelp",
                        controller: this
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }
                this._pValueHelpDialog.then(function (oDialog) {
                    oDialog.open();
                });
            },
            handleValueHelpClose: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                var oBindingCtx = oSelectedItem.getBindingContext();
                var oBindingObj = oBindingCtx.getObject();
                var oModel = oController.getOwnerComponent().getModel("GlobalModel");
                oModel.setProperty(sViewBindingCtxPath + "/assigneeID", oBindingObj.email);
                oModel.setProperty(sViewBindingCtxPath + "/assigneeName", oBindingObj.name);
                oModel.setProperty(sViewBindingCtxPath + "/assigneeTeam", oBindingObj.team);
                                     
            },
            handleSearch: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter("name", FilterOperator.Contains, sValue);
                var oBinding = oEvent.getSource().getBinding("items");
                oBinding.filter([oFilter]);
            },
            onBaseLocValueHelpRequest:function(oEvent){
                var oSrc = oEvent.getSource(),
                oBindingCtx = oSrc.getBindingContext("GlobalModel"),
                sBindingPath = oBindingCtx.getPath(), titleProp,
                oBindingObj = oBindingCtx.getObject(),
                sDependentProp = oSrc.data("localDependDataProp"),
                aLocalDataProp = oSrc.data("localDataProp"),
                oLocalModel = this.getView().getModel("GlobalModel"),
                sSelectedInputFld = oSrc.data("vhProp"),
                itemsObj = {}, selectedBaseLocation;
                oGlobalModel.setProperty("/bindingPath", sBindingPath);
                oGlobalModel.setProperty("/localDataProp", aLocalDataProp); 
                oGlobalModel.setProperty("/VHSelectedFieldName", sSelectedInputFld);               
                if(sSelectedInputFld === "baseLocation"){
                    oGlobalModel.setProperty("/valueHelpDlgTtl", "Base Location");
                     itemsObj.path = "GlobalModel>/BaseLocationSet";
                     itemsObj.model = oGlobalModel;
                     titleProp = "GlobalModel>code";
                }else if(sSelectedInputFld === "functionalLocation"){
                    selectedBaseLocation = oGlobalModel.getProperty(sBindingPath+"/"+sDependentProp);
                    if(!selectedBaseLocation){
                        MessageToast.show("Please select BaseLocation");
                        return;
                    }
                    var aBaseLocation = oGlobalModel.getProperty("/BaseLocationSet");
                    var aFunctionLoc =[];
                    if(aBaseLocation && aBaseLocation.length > 0){
                        aBaseLocation.forEach(function(Object, Idx){
                            if(Object.code === selectedBaseLocation){
                                aFunctionLoc = Object.assignedFunctionalLocations;
                            }
                        });
                    }
                    oGlobalModel.setProperty("/FunLocationSet", aFunctionLoc);
                    oGlobalModel.setProperty("/valueHelpDlgTtl", "Functional Location");
                    itemsObj.path = "GlobalModel>/FunLocationSet";
                    itemsObj.model = oGlobalModel;
                    titleProp = "GlobalModel>code";
                } else if(sSelectedInputFld === "barcode"){
                    oGlobalModel.setProperty("/valueHelpDlgTtl", "Barcodes");
                    itemsObj.path = "/AssetMaster";
                    itemsObj.parameters = {
                        "$select" : "*"
                    };
                    titleProp = "barcodeNo";
                }else if(sSelectedInputFld === "serialNo"){
                    oGlobalModel.setProperty("/valueHelpDlgTtl", "Serial Numbers");
                    itemsObj.path = "/AssetMaster";
                    itemsObj.parameters = {
                        "$select" : "*"
                    };
                    titleProp = "serialNo";                    
                }
                if (!this._oGenricValueHelpDialog) {
                    this._oGenricValueHelpDialog = sap.ui.xmlfragment("com.mindset.ui.assetwise.workflow.fragments.Dialogs.Valuehelp", this);
                    this.getView().addDependent(this._oGenricValueHelpDialog);
                }
                itemsObj.template = new sap.m.StandardListItem({
                    title: "{" + titleProp + "}",
                    //info: "{" + infoProp + "}",
                   // description: descProp ? "{" + descProp + "}" : "",
                    type:"Active"
                });
                this._oGenricValueHelpDialog.bindAggregation("items", itemsObj);
                this._oGenricValueHelpDialog.open();
                
            },
            onGenricValueHelpClose:function(oEvent){
                var sSelectPath = oGlobalModel.getProperty("/bindingPath");
                var sPropertyName = oGlobalModel.getProperty("/localDataProp");
                var oSelectedItem = oEvent.getParameter("selectedItem");
                var currentRequestObject = oGlobalModel.getProperty("/request");
                
                if (!oSelectedItem) {
                    return;
                }
                var oBindingCtx = oSelectedItem.getBindingContext('GlobalModel');
                var selectedProperty =  oBindingCtx.getObject().code;
                //Making  empty respective functional when change baseLocation change
                if(sPropertyName === "baseLocation"){ 
                    oGlobalModel.setProperty(sSelectPath +"/functionalLocation","");
                }else if(sPropertyName === "transferBaseLoc"){
                    oGlobalModel.setProperty(sSelectPath +"/transferFuncLoc","");
                }else if(sPropertyName === "serviceBaseLoc"){
                    oGlobalModel.setProperty(sSelectPath +"/serviceFuncLoc","");
                }
                
                if(sPropertyName === "barcode" || sPropertyName === "serialNo"){
                    oBindingCtx = oSelectedItem.getBindingContext();
                    selectedProperty = oSelectedItem.getTitle();
                    if(currentRequestObject.reqType === "ARR" || currentRequestObject.reqType === "ATR" || currentRequestObject.reqType === "ASR"){
                        oGlobalModel.setProperty(sSelectPath +"/assetID", oBindingCtx.getObject().ID);
                        oGlobalModel.setProperty(sSelectPath +"/assetName", oBindingCtx.getObject().name);
                        oGlobalModel.setProperty(sSelectPath +"/assetDesc1" ,oBindingCtx.getObject().desc1);
                        oGlobalModel.setProperty(sSelectPath +"/assetDesc2" ,oBindingCtx.getObject().desc2);
                        oGlobalModel.setProperty(sSelectPath +"/assetDesc3" ,oBindingCtx.getObject().desc3);
                    }
                }
             
                oGlobalModel.setProperty(sSelectPath +"/"+sPropertyName ,selectedProperty);
                oEvent.getSource().getBinding("items").filter([]);              
            },
            handleRequestTypeChange:function(){
                var oRequest = oGlobalModel.getProperty("/request");
                var bFlag = false;
                if(oRequest.overallStatus === 'CLS' || oRequest.reqType === "ARR" || oRequest.reqType === "ATR" || oRequest.reqType === "ASR"){
                    bFlag = false;
                }else {
                    if(!oRequest.ID || oRequest.ResubmitReqbyRequester || (oRequest.LoggedInUserRole === 'Assignee' && !oRequest.assigneeAcceptStatus)){
                        bFlag = true;
                    }
                }
                oGlobalModel.setProperty("/lineItemFieldEnabled", bFlag);
              
            },
            onGenricValueHelpSearch: function (oEvent) {
                var oSrc = oEvent.getSource(),
                    sValue = oEvent.getParameter("value"),
                    aKeyProps = oGlobalModel.getProperty("/VHKeyProperties"),
                    oSelectedVHFieldName = oGlobalModel.getProperty("/VHSelectedFieldName"),
                    aFilter=[];
                    if(sValue){
                        if (oSelectedVHFieldName === "baseLocation" || oSelectedVHFieldName === "functionalLocation") {
                            aFilter.push(new Filter("code", sap.ui.model.FilterOperator.Contains, sValue));
                        }
                        aFilter = new Filter({
                            filters: aFilter,
                            and: false
                        });
                    }                
                oSrc.getBinding("items").filter(aFilter);
            },
            onCancelPress:function(){
                const oRouter = oController.getOwnerComponent().getRouter();
                oRouter.navTo("RouteMain");  
            }
            
        });
    });
