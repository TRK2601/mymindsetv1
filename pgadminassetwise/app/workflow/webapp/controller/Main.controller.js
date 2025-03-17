sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../model/formatter",
    "sap/m/MessageToast"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, FilterOperator, formatter, MessageToast) {
        "use strict";
        var oGlobalModel, oController, oDataModel;
        return Controller.extend("com.mindset.ui.assetwisepg.workflow.controller.Main", {
            formatter: formatter,
            onInit: function () {
                  oController = this;
                  var oOwnerComponent = oController.getOwnerComponent();
                  oDataModel = oOwnerComponent.getModel();
                  oController.dataUrl = oOwnerComponent.getModel().sServiceUrl;
                  oGlobalModel = oController.getOwnerComponent().getModel("GlobalModel");                  
                  oController.oRouter = oOwnerComponent.getRouter();
                  oController.oRouter.getRoute("RouteMain").attachPatternMatched(oController._onPatternMatch, oController);
            },
            _onPatternMatch:function(){
                var sSelectedTab = oGlobalModel.getProperty("/SelectedTabKey");
                var oTable = this.getView().byId("RequestorTableId");
                var sEmailId = oGlobalModel.getProperty("/LoggedInUserID");
                var aMyReqs, aToBeRewdReqs, aRewdReqs;
                oGlobalModel.setProperty("/ReadAPRequestsSet", []);
                this.oFilterBar = this.getView().byId("filterbar");
                oGlobalModel.setProperty("/MyReqCount", 0);
                oGlobalModel.setProperty("/ToBeReviewedReqCount", 0);
                oGlobalModel.setProperty("/ReviewedReqCount", 0);
                jQuery.ajax({
                    url: oController.dataUrl + "ReadAPRequests(emailID='"+ sEmailId +"')",
                    async: false,
                    dataType: "json",
                    contentType: "application/json",
                    type: "GET",
                    success: function (data, o, i) {                        
                        if(data && data.value && data.value.length > 0){
                            aMyReqs = data.value.filter(function(el){
                                return el.IsRequester;
                            });
                            aToBeRewdReqs = data.value.filter(function(el){
                                return el.IsApprover;
                            });
                            aRewdReqs = data.value.filter(function(el){
                                return el.IsReviewed;
                            });
                            oGlobalModel.setProperty("/MyReqCount", aMyReqs.length);
                            oGlobalModel.setProperty("/ToBeReviewedReqCount", aToBeRewdReqs.length);
                            oGlobalModel.setProperty("/ReviewedReqCount", aRewdReqs.length);
                            oGlobalModel.setProperty("/ReadAPRequestsSet", data.value);
                            this.onTabSelect({
                                getParameter: function(){
                                    if(!sSelectedTab){
                                        sSelectedTab = aToBeRewdReqs.length > 0 ? 'toBeReviewed' : 'myReq';
                                        oGlobalModel.setProperty("/SelectedTabKey", sSelectedTab);
                                    }
                                    return sSelectedTab;
                                }
                            });
                        }  
                        oController.onFilterChangeSK();                          
                    }.bind(this),
                    error: function (e, t, o) {                        
                        MessageToast.show("Loading data failed");
                    }
                });
                this.onGetMattypesData();

            },
            onTabSelect: function (oEvent) {
                var oBinding = this.byId("RequestorTableId").getBinding("items"),
                    sKey = oEvent.getParameter("key"),
                    aFilters = [];
                if (sKey === "myReq") {
                    aFilters.push(new Filter("IsRequester", "EQ", true));
                } else if (sKey === "toBeReviewed") {
                    aFilters.push(new Filter("IsApprover", "EQ", true));
                } else if (sKey === "reviewed") {
                    aFilters.push(new Filter("IsReviewed", "EQ", true));
                }
                oBinding.filter(aFilters);
            },
            applyData: function () {
                var aData = this.oFilterBar.getAllFilterItems().reduce(function (aResult, oFilterItem) {
                    aResult.push({
                        groupName: oFilterItem.getGroupName(),
                        fieldName: oFilterItem.getName(),
                        fieldData: oFilterItem.getControl().getSelectedKeys()
                    });
    
                    return aResult;
                }, []);                
                aData.forEach(function (oDataObject) {
                    var oControl = this.oFilterBar.determineControlByName(oDataObject.fieldName, oDataObject.groupName);
                    oControl.setSelectedKeys(oDataObject.fieldData);
                }, this);
            },
            onCreatePress:function(){
                oGlobalModel.setProperty("/pagemode", "create");
                const oRouter = this.getOwnerComponent().getRouter();
                oGlobalModel.setProperty("/request", {
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
                    currentStatus: "",
                    assigneeID:"",
                    assigneeTeam:"",
                    returnStatus:"",
                    transferStatus:"",
                    seriviceStatus:"",
                    returnDate:null,
                    returnLoc:"",
                    transferDate:null
                });
			    oRouter.navTo("CreateRequest");
            },
            onPressLineItem:function(oEvent){
                var oSrc = oEvent.getSource();
                var oBindingObj = oSrc.getBindingContext('GlobalModel').getObject();
                var oRouter = this.getOwnerComponent().getRouter();
                oGlobalModel.setProperty("/pagemode", "detail");
                oRouter.navTo("detailPage",{
                    id: oBindingObj.ID
                });
                
            },
            onSearch:function(oEvent){
                var oFilterBar = this.getView().byId("filterbar");
                var oTable = this.getView().byId("RequestorTableId");
                var aTableFilters = oFilterBar.getFilterGroupItems().reduce(function (aResult, oFilterGroupItem) {
                    var oControl = oFilterGroupItem.getControl(),
                        aSelectedKeys = oControl.getSelectedKey(),
                       
                        aFilters = new Filter({
                            path: oFilterGroupItem.getName(),
                            operator: FilterOperator.Contains,
                            value1: aSelectedKeys
                        });
    
                    // if (aSelectedKeys.length > 0) {
                        // aResult.push(new Filter({
                        //     filters: aFilters,
                        //     and: false
                        // }));
                    // }
                        aResult.push(aFilters);
                    return aResult;
                }, []);
    
                oTable.getBinding("rows").filter(aTableFilters);
                oTable.setShowOverlay(false);
                // var oSource = oEvent.getSource();
                // var sValue  = oSource.getValue();
                // var oTableId = this.getView().byId("RequestorTableId");
                // var aFilter = [];
                // aFilter.push(new Filter("requesterName", sap.ui.model.FilterOperator.Contains , sValue));
                // oTableId.getBinding("items").filter(new Filter("requesterName", sap.ui.model.FilterOperator.Contains , sValue));
            },
            onFilterChangeSK: function (oEvent) {
                // Get the value from the ComboBox
                var sSelectedKey = oGlobalModel.getProperty("/reqTypeFilterVal");
                
                // Get the table and its binding
                var oTable = this.getView().byId("RequestorTableId") || this.byId("RequestorTableId"); // Adjust the ID as needed
                var oBinding = oTable.getBinding("items"); // Ensure you're using the correct aggregation (e.g., rows for sap.ui.table.Table)
                
                // Create a filter if a valid key is selected
                var aFilters = [];
                if (sSelectedKey) {
                    aFilters.push(new sap.ui.model.Filter("reqType", sap.ui.model.FilterOperator.EQ, sSelectedKey));
                }
                
                // Apply the filter or clear it
                oBinding.filter(aFilters);
            },
            onGetMattypesData: function() {
                const entityPath = "AssetMaster?$filter=status ne 'ASSIGNED' and IsActiveEntity eq true&$select=ID,name,matType,serialNo,barcodeNo,desc1,desc2,desc3"; // Entity path to fetch
                oGlobalModel.setProperty("/AssetMasterMatType", []);
                oGlobalModel.setProperty("/AssetMasterMatTypeTable", []);
                if (!oDataModel) {
                    return;
                }               
                jQuery.ajax({
                    url: oController.dataUrl + entityPath,
                    async: false,
                    dataType: "json",
                    contentType: "application/json",
                    type: "GET",
                    success: function (data, o, i) {                        
                        if(data && data.value && data.value.length > 0){
                            // data.value.unshift({});                           
                            oGlobalModel.setProperty("/AssetMasterMatType", data.value);
                        }                           
                    }.bind(this),
                    error: function (e, t, o) {                        
                        MessageToast.show("Loading data failed");
                    }
                });
            }            
        });
    });
