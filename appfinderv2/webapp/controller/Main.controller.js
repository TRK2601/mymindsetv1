sap.ui.define([
    "./BaseController",
    "./lib/jszip",
    "./lib/xlsx",
    "sap/ui/core/util/Export",
    "sap/ui/core/util/ExportTypeCSV",
    "sap/ui/core/IconPool",
    'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "com/mindset/accelerator/appfinder/v2/model/ReqHelper",
    "com/mindset/accelerator/appfinder/v2/model/TCodeValidation",
    "sap/m/Dialog"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, jszip, xlsx, Export, ExportTypeCSV, IconPool, library, 
        Spreadsheet, Sorter, Filter, FilterOperator,Fragment, JSONModel, MessageToast, MessageBox, ReqHelper, TCodeValidation, Dialog) {
        "use strict";
        var oLocalModel, oBundle, sServiceUrl;
        return BaseController.extend("com.mindset.accelerator.appfinder.v2.controller.Main", {
            onInit: function () {
                this.IsCellEventTriggerd = true;
                this.getRouter().getRoute("RouteApp").attachPatternMatched(this._onObjectMatched, this);
            },
            _onObjectMatched: function(oEvent){
                oLocalModel = this.getOwnerComponent().getModel("LocalModel");
                oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                sServiceUrl = this.getOwnerComponent().getModel("S4AppFinder").sServiceUrl;
                oLocalModel.setProperty("/showPage",false);
                oLocalModel.setProperty("/releaseId", "");
                // MER-177
                oLocalModel.setProperty("/customerName", oLocalModel.getProperty("/customerName") || "");                 
                this.registerBusinessSuiteIconFamily();
                this.displayForm(); //comment this line if CAPM service goes down in order to bypass it & uncomment once it is up

                //this.loadApp(); //uncomment this line if CAPM service goes down & comment once it is up
                this._oWizard = this.byId("s4AppActvtnStpWizard");
                this._iSelectedStepIndex = 0;
                this._oSelectedStep = this._oWizard.getSteps()[this._iSelectedStepIndex];

                this.handleButtonsVisibility();
            },
            registerBusinessSuiteIconFamily: function(){
                //SAP Business Suite Theme font family and URI
                var b=[];
                var c={};
                var sBusinessSuite = {
                    fontFamily: "BusinessSuiteInAppSymbols",
                    fontURI: sap.ui.require.toUrl("sap/ushell/themes/base/fonts/")
                };
                //Registering to the icon pool
                IconPool.registerFont(sBusinessSuite);
                b.push(IconPool.fontLoaded("BusinessSuiteInAppSymbols"));
                c["BusinessSuiteInAppSymbols"] = sBusinessSuite;
            },
            ////////**********Handle Main Page Methods************////////////
            displayForm: function(){
                var sEmailId, sName, isAuthorized=false, oMatchedEntry;
                try {
                    sEmailId = sap.ushell.Container.getService("UserInfo").getEmail();
                    sName = sap.ushell.Container.getService("UserInfo").getFullName();
                    if (!sEmailId) {
                        sEmailId = "testuser1@mindsetconsulting.com";
                        sName = "Test User";
                    }
                } catch (error) {
                    sEmailId = "testuser1@mindsetconsulting.com";
                    sName = "Test User";
                }
                var sUrl = sServiceUrl + "UserSet";
                oLocalModel.setProperty("/loggedInUser",{});
                this.loadBusyIndicator("homePage",true);
                ReqHelper.sendGetReq(sUrl).then(function (response) {
                        this.loadBusyIndicator("homePage",false);
                        if(response && response.value){
                            oMatchedEntry = response.value.find(function(el){
                                return el.email === sEmailId;
                            });
                            if(oMatchedEntry){
                                oLocalModel.setProperty("/loggedInUser/Name", oMatchedEntry.userName);
                                oLocalModel.setProperty("/loggedInUser/Email", oMatchedEntry.email);
                                oLocalModel.setProperty("/loggedInUser/keyID", oMatchedEntry.id);
                                isAuthorized = true;
                            }
                        }
                        if(isAuthorized){
                            this.loadApp();
                        } else {
                            var obj = {
                                "userName": sName,
                                "designation": "",
                                "email": sEmailId,
                                "organization": "",
                                "contactNo": "",
                                "plannedusage": "",
                                "comments": "",
                                "NameVS": "None"
                            }
                            var json = new JSONModel(obj);
                            this._getInquiryFormDialog().setModel(json,"InquiryFrom");
                            this._getInquiryFormDialog().open();
                        }
                    }.bind(this))
                    .catch(function (response) {
                        this.loadBusyIndicator("homePage",false);
                        this.handleErrors(response,oBundle);
                }.bind(this));
            },
            loadApp: function(){
                oLocalModel.setProperty("/showPage",true);
                this.getReleaseVersions();
                this.setDefaultsAfterPageLoaded();
            },
            getUsersToShare: function(){
                var sUrl = sServiceUrl + "UserSet";
                var aReqUsers = [];
                var sLoggedInEmailIdDomain = oLocalModel.getProperty("/loggedInUser/Email").split("@")[1];
                ReqHelper.sendGetReq(sUrl).then(function (response) {
                    if(response && response.value){
                        aReqUsers = response.value.filter(function(el){
                            if(el.email.indexOf(sLoggedInEmailIdDomain) !== -1){
                                return true;
                            }
                        });
                        oLocalModel.setProperty("/UsersToShare", aReqUsers);
                        this._openShareVariantDlg();
                    }
                }.bind(this))
                    .catch(function (response) {
                        this.handleErrors(response,oBundle);
                }.bind(this));
            },
            onShareVariant: function(){
                var oList = sap.ui.getCore().byId("variantList");
                var sEmail = oLocalModel.getProperty("/EmailIds");
                var aSelItems = oList.getSelectedItems();
                var oBinding, aShareItems=[], sUrl, oPayload;
                for(var i=0; i<aSelItems.length; i++){
                    oBinding = aSelItems[i].getBindingContext("S4AppFinder").getObject();
                    aShareItems.push(oBinding.id);
                }
                oLocalModel.setProperty("/aShareItems", $.extend(true,[],aShareItems));
                for(var i=0; i<aShareItems.length; i++){
                    sUrl = sServiceUrl + "VariantSet/" + aShareItems[i];
                    oPayload = {
                        sharedTo: sEmail.split(";")
                    };
                    this.loadBusyIndicator("homePage",true);
                    ReqHelper.sendUpdateReq(sUrl, oPayload).then(function (response) {
                            this.loadBusyIndicator("homePage",false);
                            if(i === aShareItems.length){
                                MessageBox.success(oBundle.getText("shareVarSucMsg"));
                                this.onCloseShareVariantDlg();
                            }
                            
                        }.bind(this))
                        .catch(function (response) {
                            this.loadBusyIndicator("homePage",false);
                            this.handleErrors(response,null);
                    }.bind(this));
                }
            },
            onSharePress: function(){
                var oList = sap.ui.getCore().byId("variantList");
                var sEmail = oLocalModel.getProperty("/EmailIds");
                var aSelItems = oList.getSelectedItems();
                if(!sEmail || aSelItems.length === 0){
                    MessageToast.show(oBundle.getText("mandtCheck"));
                    return;
                }
                MessageBox.confirm(oBundle.getText("warnMsgShareVar"), {
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: "YES",
                    onClose: function (sAction) {
                        if(sAction === "YES"){
                            this.onShareVariant();
                        }
                    }.bind(this)
                });
            },
            onCloseShareVariantDlg: function () {
                this._oShareVarDialog.close();
            },
            setDefaultsAfterPageLoaded: function(){
                oLocalModel.setProperty("/chooseFromOption", 'M');
                oLocalModel.setProperty("/SelectedAppsCount", 0);
                oLocalModel.setProperty("/releaseId", "");
                oLocalModel.setProperty("/TCodesCount", 0);
                oLocalModel.setProperty("/massConfigBtlEnabe",false);
                oLocalModel.setProperty("/ExporBtnEnable", false);
                oLocalModel.setProperty("/displaySelect","Table");
                oLocalModel.setProperty("/chartType","column");
                this.getView().byId("mainSmartTable").applyVariant({});
            },
            onAddLPConfigInfo: function (oEvent) {
                var sSrc = oEvent.getSource().data("category");
                oLocalModel.setProperty("/selCGR", sSrc);
                if (!this.oLPConfigDialog) {
                    this.oLPConfigDialog = sap.ui.xmlfragment("com.mindset.accelerator.appfinder.v2.fragment.LPConfig.CreateCGR", this);
    
                    // to get access to the controller's model
                    this.getView().addDependent(this.oLPConfigDialog);
                }
                oLocalModel.setProperty("/cgrName","");
                oLocalModel.setProperty("/cgrId","");
                oLocalModel.setProperty("/cgrType",-1);
                oLocalModel.setProperty("/createAnother",false);
                this.oLPConfigDialog.open();
            },
            onCreateCGR: function(){
                var sSelCGR = oLocalModel.getProperty("/selCGR");
                var sName = oLocalModel.getProperty("/cgrName");
                var sId = oLocalModel.getProperty("/cgrId");
                var iType = oLocalModel.getProperty("/cgrType");
                var bCreateAnother = oLocalModel.getProperty("/createAnother");
                var aCatalog = oLocalModel.getProperty("/Catalog") ? oLocalModel.getProperty("/Catalog") : [];
                var aGroup = oLocalModel.getProperty("/Group") ? oLocalModel.getProperty("/Group") : [];
                var aRole = oLocalModel.getProperty("/Role") ? oLocalModel.getProperty("/Role") : [];
                if(!sName || !sId){
                    MessageToast.show(oBundle.getText("mandtCheck"));
                    return;
                }
                switch (sSelCGR) {
                    case "Catalog":
                        if(iType === -1){
                            MessageToast.show(oBundle.getText("mandtCheck"));
                            return;
                        }
                        aCatalog.push({
                            "name": sName,
                            "catID": sId,
                            "type": iType === 0 ? oBundle.getText("busCatalog") : oBundle.getText("techCatalog"),
                            "IsNew" : true
                        });
                        oLocalModel.setProperty("/Catalog", $.extend(true,[],aCatalog));
                        break;
                    case "Group":
                        aGroup.push({
                            "name": sName,
                            "groupID": sId,
                            "IsNew" : true
                        });
                        oLocalModel.setProperty("/Group", $.extend(true,[],aGroup));
                        break;
                    case "Role":
                        aRole.push({
                            "name": sName,
                            "roleID": sId,
                            "IsNew" : true,
                            "catalog": [],
                            "group": []
                        });
                        oLocalModel.setProperty("/Role", $.extend(true,[],aRole));
                        break;
                    default:
                        break;
                }
                if(!bCreateAnother){
                    this.oLPConfigDialog.close();
                } else {
                    oLocalModel.setProperty("/cgrName","");
                    oLocalModel.setProperty("/cgrId","");
                    oLocalModel.setProperty("/cgrType",-1);
                }
            },
            onCloseCreateCGRDlg: function(){
                this.oLPConfigDialog.close();
            },
            onMappingTblSelChange: function(oEvent){
                var oSrc = oEvent.getSource();
                var oParams = oEvent.getParameters();
                var aSelInd = oSrc.getSelectedIndices();
                var iVisibleRowCount = oSrc.getVisibleRowCount();
                var iFirstVisibleRow = oSrc.getFirstVisibleRow();
                var aSelRowIndx = oParams.rowIndices;
                var aSelRows= oLocalModel.getProperty("/MapTblSelCtxPaths") ? oLocalModel.getProperty("/MapTblSelCtxPaths") : [];
                if(oParams.selectAll){
                    aSelRows = [];
                    for(var i=0; i<oSrc.getBinding("rows").getAllCurrentContexts().length; i++){
                        aSelRows.push({
                            path: oSrc.getBinding("rows").getAllCurrentContexts()[i].getPath(),
                            index: oSrc.getBinding("rows").getAllCurrentContexts()[i].getPath().split("/")[oSrc.getBinding("rows").getAllCurrentContexts()[i].getPath().split("/").length-1]
                        });
                    }
                } else {
                    for(var i=0; i<aSelRowIndx.length; i++){
                        if(aSelInd.findIndex(function(el){ return el === aSelRowIndx[i]}) !== -1){
                            if(!aSelRows.find(function(el){ return el.index === aSelRowIndx[i]})){
                                aSelRows.push({
                                    path: oSrc.getRows()[aSelRowIndx[i]-iFirstVisibleRow].getBindingContext("LocalModel").getPath(),
                                    index: aSelRowIndx[i]});
                            }
                        } else {
                            aSelRows.splice(aSelRows.findIndex(function(el){
                                return el.index === aSelRowIndx[i];
                            }),1);
                        }
                    }
                }
                oLocalModel.setProperty("/MapTblSelCtxPaths",aSelRows);
                oLocalModel.setProperty("/massConfigBtlEnabe", aSelInd.length > 0 ? true : false);
            },
            onApplyAssignedCGR: function(){
                var oMapTbl = this.getView().byId("MapTbl").getTable();
                var sCat = oLocalModel.getProperty("/AssignedCat");
                var sCatDesc = oLocalModel.getProperty("/AssignedCatDesc");
                var sCatType = oLocalModel.getProperty("/AssignedCatType");
                var sGrp = oLocalModel.getProperty("/AssignedGrp");
                var sGrpDesc = oLocalModel.getProperty("/AssignedGrpDesc");
                var sRole = oLocalModel.getProperty("/AssignedRole");
                var sRoleDesc = oLocalModel.getProperty("/AssignedRoleDesc");
                var aMapTblSelCtxPaths = oLocalModel.getProperty("/MapTblSelCtxPaths");
                if(!sCat || !sGrp || !sRole){
                    MessageToast.show(oBundle.getText("mandtCheck"));
                    return;
                }
                for(var i=0; i<aMapTblSelCtxPaths.length; i++){
                    oLocalModel.setProperty(aMapTblSelCtxPaths[i].path + "/roleID" , sRole);
                    oLocalModel.setProperty(aMapTblSelCtxPaths[i].path + "/roleDesc" , sRoleDesc);
                    oLocalModel.setProperty(aMapTblSelCtxPaths[i].path + "/IsCatEnabled", true);
                    oLocalModel.setProperty(aMapTblSelCtxPaths[i].path + "/IsGrpEnabled", true);
                    oLocalModel.setProperty(aMapTblSelCtxPaths[i].path + "/catID" , sCat);
                    oLocalModel.setProperty(aMapTblSelCtxPaths[i].path + "/catType" , sCatType);
                    oLocalModel.setProperty(aMapTblSelCtxPaths[i].path + "/groupID" , sGrp);
                    oLocalModel.setProperty(aMapTblSelCtxPaths[i].path + "/catDesc", sCatDesc);
                    oLocalModel.setProperty(aMapTblSelCtxPaths[i].path + "/groupDesc", sGrpDesc);
                }
                this.onCloseAssignCGRDlg();
            },
            onPressMassConfig: function(){
                // create dialog lazily
                if (!this._oAssignCGRgDlg) {
                    // create dialog via fragment factory
                    this._oAssignCGRgDlg = sap.ui.xmlfragment("com.mindset.accelerator.appfinder.v2.fragment.Mapping.AssignCGR", this);
                    // connect dialog to view (models, lifecycle)
                    this.getView().addDependent(this._oAssignCGRgDlg);
                }
                oLocalModel.setProperty("/AssignedCat","");
                oLocalModel.setProperty("/AssignedGrp","");
                oLocalModel.setProperty("/AssignedRole","");
                oLocalModel.setProperty("/AssignedRoleDesc","");
                oLocalModel.setProperty("/AssignedCatDesc","");
                oLocalModel.setProperty("/AssignedGrpDesc","");
                oLocalModel.setProperty("/IsCatEnabled", false);
                oLocalModel.setProperty("/IsGrpEnabled", false);
                this._oAssignCGRgDlg.open();
            },
            onCloseAssignCGRDlg: function(){
                this._oAssignCGRgDlg.close();
            },
            handleButtonsVisibility: function (bFlag) {
                // MER-178 : Hide Active/CGR/Mapping sections
                /**
                switch (this._iSelectedStepIndex){
                    case 0:
                        oLocalModel.setProperty("/nextButtonVisible", true);
                        oLocalModel.setProperty("/previousButtonVisible", false);
                        oLocalModel.setProperty("/saveAndPrcdButtonVisible", false);
                        oLocalModel.setProperty("/downldRptButtonVisible", false);
                        // MER-177
                        oLocalModel.setProperty("/reportGenerationData", false);
                        oLocalModel.setProperty("/reportUpdateData", false);
                        oLocalModel.setProperty("/oResShareReportSave", "");
                        break;
                    case 1:
                        oLocalModel.setProperty("/nextButtonVisible", true);
                        oLocalModel.setProperty("/previousButtonVisible", true);
                        oLocalModel.setProperty("/saveAndPrcdButtonVisible", false);
                        oLocalModel.setProperty("/downldRptButtonVisible", false);
                        oLocalModel.setProperty("/reportGenerationData", false);
                        oLocalModel.setProperty("/reportUpdateData", false);
                        break;
                    case 2:
                        oLocalModel.setProperty("/nextButtonVisible", false);
                        oLocalModel.setProperty("/previousButtonVisible", true);
                        oLocalModel.setProperty("/saveAndPrcdButtonVisible", true);
                        oLocalModel.setProperty("/downldRptButtonVisible", false);
                        oLocalModel.setProperty("/reportGenerationData", false);
                        oLocalModel.setProperty("/reportUpdateData", false);
                        break;
                    case 3:
                        oLocalModel.setProperty("/nextButtonVisible", false);
                        oLocalModel.setProperty("/previousButtonVisible", true);
                        oLocalModel.setProperty("/saveAndPrcdButtonVisible", true);
                        oLocalModel.setProperty("/downldRptButtonVisible", false);
                        oLocalModel.setProperty("/reportGenerationData", false);
                        oLocalModel.setProperty("/reportUpdateData", false);
                        break;
                    case 4:
                        oLocalModel.setProperty("/nextButtonVisible", false);
                        oLocalModel.setProperty("/previousButtonVisible", true);
                        oLocalModel.setProperty("/saveAndPrcdButtonVisible", true);
                        oLocalModel.setProperty("/downldRptButtonVisible", false);
                        oLocalModel.setProperty("/reportGenerationData", false);
                        oLocalModel.setProperty("/reportUpdateData", false);
                        break;
                    case 5:
                        oLocalModel.setProperty("/nextButtonVisible", false);
                        oLocalModel.setProperty("/previousButtonVisible", true);
                        oLocalModel.setProperty("/saveAndPrcdButtonVisible", false);
                        oLocalModel.setProperty("/downldRptButtonVisible", true);
                        if (oLocalModel.getProperty("/oResShareReportSave") && oLocalModel.getProperty("/oResShareReportSave/id")) {
                            oLocalModel.setProperty("/reportGenerationData", false);
                            oLocalModel.setProperty("/reportUpdateData", true);
                        } else {
                            oLocalModel.setProperty("/reportGenerationData", true);
                            oLocalModel.setProperty("/reportUpdateData", false);
                        }                        
                        break;
                    default: break;
                }
                */


                // MER-178 : Hide Active/CGR/Mapping sections
                switch (this._iSelectedStepIndex){
                    case 0:
                        // TBD Update binding data Veriant check
                        oLocalModel.setProperty("/aAppTypes", null);
                        oLocalModel.setProperty("/aUiTechnology", null);
                        oLocalModel.setProperty("/aJobRole", null);
                        oLocalModel.setProperty("/Apps", null);
                        oLocalModel.setProperty("/TCodesCount", null);
                        oLocalModel.setProperty("/AppsReadyForActivation", null);
                        oLocalModel.setProperty("/AssignApps", null);
                        oLocalModel.setProperty("/customerName", null);
                        oLocalModel.setProperty("/PastedTcodes", null);                        
                        oLocalModel.setProperty("/AssignAppsEnable", false);
                        oLocalModel.setProperty("/chooseFromOption", "M");
                        oLocalModel.setProperty("/variantName", "");
                        oLocalModel.setProperty("/oSelVariant/name", "");
                        

                        oLocalModel.setProperty("/nextButtonVisible", true);
                        oLocalModel.setProperty("/previousButtonVisible", false);
                        oLocalModel.setProperty("/saveAndPrcdButtonVisible", false);
                        oLocalModel.setProperty("/downldRptButtonVisible", false);
                        // MER-177
                        oLocalModel.setProperty("/reportGenerationData", false);
                        oLocalModel.setProperty("/reportUpdateData", false);
                        oLocalModel.setProperty("/oResShareReportSave", "");
                        oLocalModel.setProperty("/oResShareReportSaveVerintBasedUpdate", true);

                        break;
                    case 1:
                        oLocalModel.setProperty("/nextButtonVisible", true);
                        oLocalModel.setProperty("/previousButtonVisible", true);
                        oLocalModel.setProperty("/saveAndPrcdButtonVisible", false);
                        oLocalModel.setProperty("/downldRptButtonVisible", false);
                        oLocalModel.setProperty("/reportGenerationData", false);
                        oLocalModel.setProperty("/reportUpdateData", false);
                        if (bFlag) { 
                            oLocalModel.setProperty("/oResShareReportSaveVerintBasedUpdate", false);
                        }
                       
                        break;
                    case 2:                        
                        oLocalModel.setProperty("/nextButtonVisible", false);
                        oLocalModel.setProperty("/previousButtonVisible", true);
                        oLocalModel.setProperty("/saveAndPrcdButtonVisible", false);
                        oLocalModel.setProperty("/downldRptButtonVisible", true);

                        if (bFlag) {
                            var aSelectedIdx, oBinding, aSelectedApps=[];
                            aSelectedIdx = this.getView().byId("mainSmartTable").getTable().getSelectedIndices();
                            let oContexts = this.getView().byId("mainSmartTable").getTable().getBinding("rows").getAllCurrentContexts();
                            for(var i=0; i<aSelectedIdx.length; i++){
                                oBinding = oContexts[aSelectedIdx[i]].getObject();
                                aSelectedApps.push(oBinding);
                            }
                            if(aSelectedApps.length === 0){
                                MessageToast.show(oBundle.getText("appsNoSelectWarning"));
                                sap.ui.core.BusyIndicator.hide();
                                return;
                            }

                            oLocalModel.setProperty("/AppsReadyForActivation", $.extend(true,[],aSelectedApps));
                            oLocalModel.setProperty("/AssignApps", $.extend(true,[], aSelectedApps));

                            if (aSelectedApps && aSelectedApps.length > 0) {
                                oLocalModel.setProperty("/AssignAppsEnable", true);
                            } else {
                                oLocalModel.setProperty("/AssignAppsEnable", false)
                            }
                            oLocalModel.setProperty("/oResShareReportSaveVerintBasedUpdate", false);
                        }

                        if (!oLocalModel.getProperty("/oResShareReportSaveVerintBasedUpdate") && oLocalModel.getProperty("/oResShareReportSave") && oLocalModel.getProperty("/oResShareReportSave/id")) {
                            oLocalModel.setProperty("/reportGenerationData", false);
                            oLocalModel.setProperty("/reportUpdateData", true);
                        } else {
                            oLocalModel.setProperty("/reportGenerationData", true);
                            oLocalModel.setProperty("/reportUpdateData", false);
                        }                        
                        break;
                    default: break;
                }
    
            },
            _openShareVariantDlg: function () {
                var oBinding, aFilters;
                // create dialog lazily
                if (!this._oShareVarDialog) {
                    // create dialog via fragment factory
                    this._oShareVarDialog = sap.ui.xmlfragment("com.mindset.accelerator.appfinder.v2.fragment.Main.ShareVariant", this);
                    // connect dialog to view (models, lifecycle)
                    this.getView().addDependent(this._oShareVarDialog);
                }
                oLocalModel.setProperty("/EmailIds","");
                oBinding = sap.ui.getCore().byId("variantList").getBinding("items");
                oBinding.filter([new Filter("email", FilterOperator.EQ, oLocalModel.getProperty("/loggedInUser").Email)]);  //apply the filter
                this._oShareVarDialog.open();
            },
            _getInquiryFormDialog: function () {
                // create dialog lazily
                if (!this._oDialog) {
                    // create dialog via fragment factory
                    this._oDialog = sap.ui.xmlfragment("com.mindset.accelerator.appfinder.v2.fragment.InquiryForm", this);
                    // connect dialog to view (models, lifecycle)
                    this.getView().addDependent(this._oDialog);
                }
                return this._oDialog;
            },
            handleEscape: function(oPromise){
                if (!this.oConfirmEscapePreventDialog) {
                    this.oConfirmEscapePreventDialog = new sap.m.Dialog({
                        title: "Are you sure?",
                        content: new sap.m.Text({ text: "Your unsaved changes will be lost" }),
                        type: DialogType.Message,
                        icon: IconPool.getIconURI("message-information"),
                        buttons: [
                            new Button({
                                text: "Yes",
                                press: function () {
                                    this.oConfirmEscapePreventDialog.close();
                                    oPromise.resolve();
                                }.bind(this)
                            }),
                            new Button({
                                text: "No",
                                press: function () {
                                    this.oConfirmEscapePreventDialog.close();
                                    oPromise.reject();
                                }.bind(this)
                            })
                        ]
                    });
                }
                this.oConfirmEscapePreventDialog.open();
            },
            onSubmitInquiryFormInfo: function () {
                var oModel = this._getInquiryFormDialog().getModel("InquiryFrom");
                var oPayload = oModel.getProperty("/");
                if (!oModel.getProperty("/userName")) {
                    oModel.setProperty("/NameVS", "Error");
                    MessageToast.show(oBundle.getText("warningFormSubmit"));
                    return;
                }
                delete oPayload.NameVS;
                var sUrl = sServiceUrl + "UserSet";
                this.loadBusyIndicator("homePage",true);
                ReqHelper.sendCreateReq(sUrl, oPayload).then(function (oRes) {
                        if(oRes){
                            oLocalModel.setProperty("/loggedInUser/Name", oRes.userName);
                            oLocalModel.setProperty("/loggedInUser/Email", oRes.email);
                            oLocalModel.setProperty("/loggedInUser/keyID", oRes.id);
                        }
                        this.loadBusyIndicator("homePage",false);
                        this._getInquiryFormDialog().close();
                        MessageBox.success(oBundle.getText("successFormMsg"),{
                            onClose: function () {
                                this.loadApp();
                            }.bind(this)
                        });
                    }.bind(this))
                    .catch(function (response) {
                        this.loadBusyIndicator("homePage",false);
                        this.handleErrors(response,null);
                }.bind(this));
            },
            onVariantActionsBtnPress: function(oEvent){
                var oButton = oEvent.getSource();
			    this.byId("actionSheet").openBy(oButton);
            },
            onPressSaveOrUpdateVar: function(oEvent){
                var oSrc = oEvent.getSource();
                var sSelectedInputFld = oSrc.data("variantAction");
                var aSelectedIdx = this.getView().byId("mainSmartTable").getTable().getSelectedIndices();
                oLocalModel.setProperty("/SelVarAction",sSelectedInputFld);
                if(aSelectedIdx.length === 0){
                    MessageToast.show(oBundle.getText("selectAppsFirst"));
                    return;
                }
                oLocalModel.setProperty("/variantNameValueSate", "None");
                if (oLocalModel.getProperty("/oSelVariant/name") && sSelectedInputFld === "Save") {
                    oLocalModel.setProperty("/variantName", oLocalModel.getProperty("/oSelVariant/name"));
                    oLocalModel.setProperty("/variantNameEnabled", false);
                    oLocalModel.setProperty("/variantNameValueSate", "None");
                } else if(sSelectedInputFld === "Save"){
                    oLocalModel.setProperty("/variantName", oLocalModel.getProperty("/variantName") || "");
                    oLocalModel.setProperty("/variantNameEnabled", true);
                    // oLocalModel.setProperty("/variantNameValueSate", oLocalModel.getProperty("/variantName") ? "None" : "Error");
                } else {
                    if(!oLocalModel.getProperty("/oSelVariant")){
                        MessageToast.show(oBundle.getText("noVarSelected"));
                        return;
                    }
                    oLocalModel.setProperty("/variantName",oLocalModel.getProperty("/oSelVariant/name"));
                }
                if (!this._VariantDlg) {
                    this._VariantDlg = sap.ui.xmlfragment("com.mindset.accelerator.appfinder.v2.fragment.Main.SaveOrUpdateVariant", this);
                    this.getView().addDependent(this._VariantDlg);
                 }
                
                 this._VariantDlg.open();
            },
            onRowSelctionChanged: function(oEvent){
                oLocalModel.setProperty("/SelectedAppsCount",this.getView().byId("mainSmartTable").getTable().getSelectedIndices().length);
            },
            onSaveOrUpdateVariant: function(){
                var aSelectedIdx = this.getView().byId("mainSmartTable").getTable().getSelectedIndices();
                var sSelectedInputFld = oLocalModel.getProperty("/SelVarAction");
                var sUrl = sServiceUrl + "VariantSet";
                var oPayload, oBinding, aSelectedApps=[];
                if(!oLocalModel.getProperty("/variantName")){
                    MessageToast.show(oBundle.getText("varNameError"));
                    return;
                } 
                // Veriant code update
                var oTableContext = this.getView().byId("mainSmartTable").getTable().getBinding("rows").getAllCurrentContexts();
                for(var i=0; i<aSelectedIdx.length; i++){
                    oBinding = oTableContext[aSelectedIdx[i]].getObject();
                    aSelectedApps.push({
                        tCode: oBinding.TCode,
                        appID: oBinding.appId
                    });                   
                }               

                oPayload = {
                    user_id: oLocalModel.getProperty("/loggedInUser/keyID"),
                    name: oLocalModel.getProperty("/variantName"),
                    values: aSelectedApps,
                    owner: oLocalModel.getProperty("/loggedInUser/Email"),
                    email: oLocalModel.getProperty("/loggedInUser/Email"),
                    versionID: oLocalModel.getProperty("/releaseId") || "",
                    versionDesc: oLocalModel.getProperty("/releaseName") || "",
                    shareinfo_id:  oLocalModel.getProperty("/oResShareReportSave/id") || null // TBD
                };
                this.loadBusyIndicator("homePage",true); 
                if (oLocalModel.getProperty("/oSelVariant") && oLocalModel.getProperty("/oSelVariant/id")) {
                    ReqHelper.sendUpdateReq(sUrl + '/' + oLocalModel.getProperty("/oSelVariant/id"), oPayload).then(function (response) {
                        // Varint data updated in ShareInfoSet
                        if (oLocalModel.getProperty("/oResShareReportSave/id")) {
                            this.onVerintBasedShareInfoUpdate(response, "Old");
                        } else {
                            oLocalModel.setProperty("/oResShareReportSaveVerintBasedUpdate", true);
                        }                   
                        this.loadBusyIndicator("homePage",false);
                        this.closeVariantDlg();
                        MessageBox.success(oBundle.getText("variantSaveSucMsg"));
                    }.bind(this)).catch(function (response) {
                        this.loadBusyIndicator("homePage",false);
                        this.handleErrors(response,null);
                    }.bind(this));
                } else { 
                    if (oLocalModel.getProperty("/loggedInUser").Email) {
                        let that = this;
                        let sVerintNameUrl = sUrl + "?$select=id,name,email&$orderby=name&$filter=email eq '" + oLocalModel.getProperty("/loggedInUser").Email + "'";      
                        ReqHelper.sendGetReq(sVerintNameUrl).then(function (response1) {
                            if(response1 && response1.value && response1.value.length > 0){
                                let bFlag = false;
                                response1.value.forEach(element => {
                                    if (oLocalModel.getProperty("/variantName") && element.name &&
                                        oLocalModel.getProperty("/variantName").toUpperCase() === element.name.toUpperCase()) {
                                        bFlag = true;
                                    }
                                });
                                if (bFlag) {
                                    this.loadBusyIndicator("homePage",false);
                                    oLocalModel.setProperty("/variantNameValueSate", "Error");
                                    MessageToast.show(oBundle.getText("varNameError"));
                                    return;
                                } else {
                                    oLocalModel.setProperty("/variantNameValueSate", "None");
                                    this.onVerintCreate(sUrl, oPayload);
                                }
                            } else {
                                this.onVerintCreate(sUrl, oPayload);
                            }
                        }.bind(that)).catch(function (response1) {
                            that.handleErrors(response1, oBundle);                            
                            oLocalModel.setProperty("/reportUpdateData", false);
                            oLocalModel.setProperty("/oResShareReportSaveVerintBasedUpdate", true);
                        }.bind(that));
                    } else {
                        this.onVerintCreate(sUrl, oPayload);
                    }  
                }
            },
            /**
             * Create cal for Verint data set
             * @param {*} sUrl 
             * @param {*} oPayload 
             */
            onVerintCreate: function (sUrl, oPayload) {
                ReqHelper.sendCreateReq(sUrl, oPayload).then(async function (response) {
                    oLocalModel.setProperty("/oSelVariant", response); 
                    // Varint data updated in ShareInfoSet  
                    if (oLocalModel.getProperty("/oResShareReportSave/id")) {
                        await this.onVerintBasedShareInfoUpdate(response, "Old");
                    } else {
                        await this.onVerintBasedShareInfoUpdate(response, "New");
                        oLocalModel.setProperty("/oResShareReportSaveVerintBasedUpdate", true);
                    }                                     
                    this.loadBusyIndicator("homePage",false);
                    this.closeVariantDlg();
                    MessageBox.success(oBundle.getText("variantSaveSucMsg"));
                }.bind(this)).catch(function (response) {
                    this.loadBusyIndicator("homePage",false);
                    this.handleErrors(response,null);
                }.bind(this));
            },
            /**
             * Update sharedinfoset data based on the verintdata
             * @param {*} response 
             */
            onVerintBasedShareInfoUpdate: function(response, sKey){
                let that = this;
                if (response) {
                    var tcode = [], aSlectedTcode = {tcodes:[]};
                    response.values.forEach(element => {
                        if (element.tCode && !tcode.includes(element.tCode)) {
                            tcode.push(element.tCode);
                            aSlectedTcode.tcodes.push({tcode: element.tCode, appids:[{appid: element.appID}]})
                        } else {
                            aSlectedTcode.tcodes.forEach(item => {   
                                if (item.tcode === element.tCode) {                                         
                                    item.appids.push({appid: element.appID})
                                }
                            });
                        }
                    });
                    if (sKey === "Old") {
                        let oPayloadData = {
                            svariant: response && response.name,
                            svariant_id : response && response.id,
                            tcodes: aSlectedTcode.tcodes || oLocalModel.getProperty("/oResShareReportSave/tcodes")
                        }
                        let sUrl = sServiceUrl + "ShareInfoSet";
                            sUrl = sUrl + "/" + oLocalModel.getProperty("/oResShareReportSave/id");
                        ReqHelper.sendUpdateReq(sUrl, oPayloadData).then(function (response1) {
                            if(response1 && response1.id){
                                oLocalModel.setProperty("/oResShareReportSave", response1);
                                oLocalModel.setProperty("/oResShareReportSaveVerintBasedUpdate", true);
                            }
                        }.bind(that)).catch(function (response1) {
                            that.handleErrors(response1, oBundle);                            
                            oLocalModel.setProperty("/reportUpdateData", false);
                            oLocalModel.setProperty("/oResShareReportSaveVerintBasedUpdate", true);
                        }.bind(that));
                    } else if (sKey === "New") {
                        // this.onReportSave();
                        var sUrl = sServiceUrl + "ShareInfoSet";
                        var userName = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("UserInfo");
                        var oPayloadData = {
                            createdBy: ((userName) && (userName.getEmail() || 'testuser1@mindsetconsulting.com')) || 'testuser1@mindsetconsulting.com',
                            customerName: oLocalModel.getProperty("/customerName"),
                            selectedVersion: oLocalModel.getProperty("/releaseId") || "",
                            passKey: "P" + new Date().toISOString().replace(/[-:.]/g, ''),
                            lastAccessDate: new Date(),
                            tcodes: aSlectedTcode.tcodes || [],
                            svariant:  oLocalModel.getProperty("/oSelVariant/name"),
                            svariant_id: oLocalModel.getProperty("/oSelVariant/id")
                        }

                        if (oLocalModel.getProperty("/chooseFromOption") === 'ST') {
                            oPayloadData.STO3NRepost = true,
                            oPayloadData.top_overall_tran = oLocalModel.getProperty("/aExcelTopFinalDataResult/0/aOverall_Transactions") || [],
                            oPayloadData.top_standard_tran = oLocalModel.getProperty("/aExcelTopFinalDataResult/0/aStandard_Transactions") || [],
                            oPayloadData.top_custom_tran = oLocalModel.getProperty("/aExcelTopFinalDataResult/0/aCustom_Transactions") || []
                        } else {
                            oPayloadData.STO3NRepost = false,
                            oPayloadData.top_overall_tran =  [],
                            oPayloadData.top_standard_tran = [],
                            oPayloadData.top_custom_tran = []
                        }
                        ReqHelper.sendCreateReq(sUrl, oPayloadData).then(function (response) {
                            oLocalModel.setProperty("/reportUpdateData", false);
                            if(response && response.id){
                                var oResShareReport = response;
                                oLocalModel.setProperty("/oResShareReportSave", response);
                                // Verint update
                                if (oLocalModel.getProperty("/oSelVariant/id")) {
                                    let opaylod = {
                                        shareinfo_id:  response.id
                                    }
                                    let sVerintURL = sServiceUrl + "VariantSet/" + oLocalModel.getProperty("/oSelVariant/id");
                                    ReqHelper.sendUpdateReq(sVerintURL, opaylod).then(function (res) {
                                        // TBD
                                        oLocalModel.setProperty("/oSelVariant", res);
                                    }.bind(that))
                                        .catch(function (res) {
                                            that.handleErrors(res, oBundle);
                                    }.bind(that));
                                } 
                            } else {
                                // TBD                            
                                oLocalModel.setProperty("/reportUpdateData", false);
                            }
                        }.bind(that))
                            .catch(function (response) {
                                that.handleErrors(response,oBundle);                            
                                 oLocalModel.setProperty("/reportUpdateData", false);
                        }.bind(that));
                    }
                }
            },
            closeVariantDlg: function(){
                this._VariantDlg.close();
            },
            getReleaseVersions: function(){
                var that = this;
                var oDataModel = this.getView().getModel();
                oDataModel.read("/Releases", {
                    sorters: [new sap.ui.model.Sorter("releaseRank", true)],
                    success: function(oData) {
                        for(var i=0; i<oData.results.length; i++){
                            if(oData.results[i].releaseType === "WD" || oData.results[i].releaseType === "W"){
                                oData.results[i].releaseName = "BUSINESS SUITE";
                            }
                        }
                        oData.results.unshift({
                            releaseId: "",
                            releaseName: "",
                            releaseType:""
                        });
                        oLocalModel.setProperty("/Releases", oData.results);
                    },
                    error: function(oError) {
                        that.handleErrors(oError,oBundle);
                    }
                });
            },
            onPressSubmit: async function(aTCodes,isVarSel,bFirstPage, callBack){
                var sEnteredTCodes = oLocalModel.getProperty("/PastedTcodes");
                var aExcelTcodes = oLocalModel.getProperty("/ExcelTcodes");
                var iSelectedIdx = oLocalModel.getProperty("/chooseFromOption");
                var oBusyDialog = new sap.m.BusyDialog({
                    text: "Loading applications..."
                });
                this.getView().byId("mainSmartTable").applyVariant({});
                oLocalModel.setProperty("/SelectedAppsCount",0);
                if(!isVarSel){
                    if(iSelectedIdx === 'M'){
                        if(sEnteredTCodes.indexOf("\n") !== -1){
                            aTCodes = sEnteredTCodes.split('\n').join().split(',');
                            aTCodes = [... new Set(aTCodes.map(function(el){
                                return el.toUpperCase().trim();
                            }))];
                        } else if(sEnteredTCodes.indexOf(",") !== -1){
                            aTCodes = [... new Set(sEnteredTCodes.split(",").map(function(el){
                                return el.toUpperCase().trim();
                            }))];
                        } else {
                            aTCodes = [... new Set(sEnteredTCodes.split().map(function(el){
                                return el.toUpperCase().trim();
                            }))];
                        }
                    } else {
                        aTCodes = [... new Set(aExcelTcodes)];
                    }
                }
                if(aTCodes && aTCodes.length > 0){
                    // Tcode validatation function call.
                    let aArrayData = await TCodeValidation.onTcodeValidation(aTCodes, oLocalModel);                    
                        aTCodes = aArrayData;

                    var aTriggerAjaxCall = [];
                    for(var i=0; i<aTCodes.length; i++){
                        if(aTCodes[i]){
                            aTCodes[i] = aTCodes[i].toString();
                            aTriggerAjaxCall.push(this.makePromiseAjaxCall(aTCodes[i],"/InputFilterParam(InpFilterValue='"+aTCodes[i].trim()+"')/Results"));
                        }
                    }
                    oBusyDialog.open();
                    oLocalModel.setProperty("/displaySelect","Table");
                    Promise.all(aTriggerAjaxCall).then(function(values){
                        var aFinal = [], aFunArea = [], aSplitArr =[] , aAppType = [] , aUiTechnology= [], aJobRole = [];
                        for(var i=0; i<values.length; i++){
                            aFinal=aFinal.concat(values[i].results);
                            values[i].results.forEach(element => {
                                if(element.ApplicationType){
                                    aAppType.push(element.ApplicationType);
                                }
                                if(element.UITechnology){
                                    aUiTechnology.push(element.UITechnology);
                                }
                                if(element.RoleName){
                                    aJobRole.push(element.RoleName);
                                }
                            });
                        }
                        if(values && values.length > 0){
                            oLocalModel.setProperty("/ExporBtnEnable", true);
                        }
                        aAppType = [... new Set(aAppType)];
                        if(aAppType && aAppType.length > 0){
                            aAppType = aAppType.join().split(",");
                            aAppType = [... new Set(aAppType.map(function(el){return el.trim()}))];
                        }
                        
                        aUiTechnology = [... new Set(aUiTechnology)];
                        var aTempUiTech = [];
                        if(aUiTechnology && aUiTechnology.length > 0){
                            aUiTechnology.forEach(function(sObj, indIdx){
                                if(sObj && sObj.indexOf("SAP Fiori") > -1){
                                    aTempUiTech.push("SAP Fiori");
                                }else if(sObj.indexOf("SAP Fiori") == -1){
                                    aTempUiTech.push(sObj); 
                                }
                            });
                        }

                        aJobRole = [... new Set(aJobRole)];
                                        
                        oLocalModel.setProperty("/aAppTypes", aAppType);
                        oLocalModel.setProperty("/aUiTechnology", aTempUiTech);
                        oLocalModel.setProperty("/aJobRole", aJobRole);
                        oLocalModel.setProperty("/Apps",aFinal);
                        oLocalModel.setProperty("/TCodesCount", aTCodes.length);
                        //this._makeTblExprtReady(aFinal);
                        oBusyDialog.close();
                        this.getView().byId('mainSmartTable').rebindTable();
                        if(isVarSel){
                            var aVariantVals = oLocalModel.getProperty("/oSelVariant").values;
                            var aApps = oLocalModel.getProperty("/Apps"), oSelObj;
                            for(var i=0; i<aVariantVals.length; i++){
                                var iSelIdx = aApps.findIndex(function(el){
                                    return el.TCode === aVariantVals[i].tCode && el.appId === aVariantVals[i].appID;
                                });
                                if(iSelIdx !== -1){
                                    oSelObj = $.extend(true,{},aApps[iSelIdx]);
                                    oSelObj["IsSelected"] = true;
                                    aApps.splice(iSelIdx,1);
                                    aApps.unshift(oSelObj);
                                }
                            }
                            oLocalModel.setProperty("/Apps",$.extend(true,[],aApps));
                            this.selectRows();
                        } else {
                            oLocalModel.setProperty("/oSelVariant",{});
                        }
                        callBack(bFirstPage);
                        //this._attachChartProperties();
                    }.bind(this)).catch(function (error) {
                        oBusyDialog.close();
                        this.handleErrors(oBundle.getText("invalidTcodesErr"),null);
                    }.bind(this));
                } else {
                    MessageBox.error(oBundle.getText("invalidFile"));
                }
            },
            onChangeTCodesInput: function(oEvent){
                oLocalModel.setProperty("/PastedTcodes", oEvent.getSource().getValue());
            },
            onPressLink: function(oEvent){
                sap.m.URLHelper.redirect(oEvent.getSource().getBindingContext("LocalModel").getObject().AppLink,true);
            },
            onChangeChooseSel: function(){
                oLocalModel.setProperty("/File", "");
            },
            onSelectUseful: function(oEvent){
                var oSrc = oEvent.getSource();
                var sValue = oSrc.data('key');
                oLocalModel.setProperty("/UsefulRating", parseInt(sValue));
            },
            onSelectAgree: function(oEvent){
                var oSrc = oEvent.getSource();
                var sValue = oSrc.data('key');
                oLocalModel.setProperty("/AgreeRating", parseInt(sValue));
            },
            onShowFeedbackForm: function(){
                if (!this._oFeedbackDialog) {
                    this._oFeedbackDialog = sap.ui.xmlfragment("com.mindset.accelerator.appfinder.v2.fragment.FeedbackForm", this);
                    this.getView().addDependent(this._oFeedbackDialog);
                }
                oLocalModel.setProperty("/Rating", -1);
                oLocalModel.setProperty("/Useful", -1);
                oLocalModel.setProperty("/Agree", -1);
                oLocalModel.setProperty("/comment1", '');
                oLocalModel.setProperty("/comment2", '');
                oLocalModel.setProperty("/comment3", '');
                oLocalModel.setProperty("/RatingVS", 'None');
                oLocalModel.setProperty("/UsefulVS", 'None');
                oLocalModel.setProperty("/AgreeVS", 'None');
                this._oFeedbackDialog.open();
            },
            onCustomExcelExport: function(oEvent){
                var oSrc, sPath, oTable;
                if(oEvent){
                    oSrc = oEvent.getSource();
                    sPath = oSrc.data("path");
                    oTable = this.getView().byId(oSrc.data("tableId"));
                } else {
                    sPath = "/AssignApps";
                    oTable = this.getView().byId("reviewSmartTable");
                }
                this._makeTblExprtReady(oLocalModel.getProperty(sPath));
                this.onExport(oTable);
            },
            onPressSkip: function(){
                MessageBox.warning(oBundle.getText('skipSurveyWarn'), {
                    title: oBundle.getText('skipSurvey'),
                    actions: [oBundle.getText('skip'), oBundle.getText('back')],
                    emphasizedAction: oBundle.getText('skip'),
                    onClose: function (sAction) {
                        if(sAction === oBundle.getText('skip')){
                            this._oFeedbackDialog.close();
                            this.onCustomExcelExport();
                        }
                    }.bind(this)
                });
            },
            onPressSubmitFeedback: function(){
                var bIsValidated = this._validateFeedbackForm();
                if(bIsValidated){
                    this._submitFeedbackInfo();
                }
            },
            _validateFeedbackForm: function(){
                var iRating = oLocalModel.getProperty("/Rating");
                var iUseful = oLocalModel.getProperty("/Useful");
                var iAgree = oLocalModel.getProperty("/Agree");
                var sComment1 = oLocalModel.getProperty("/comment1");
                var sComment2 = oLocalModel.getProperty("/comment2");
                var bErrorCount=0;
                oLocalModel.setProperty("/RatingVS", 'None');
                oLocalModel.setProperty("/UsefulVS", 'None');
                oLocalModel.setProperty("/AgreeVS", 'None');
                if(iRating === -1){
                    bErrorCount = bErrorCount + 1;
                    oLocalModel.setProperty("/RatingVS", 'Error');
                }
                if(iUseful === -1){
                    bErrorCount = bErrorCount + 1;
                    oLocalModel.setProperty("/UsefulVS", 'Error');
                }
                if(iAgree === -1){
                    bErrorCount = bErrorCount + 1;
                    oLocalModel.setProperty("/AgreeVS", 'Error');
                }
                if(bErrorCount > 0){
                    return false;
                } else {
                    return true;
                }
            },
            _submitFeedbackInfo: function(){
                var iRating = oLocalModel.getProperty("/Rating");
                var iUseful = oLocalModel.getProperty("/UsefulRating");
                var iAgree = oLocalModel.getProperty("/AgreeRating");
                var sComment1 = oLocalModel.getProperty("/comment1");
                var sComment2 = oLocalModel.getProperty("/comment2");
                var sComment3 = oLocalModel.getProperty("/comment3");
                var oPayload = {
                    usefulRating: iUseful,
                    agreeRating: iAgree,
                    comment1: sComment1,
                    comment2: sComment2,
                    comment3: sComment3 ? sComment3 : "",
                    user: oLocalModel.getProperty("/loggedInUser/Email"),
                    appRating: iRating + 1
                };
                this.loadBusyIndicator("reviewPage",true);
                ReqHelper.sendCreateReq(sServiceUrl + "/FeedbackSet", oPayload).then(function (response) {
                        this.loadBusyIndicator("reviewPage",false);
                        this._oFeedbackDialog.close();
                        MessageBox.alert(oBundle.getText("thankYouFeedback"), {
                            title: "Sent",
                            icon: MessageBox.Icon.INFORMATION,
                            actions: [oBundle.getText("downloadReport")],
                            onClose: function(){
                                this.onCustomExcelExport();
                            }.bind(this)
                        });
                    }.bind(this))
                    .catch(function (response) {
                        this.loadBusyIndicator("reviewPage",false);
                        this.handleErrors(response,null);
                }.bind(this));
            },
            onExport: function(oSmartTable) {
                var aFunArea =  oLocalModel.getProperty("/aFunArea");
                var aAppsFromNone = oLocalModel.getProperty("/NONE");
                var workSheet, sSheetName;
                var oWorkbook = XLSX.utils.book_new();
                for(var i = 0; i< aFunArea.length; i++){
                    aFunArea[i] = aFunArea[i].replace(/[\/\\#,+()$~%.'":*?<>{}]/g, ' ').replace("&", " and ");
                    sSheetName = aFunArea[i];
                    workSheet = XLSX.utils.json_to_sheet(this.make_Sheet_Json(oLocalModel.getProperty("/"+aFunArea[i]+"_Results"), oSmartTable));
                    if(sSheetName.length > 31){
                        sSheetName = sSheetName.substring(0,31);
                    }
                    jQuery.each(workSheet, function(cell, item) {
                        if (item.v != null && item.v.toString().indexOf('http') == 0){
                            workSheet[cell].l = {
                                Target: item.v.toString()
                              };
                        }
                    });
                    XLSX.utils.book_append_sheet(oWorkbook, workSheet, sSheetName);
                }
                if(aAppsFromNone && aAppsFromNone.length > 0){
                    workSheet = XLSX.utils.json_to_sheet(this.make_Sheet_Json(aAppsFromNone, oSmartTable));
                    jQuery.each(workSheet, function(cell, item) {
                        if (item.v != null && item.v.toString().indexOf('http') == 0){
                            workSheet[cell].l = {
                                Target: item.v.toString()
                              };
                        }
                    });
                    XLSX.utils.book_append_sheet(oWorkbook, workSheet, "NONE");
                }
                var sFileName = oLocalModel.getProperty("/releaseId") ? oLocalModel.getProperty("/releaseName") + " - " + oLocalModel.getProperty("/releaseId") + ".xlsx" : "All Applications.xlsx";
                XLSX.writeFile(oWorkbook, sFileName);
            },
            make_Sheet_Json:function(aResult, oSmartTable){
                var oTable = oSmartTable.getTable();
                var aFunArea = $.extend(true, [], aResult);
                var Obj = {}, aModifiedResult = [];
                if(aFunArea && aFunArea.length > 0){
                    aFunArea.forEach(element => {
                        Obj={};
                        for(var i=0; i<oTable.getColumns().length; i++){
                            if(oTable.getColumns()[i].getVisible()){
                                if(oTable.getColumns()[i].getLabel().getText() === oBundle.getText("lighthouse")){
                                    Obj[oTable.getColumns()[i].getLabel().getText()] = this.Lighthouse_Values(element.Lighthouse);
                                } else if(oTable.getColumns()[i].getLabel().getText() === oBundle.getText("deviceTypes")){
                                    Obj[oTable.getColumns()[i].getLabel().getText()] = element.FormFactors;
                                } else if(oTable.getColumns()[i].getLabel().getText() === oBundle.getText("funcArea")){
                                    //Do Nothing
                                } else {
                                    Obj[oTable.getColumns()[i].getLabel().getText()] = element[oTable.getColumns()[i].getTemplate().getBindingPath('text')];
                                }
                            }
                        }
                        Obj["App Library URL"] = element["AppLink"];
                        aModifiedResult.push(Obj);
                    });
                }
                return aModifiedResult;
            },
            /**
             * Function calls when the f4 help gets opened
             * Method to display the list
             * @Param {oEvent} - event from input value help
             */
            onValueHelpRequest: function (oEvent) {
                var oSrc = oEvent.getSource(),
                    sSelectedInputFld = oSrc.data("vhProp"),
                    titleProp, descProp, infoProp, dialogTitle;
                oLocalModel.setProperty("/VHFieldName", sSelectedInputFld);
                oLocalModel.setProperty("/IsVHOriginDlg", false);
                var itemsObj = {};
                if (sSelectedInputFld === "Version") {
                    itemsObj.path = "LocalModel>/Releases";
                    itemsObj.model = oLocalModel;
                    itemsObj.filters = [];
                    titleProp = "LocalModel>releaseName";
                    descProp = "LocalModel>externalName";
                    infoProp = "LocalModel>releaseId";
                    dialogTitle = oBundle.getText("vhVersionTitle");
                } else if (sSelectedInputFld === "DisplayVariant" || sSelectedInputFld === "ShareVariant") {
                    itemsObj.path = "S4AppFinder>/VariantSet";
                    itemsObj.model = this.getOwnerComponent().getModel("S4AppFinder");
                    itemsObj.filters = new Filter({
                        path: "email",
                        operator: FilterOperator.EQ,
                        value1: oLocalModel.getProperty("/loggedInUser").Email
                    });
                    itemsObj.sorter = new Sorter("name", false);
                    itemsObj.parameters = {
                        "$select": "values,shareinfo_id,versionID,versionDesc",
                    };
                    titleProp = "S4AppFinder>name";
                    dialogTitle = oBundle.getText("variants");
                } else if (sSelectedInputFld === "role") {
                    if(oSrc.data("init")){
                        oLocalModel.setProperty("/IsVHOriginDlg", true);
                    } else {
                        var sRowPath = oEvent.getSource().getBindingContext("LocalModel").getPath();
                        oLocalModel.setProperty("/MapTblSelRowPath", sRowPath);
                    }
                    itemsObj.path = "LocalModel>/Role";
                    itemsObj.model = oLocalModel;
                    itemsObj.filters = [];
                    itemsObj.sorter = new Sorter("name", false);
                    titleProp = "LocalModel>name";
                    descProp = "LocalModel>roleID";
                    dialogTitle = oBundle.getText("selectRole");
                } else if (sSelectedInputFld === "catalog") {
                    var aRoles = oLocalModel.getProperty("/Role");
                    if(oSrc.data("init")){
                        var sRole = oLocalModel.getProperty("/AssignedRole");
                        var iRoleIdx = aRoles.findIndex(function(el){ return el.roleID === sRole});
                        oLocalModel.setProperty("/IsVHOriginDlg", true);
                    } else {
                        var sRowPath = oEvent.getSource().getBindingContext("LocalModel").getPath();
                        var sRole = oLocalModel.getProperty(sRowPath+"/roleID");
                        var iRoleIdx = aRoles.findIndex(function(el){ return el.roleID === sRole});
                        oLocalModel.setProperty("/MapTblSelRowPath", sRowPath);
                    }
                    itemsObj.path = "LocalModel>/Role/"+iRoleIdx+"/AllotCatalogs";
                    itemsObj.model = oLocalModel;
                    itemsObj.filters = [];
                    itemsObj.sorter = new Sorter("name", false);
                    titleProp = "LocalModel>name";
                    descProp = "LocalModel>catID";
                    infoProp = "LocalModel>type";
                    dialogTitle = oBundle.getText("selectCatalog");
                } else if (sSelectedInputFld === "group") {
                    var aRoles = oLocalModel.getProperty("/Role");
                    if(oSrc.data("init")){
                        var sRole = oLocalModel.getProperty("/AssignedRole");
                        var iRoleIdx = aRoles.findIndex(function(el){ return el.roleID === sRole});
                        oLocalModel.setProperty("/IsVHOriginDlg", true);
                    } else {
                        var sRowPath = oEvent.getSource().getParent().getBindingContext("LocalModel").getPath();
                        var sRole = oLocalModel.getProperty(sRowPath+"/roleID");
                        var iRoleIdx = aRoles.findIndex(function(el){ return el.roleID === sRole});
                        oLocalModel.setProperty("/MapTblSelRowPath", sRowPath);
                    }
                    itemsObj.path = "LocalModel>/Role/"+iRoleIdx+"/AllotGroups";
                    itemsObj.model = oLocalModel;
                    itemsObj.filters = [];
                    itemsObj.sorter = new Sorter("name", false);
                    titleProp = "LocalModel>name";
                    descProp = "LocalModel>groupID";
                    dialogTitle = oBundle.getText("selectGroup");
                }
                if (!this._oValueHelpDialog) {
                    this._oValueHelpDialog = sap.ui.xmlfragment("com.mindset.accelerator.appfinder.v2.fragment.ValueHelpDialog", this);
                    this.getView().addDependent(this._oValueHelpDialog);
                }
                itemsObj.template = new sap.m.StandardListItem({
                        title: "{" + titleProp + "}",
                        description: descProp ? "{" + descProp + "}" : "",
                        info: infoProp ? "{" + infoProp + "}" : ""
                    });
                oLocalModel.setProperty("/valueHelpDlgTtl", dialogTitle);
                this._oValueHelpDialog.setMultiSelect(sSelectedInputFld === "ShareVariant" ? true:false);
                this._oValueHelpDialog.setConfirmButtonText(sSelectedInputFld === "ShareVariant" ? oBundle.getText("continue"):'');
                this._oValueHelpDialog.bindAggregation("items", itemsObj);
                this._oValueHelpDialog.open();
            },
            /**
             * Function calls when search started on the f4 list
             * Method to filter the list
             * @Param {oEvent} - search event
             */
            onValueHelpSearch: function (oEvent) {
                var oSrc = oEvent.getSource(),
                    sValue = oEvent.getParameter("value"),
                    oSelectedVHFieldName = oLocalModel.getProperty("/VHFieldName"),
                    aFilter=[];
                if (oSelectedVHFieldName === "Version") {
                    if(sValue){
                        aFilter = new Filter({
                            filters: [
                                new Filter("releaseName", FilterOperator.Contains, sValue.toUpperCase()),
                                new Filter("releaseId", FilterOperator.Contains, sValue.toUpperCase()),
                                new Filter("externalName", FilterOperator.Contains, sValue)
                            ],
                            and: false
                        });
                    }
                } else if (oSelectedVHFieldName === "DisplayVariant") {
                    aFilter = new Filter({
                        filters: [
                            new Filter("name", FilterOperator.Contains, sValue),
                            new Filter("email", FilterOperator.EQ, oLocalModel.getProperty("/loggedInUser").Email)
                        ],
                        and: true
                    });
                }
                oSrc.getBinding("items").filter(aFilter);
            },
            /**
             * Function calls when an item gets selected/confirm button pressed
             * Method to set input value based on the selected item
             * @Param {oEvent} - item selection or close button event
             */
            onValueHelpClose: function (oEvent) {
                var oLocalModel = this.getView().getModel("LocalModel");
                var oSelectedVHFieldName = oLocalModel.getProperty("/VHFieldName");
                var oSelectedItem = oEvent.getParameter("selectedItem");
                var oBinding, aSelItems, aShareItems=[],aShareVarNames=[];
                if (!oSelectedItem) {
                    return;
                }
                if (oSelectedVHFieldName === "Version") {
                    oBinding = oSelectedItem.getBindingContext("LocalModel").getObject();
                    oLocalModel.setProperty("/releaseName",oBinding.releaseName);
                    oLocalModel.setProperty("/releaseId",oBinding.releaseId || "");
                } else if (oSelectedVHFieldName === "DisplayVariant") {
                    oBinding = oSelectedItem.getBindingContext("S4AppFinder").getObject();
                    oLocalModel.setProperty("/oSelVariant", $.extend(true,{},oBinding));
                    if(this._iSelectedStepIndex !== 0){
                        this.afterVariantSelection(false);
                    }
                } else if (oSelectedVHFieldName === "ShareVariant") {
                    aSelItems = oEvent.getParameter("selectedItems");
                    for(var i=0; i<aSelItems.length; i++){
                        oBinding = aSelItems[i].getBindingContext("S4AppFinder").getObject();
                        aShareItems.push(oBinding.id);
                        aShareVarNames.push(oBinding.name);
                    }
                    oLocalModel.setProperty("/aSharedVarNames", $.extend(true,[],aShareVarNames));
                    oLocalModel.setProperty("/aShareItems", $.extend(true,[],aShareItems));
                    this.getUsersToShare();
                } else if (oSelectedVHFieldName === "role") {
                    oBinding = oSelectedItem.getBindingContext("LocalModel").getObject();
                    if(oLocalModel.getProperty("/IsVHOriginDlg")){
                        oLocalModel.setProperty("/AssignedRoleDesc", oBinding.name);
                        oLocalModel.setProperty("/AssignedRole", oBinding.roleID);
                        oLocalModel.setProperty("/IsCatEnabled", true);
                        oLocalModel.setProperty("/IsGrpEnabled", true);
                        oLocalModel.setProperty("/AssignedCatDesc", "");
                        oLocalModel.setProperty("/AssignedCat", "");
                        oLocalModel.setProperty("/AssignedCatType", "");
                        oLocalModel.setProperty("/AssignedGrpDesc", );
                        oLocalModel.setProperty("/AssignedGrp", );
                    } else {
                        oLocalModel.setProperty(oLocalModel.getProperty("/MapTblSelRowPath") + "/roleDesc", oBinding.name);
                        oLocalModel.setProperty(oLocalModel.getProperty("/MapTblSelRowPath") + "/roleID", oBinding.roleID);
                        oLocalModel.setProperty(oLocalModel.getProperty("/MapTblSelRowPath") + "/catDesc", "");
                        oLocalModel.setProperty(oLocalModel.getProperty("/MapTblSelRowPath") + "/catID", "");
                        oLocalModel.setProperty(oLocalModel.getProperty("/MapTblSelRowPath") + "/catType", "");
                        oLocalModel.setProperty(oLocalModel.getProperty("/MapTblSelRowPath") + "/groupDesc", );
                        oLocalModel.setProperty(oLocalModel.getProperty("/MapTblSelRowPath") + "/groupID", );
                        oLocalModel.setProperty(oLocalModel.getProperty("/MapTblSelRowPath") + "/IsCatEnabled", true);
                        oLocalModel.setProperty(oLocalModel.getProperty("/MapTblSelRowPath") + "/IsGrpEnabled", true);
                    }
                } else if (oSelectedVHFieldName === "catalog") {
                    oBinding = oSelectedItem.getBindingContext("LocalModel").getObject();
                    if(oLocalModel.getProperty("/IsVHOriginDlg")){
                        oLocalModel.setProperty("/AssignedCatDesc", oBinding.name);
                        oLocalModel.setProperty("/AssignedCat", oBinding.catID);
                        oLocalModel.setProperty("/AssignedCatType", oBinding.type);
                    } else {
                        oLocalModel.setProperty(oLocalModel.getProperty("/MapTblSelRowPath") + "/catDesc", oBinding.name);
                        oLocalModel.setProperty(oLocalModel.getProperty("/MapTblSelRowPath") + "/catID", oBinding.catID);
                        oLocalModel.setProperty(oLocalModel.getProperty("/MapTblSelRowPath") + "/catType", oBinding.type);
                    }
                } else if (oSelectedVHFieldName === "group") {
                    oBinding = oSelectedItem.getBindingContext("LocalModel").getObject();
                    if(oLocalModel.getProperty("/IsVHOriginDlg")){
                        oLocalModel.setProperty("/AssignedGrpDesc", oBinding.name);
                        oLocalModel.setProperty("/AssignedGrp", oBinding.groupID);
                    } else {
                        oLocalModel.setProperty(oLocalModel.getProperty("/MapTblSelRowPath") + "/groupDesc", oBinding.name);
                        oLocalModel.setProperty(oLocalModel.getProperty("/MapTblSelRowPath") + "/groupID", oBinding.groupID);
                    }
                }
            },
            afterVariantSelection: function(bFirstPage){
                var oSelVar = oLocalModel.getProperty("/oSelVariant");
                var aVariantVals = oSelVar.values;
                var sTcodes = [... new Set(aVariantVals.map(function(el){
                    return el.tCode;
                }))];
                //oLocalModel.setProperty("/chooseFromOption", 'M');
                //oLocalModel.setProperty("/PastedTcodes", sTcodes);
                oLocalModel.setProperty("/releaseName",oSelVar.versionDesc || "");
                oLocalModel.setProperty("/releaseId",oSelVar.versionID || "");
                // Get SharedInfo based on Verint data
                let that = this;
                if (oSelVar && oSelVar.shareinfo_id) {
                    let sVerintURL = sServiceUrl + "ShareInfoSet/" + oSelVar.shareinfo_id;
                        ReqHelper.sendGetReq(sVerintURL).then(function (res) {
                            // TBD
                            oLocalModel.setProperty("/oResShareReportSave", res);
                            that.onPressSubmit(sTcodes,true,bFirstPage, function(bNav){
                                if(bNav){
                                    that.handleNextBtnPress();
                                }
                            }.bind(that));
                        }.bind(that))
                            .catch(function (res) {
                                that.handleErrors(res, oBundle);
                        }.bind(that));
                } else {
                    oLocalModel.setProperty("/oResShareReportSave", "");
                    oLocalModel.setProperty("/reportUpdateData", false);
                    this.onPressSubmit(sTcodes,true,bFirstPage, function(bNav){
                        if(bNav){
                            this.handleNextBtnPress();
                        }
                    }.bind(this));
                }                
            },
            selectRows: function(){
                var oTable = this.getView().byId("mainSmartTable").getTable();
                var aRowContexts = oTable.getBinding("rows").getAllCurrentContexts();
                var aVariantVals = oLocalModel.getProperty("/oSelVariant").values;
                var oContext,iIdx, sl=0;
                //oTable.sort("IsSelected", sap.ui.core.SortOrder.Ascending);
                var aSelContexts = aRowContexts.filter(function(el){
                    return el.getObject().IsSelected;
                });
                for(var i=0; i<aSelContexts.length; i++){
                    iIdx = aSelContexts[i].getPath().split("/")[aSelContexts[i].getPath().split("/").length-1];
                    oTable.addSelectionInterval(parseInt(iIdx),parseInt(iIdx));
                }
            },
            displayText:function(sValue){
                var displayValue;
                if(sValue === "WD" || sValue === "W"){
                    displayValue = "BUSINESS Suite";
                }else{
                    displayValue = sValue;
                }
                return displayValue;
            },
            Lighthouse_Values:function(bLighthouseValue){
                if(bLighthouseValue){
                    return "YES";
                }else if(!bLighthouseValue){
                    return "NO";
                }
            }, 
            Remove_SpecialChar:function(sValue){
                var aSplit;
                if(sValue && sValue.length > 0){
                    aSplit = sValue.split("*");
                    sValue = aSplit.join(",").replaceAll("$","");
                    if(sValue[0] === ","){
                        sValue = sValue.replace(",","");
                    }
                    sValue = sValue.replaceAll(",","; ");
                }
                return sValue;
            },       
            onBeforeExport: function (oEvent) {
			    var mExcelSettings = oEvent.getParameter("exportSettings");
                for(var i=0; i<mExcelSettings.workbook.columns.length; i++){
                    mExcelSettings.workbook.columns[i].textAlign = "begin";
                    if(mExcelSettings.workbook.columns[i].property === "GTMLoBName"){
                        mExcelSettings.workbook.columns[i].width = "20em";
                        mExcelSettings.workbook.columns[i].wrap = true; 
                    }
                    if(mExcelSettings.workbook.columns[i].property === "AppName"){
                        mExcelSettings.workbook.columns[i].width = "20em";
                    }
                    if(mExcelSettings.workbook.columns[i].property === "Lighthouse"){
                        mExcelSettings.workbook.columns[i].trueValue = "Yes";
                        mExcelSettings.workbook.columns[i].falseValue = "No";
                    }
                    if(mExcelSettings.workbook.columns[i].property === "FormFactors"){
                        mExcelSettings.workbook.columns[i].width = "13em";
                    }
                    if(mExcelSettings.workbook.columns[i].property === "UITechnology"){
                        mExcelSettings.workbook.columns[i].width = "15em";
                    }
                }
                mExcelSettings.workbook.columns.push({
                    label: "Fiori Apps Library Link",
                    property: "AppLink",
                    width: "42em"
                });
                mExcelSettings.workbook.context.sheetName = "Applications";
            },
            onBeforeRebindTable: function (oEvent) {
                var mBindingParams = oEvent.getParameter("bindingParams");
                
                //Event handlers for the binding
                mBindingParams.events = {
                  "dataReceived" : function(oEvent){
                      var aReceivedData = oEvent.getParameter('data');
                      }
                      //More event handling can be done here
                };
            },
            
            onSelectSegemntBtn:function(oEvent){
                // MER-25
                oLocalModel.setProperty("/sFunctionSortKey", "");
                oLocalModel.setProperty("/sRoleSortKey", "");

                var oSrc       = oEvent.getSource();
                var aTableData = oLocalModel.getProperty("/Apps");
                var aIndices = this.getView().byId("mainSmartTable").getTable().getBinding("rows").aIndices;
                var aFinalArray = [];
                if(oEvent.getSource().getSelectedKey() === "Chart"){
                    this.getView().byId('idVizFrame2').addEventDelegate({
                        onAfterRendering: function () {
                            this.getView().byId('idVizFrame2').setLegendVisible(false);
                        }
                    }, this);
                    this.getView().byId('idVizFrame3').addEventDelegate({
                        onAfterRendering: function () {
                            this.getView().byId('idVizFrame3').setLegendVisible(false);
                        }
                    }, this);
                    aIndices.forEach(function(indIdx, IndcObj){
                            for(var Idx = 0; Idx < aTableData.length; Idx++){
                                if(Idx === indIdx){
                                    aFinalArray.push(aTableData[Idx]);
                                }
                            }
                    });
                    this.getUniqueFucArea(oLocalModel.getProperty("/Apps"));
                    if(aFinalArray && aFinalArray.length > 0 ){
                        this.make_Separate_Reuslts(aFinalArray, oLocalModel.getProperty("/aFunArea"));
                    }else{
                        this.make_Separate_Reuslts(aTableData, oLocalModel.getProperty("/aFunArea"));
                    }
                }
            },
            getUniqueFucArea: function(aItems){
                var aFunArea = [], aSplitArr =[];
                aItems.forEach(element => {
                    if(element.GTMLoBName){
                        if(element.GTMLoBName.indexOf(";") !== -1){
                            aSplitArr = element.GTMLoBName.split(";");
                        } else {
                            aSplitArr = element.GTMLoBName.split(",");
                        }
                        for(var sIdx = 0; sIdx < aSplitArr.length; sIdx++){
                            aFunArea.push(aSplitArr[sIdx].trim());
                        }
                    }
                });
                aFunArea = [... new Set(aFunArea)];
                oLocalModel.setProperty("/aFunArea",aFunArea);
            },
            onPressInfoBtn: function(oEvent){
                var oButton = oEvent.getSource(),
				oView = this.getView();

                // create popover
                if (!this._pPopover) {
                    this._pPopover = sap.ui.core.Fragment.load({
                        id: oView.getId(),
                        name: "com.mindset.accelerator.appfinder.v2.fragment.Main.InfoPopover",
                        controller: this
                    }).then(function(oPopover) {
                        oView.addDependent(oPopover);
                        return oPopover;
                    });
                }
                this._pPopover.then(function(oPopover) {
                    oPopover.openBy(oButton);
                });
            },
            onDownloadTemp: function(){
                var oExport = new Export({
                    exportType : new ExportTypeCSV({
                         charset: "utf-8" ,
                         fileExtension: "csv"
                    }),
                    models : oLocalModel,
                    rows : {
                        path : "/DUMMY"
                    },
                    columns : [{
                        name: "Tcode"
                    }]
                });
    
                // download exported file
                oExport.saveFile("S4_Tcodes").catch(function(oError) {
                    MessageBox.error(oBundle.getText("exportError") + oError);
                }).then(function() {
                    oExport.destroy();
                });
            },
            onChangeUpload: function (oEvent) {
                var file = oEvent.getParameter("files") ? oEvent.getParameter("files")[0] : "";
                var excelData;
                var oBusyDialog = new sap.m.BusyDialog({
                    text: oBundle.getText("loadingText")
                });
                oBusyDialog.open();
                if (file && window.FileReader) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        oBusyDialog.close();
                        var data = e.target.result;
                        var workbook = XLSX.read(data, {
                            type: "binary",
                            cellText: true,
                            cellDates: true,
                            raw: true
                        });
                        var jsonData = workbook.SheetNames.reduce(function(initial, name) {
                            const sheet = workbook.Sheets[name];
                            initial[name] = XLSX.utils.sheet_to_json(sheet);
                            return initial;
                        }, {});
                        excelData = jsonData[workbook.SheetNames[0]];
                        if(oLocalModel.getProperty("/chooseFromOption") === 'U'){
                            if(excelData && excelData.length > 0 && excelData[0].Tcode){
                                excelData = excelData.map(function(el){
                                    if(el.Tcode){
                                        return el.Tcode;
                                    }
                                });
                            } else {
                                excelData = [];
                            }

                            // MER -26 Graphical Representation of Top Transactions Used
                            oLocalModel.setProperty("/aExcelTopSelectedFinalDataResult", []);
                            oLocalModel.setProperty("/aExcelFinalDataResultKeys", []);
                            oLocalModel.setProperty("/aExcelTopFinalDataResult", []);
                            oLocalModel.setProperty("/aExcelFinalDataResultSelectKeys", "");

                        }else if(oLocalModel.getProperty("/chooseFromOption") === 'ST'){
                            // MER-26 Graphical Representation of Top Transactions Used
                            this.onHandelSortingTopTenData(structuredClone(jsonData[workbook.SheetNames[0]]) || []);

                            if(excelData && excelData.length > 0 && (excelData[0]["Report or Transaction name"] || excelData[0]['Tcode'])){
                                excelData = excelData.map(function(el){
                                    if(el["Report or Transaction name"]){
                                        return el["Report or Transaction name"];
                                    } else if (el['Tcode']){
                                        return el['Tcode'];
                                    }
                                });
                            } else {
                                excelData = [];
                            }
                        } else {
                            // MER -26 Graphical Representation of Top Transactions Used
                            oLocalModel.setProperty("/aExcelTopSelectedFinalDataResult", []);
                            oLocalModel.setProperty("/aExcelFinalDataResultKeys", []);
                            oLocalModel.setProperty("/aExcelTopFinalDataResult", []);
                            oLocalModel.setProperty("/aExcelFinalDataResultSelectKeys", "");
                        }
                        oLocalModel.setProperty("/ExcelTcodes", excelData);
                    }.bind(this);
                    reader.onerror = function (error) {
                        oBusyDialog.close();
                        console.log(error);
                    };
                    reader.readAsBinaryString(file);
                }
            },
            makePromiseAjaxCall: function(tCode,url){
                var that = this;
                var oDataModel = this.getView().getModel();
                var sVersion = oLocalModel.getProperty("/releaseId") || "";
                var aFilter=[], aFuncAreas;
                if(sVersion){
                    aFilter.push(new Filter("otherReleases", FilterOperator.Contains, '"fallBackReleaseId\":\"'+sVersion +'\"'));
                }
                return new Promise(function(resolve) {
                    oDataModel.read(url, {
                        //filters: aFilter,
                        urlParameters: {
                            "$select": "otherReleases,appId,RoleName,HighlightedAppsCombined,FormFactors,ApplicationType,UITechnologyCombined,GTMLoBName,AppName,releaseId,BSPApplicationURL,BSPName,ODataServicesCombined,BusinessRoleNameCombined,BusinessCatalog,TechnicalCatalog,IntentsCombined,BusinessGroupNameCombined"
                        },
                        success: function(oData) {
                            if(oData && oData.results && oData.results.length > 0){
                                oData.results = oData.results.filter(function(el){
                                    return (el.otherReleases && el.otherReleases.indexOf(sVersion) !== -1);
                                });
                            }
                            for(var i=0; i<oData.results.length; i++){
                                if(oData.results[i].GTMLoBName){
                                    if(oData.results[i].GTMLoBName.indexOf(";") !== -1){
                                        aFuncAreas = oData.results[i].GTMLoBName.split(";");
                                    } else {
                                        aFuncAreas = oData.results[i].GTMLoBName.split(",");
                                    }
                                    oData.results[i]["LoB"] = aFuncAreas.map(function(el){
                                        return {FA: el.trim()};
                                    });
                                }
                                oData.results[i]["TechnicalCatalog"] = oData.results[i].TechnicalCatalog ? oData.results[i].TechnicalCatalog.replaceAll(",","; ").replaceAll("|","; ") : "";
                                oData.results[i]["BusinessCatalog"] = oData.results[i].BusinessCatalog ? oData.results[i].BusinessCatalog.replaceAll(",","; ") : "";
                                oData.results[i]["TargetMapping"] = that.Remove_SpecialChar(oData.results[i].IntentsCombined);
                                oData.results[i]["BusinessGroup"] = that.Remove_SpecialChar(oData.results[i].BusinessGroupNameCombined);
                                
                                oData.results[i]["BusinessRole"] = that.Remove_SpecialChar(oData.results[i].BusinessRoleNameCombined);
                                oData.results[i]["oDataSrv"] = that.Remove_SpecialChar(oData.results[i].ODataServicesCombined);
                                oData.results[i]["AppLink"] = "https://fioriappslibrary.hana.ondemand.com/sap/fix/externalViewer/#/detail/Apps('"+oData.results[i].appId+"')/"+oData.results[i].releaseId;
                                oData.results[i]["UITechnology"] = oData.results[i].UITechnologyCombined.substring(1, oData.results[i].UITechnologyCombined.length-1);
                                oData.results[i]["Lighthouse"] = oData.results[i].HighlightedAppsCombined === '$LH$' ? true : false;
                                oData.results[i]["TCode"] = tCode.toUpperCase();
                            }
                            resolve(oData);
                        }.bind(this),
                        error: function(oError) {
                            //reject(oError);
                          var oData = {
                                results:[]
                            };
                            // var  oData = {
                            //     results:[{
                            //         "TCode": tCode.toUpperCase(),
                            //         "GTMLoBName": "INVALID",
                            //         "LoB": [{FA: "INVALID"}]
                            //     }]
                            // };
                            resolve(oData);
                        }
                    });
                }.bind(this))
            },
            make_Separate_Reuslts:function(aFinal, aFunArea){
                aFinal = $.extend(true, [], aFinal);
                var aTempReuslts = [], aChartDataSet=[], sObj={};
        	    for(var i=0; i < aFunArea.length; i++){
                    aTempReuslts = aFinal.filter(function(el){
                        return el.GTMLoBName &&el.GTMLoBName.indexOf(aFunArea[i]) !== -1;
                    });
                    sObj = {
                        "Functional Area":aFunArea[i],
                        "App Count":aTempReuslts.length
                    };
                    oLocalModel.setProperty("/"+aFunArea[i].replace(/[\/\\#,+()$~%.'":*?<>{}]/g, ' ').replace("&", " and ")+"_Results",$.extend(true, [], aTempReuslts));
                    aChartDataSet.push(sObj);
	            }
                oLocalModel.setProperty("/aChartDataByFunArea",aChartDataSet);
                // TBD MER-25
                this.aChartDataClone = structuredClone(oLocalModel.getProperty("/aChartDataByFunArea"));

                aChartDataSet = [];
                aTempReuslts = [];
                for(var i=0; i < oLocalModel.getProperty("/aAppTypes").length; i++){
                    aTempReuslts = aFinal.filter(function(el){
                        return el.ApplicationType && el.ApplicationType.indexOf(oLocalModel.getProperty("/aAppTypes")[i]) !== -1;
                    });
		        	
                    sObj = {
                        "Application Type":oLocalModel.getProperty("/aAppTypes")[i],
                        "App Count":aTempReuslts.length
                    };
                    
                    aChartDataSet.push(sObj);
	            }
                oLocalModel.setProperty("/aChartDataByAppType",aChartDataSet);
                aChartDataSet = [];
                aTempReuslts = [];
                for(var i=0; i < oLocalModel.getProperty("/aUiTechnology").length; i++){
                    aTempReuslts = aFinal.filter(function(el){
                        return el.UITechnology && el.UITechnology.indexOf(oLocalModel.getProperty("/aUiTechnology")[i]) !== -1;
                    });
		        	
                    sObj = {
                        "UITechnology":oLocalModel.getProperty("/aUiTechnology")[i],
                        "App Count":aTempReuslts.length
                    };
                    
                    aChartDataSet.push(sObj);
	            }
                oLocalModel.setProperty("/aChartDataByUITech",aChartDataSet);

                aChartDataSet = [];
                aTempReuslts = [];
                for(var i=0; i < oLocalModel.getProperty("/aJobRole").length; i++){
                    aTempReuslts = aFinal.filter(function(el){
                        return el.RoleName && el.RoleName.indexOf(oLocalModel.getProperty("/aJobRole")[i]) !== -1;
                    });
		        	
                    sObj = {
                        "Job Role":oLocalModel.getProperty("/aJobRole")[i],
                        "App Count":aTempReuslts.length
                    };
                    
                    aChartDataSet.push(sObj);
	            }
                oLocalModel.setProperty("/aChartDataByJobRole",aChartDataSet);
                // TBD MER-25
                this.aChartRoleDataClone = structuredClone(oLocalModel.getProperty("/aChartDataByJobRole"));

                var aAppsFromNone = aFinal.filter(function(el){
                    return el.GTMLoBName === "";
                });
                oLocalModel.setProperty("/NONE", aAppsFromNone);
            },
            onLoadDrpDwnItems: function(oEvent){
                var oSrc = oEvent.getSource();
                var sSelUICntrl = oSrc.data('control');
                var sPath = oEvent.getSource().getParent().getBindingContext("LocalModel").getPath();
                var sRole = oLocalModel.getProperty(sPath+"/roleID");
                var aRoles = oLocalModel.getProperty("/Role");
                var iRoleIdx = aRoles.findIndex(function(el){ return el.Id === sRole});
                var itemsObj = {};
                if(sSelUICntrl === "catalog"){
                    itemsObj.path = "LocalModel>/Role/"+iRoleIdx+"/Catalog";
                    itemsObj.template = new sap.ui.core.Item({
                        text: "{LocalModel>Name}",
                        key: "{LocalModel>Id}",
                        additionalText: "{LocalModel>Type}"
                    });
                } else {
                    itemsObj.path = "LocalModel>/Role/"+iRoleIdx+"/Group";
                    itemsObj.template = new sap.ui.core.Item({
                        text: "{LocalModel>Name}",
                        key: "{LocalModel>Id}"
                    });
                }
                itemsObj.model = oLocalModel;
                itemsObj.sorter = new Sorter("Name", false);
                oSrc.bindAggregation("items", itemsObj);
            },
            onChangeRole: function(oEvent, sSrc){
                var oSrc = oEvent.getSource();
                var sBindingPath = oEvent.getParameter("selectedItem").getBindingContext("LocalModel").getPath();
                var oCatSelCtrl,oGrpSelCtrl,itemsObj = {};
                if(sSrc === "C"){
                    oCatSelCtrl = oSrc.getParent().getCells()[4];
                    oGrpSelCtrl = oSrc.getParent().getCells()[5];
                    this.IsCellEventTriggerd = true;
                } else {
                    oCatSelCtrl = sap.ui.getCore().byId("assignCatSelCntrl");
                    oGrpSelCtrl = sap.ui.getCore().byId("assignGrpSelCntrl");
                }
                itemsObj.path = "LocalModel>"+sBindingPath+"/Catalog";
                itemsObj.model = oLocalModel;
                itemsObj.sorter = new Sorter("Name", false);
                itemsObj.template = new sap.ui.core.Item({
                    text: "{LocalModel>Name}",
                    key: "{LocalModel>Id}",
                    additionalText: "{LocalModel>Type}"
                });
                oCatSelCtrl.bindAggregation("items", itemsObj);
                itemsObj.path = "LocalModel>"+sBindingPath+"/Group";
                oGrpSelCtrl.bindAggregation("items", itemsObj);
                
            },
            onChangeCatFromTblCell: function(oEvent){
                var sPath = oEvent.getSource().getParent().getBindingContext("LocalModel").getPath();
                var sCatDesc = oEvent.getSource().getSelectedItem().getBindingContext("LocalModel").getObject().Name;
                oLocalModel.setProperty(sPath + "/catDesc", sCatDesc);
            },
            onChangeGroupFromTblCell: function(oEvent){
                var sPath = oEvent.getSource().getParent().getBindingContext("LocalModel").getPath();
                var sGrpDesc = oEvent.getSource().getSelectedItem().getBindingContext("LocalModel").getObject().Name;
                oLocalModel.setProperty(sPath + "/groupDesc", sGrpDesc);
            },
            onChangeCatFromPopup: function(oEvent){
                var sCatDesc = oEvent.getSource().getSelectedItem().getBindingContext("LocalModel").getObject().Name;
                oLocalModel.setProperty("/AssignedCatDesc", sCatDesc);
            },
            onChangeGrpFromPopup: function(oEvent){
                var sGrpDesc = oEvent.getSource().getSelectedItem().getBindingContext("LocalModel").getObject().Name;
                oLocalModel.setProperty("/AssignedGrpDesc", sGrpDesc);
            },
            onChangeRoleFromTblCell: function(oEvent){
                var sPath = oEvent.getSource().getParent().getBindingContext("LocalModel").getPath();
                var sRoleDesc = oEvent.getSource().getSelectedItem().getBindingContext("LocalModel").getObject().Name;
                oLocalModel.setProperty(sPath + "/roleDesc", sRoleDesc);
                // if(this.IsCellEventTriggerd){
                //     oLocalModel.setProperty(sPath + "/catID" , "");
                //     oLocalModel.setProperty(sPath + "/groupID" , "");
                //     oLocalModel.setProperty(sPath + "/catDesc", "");
                //     oLocalModel.setProperty(sPath + "/groupDesc", "");
                // }
                oLocalModel.setProperty(sPath + "/IsCatEnabled", true);
                oLocalModel.setProperty(sPath + "/IsGrpEnabled", true);
                //this.onChangeRole(oEvent,"C");
            },
            onChangeRoleFromPopup: function(oEvent){
                var sRoleDesc = oEvent.getSource().getSelectedItem().getBindingContext("LocalModel").getObject().Name;
                oLocalModel.setProperty("/AssignedRoleDesc", sRoleDesc);
                oLocalModel.setProperty("/IsCatEnabled", true);
                oLocalModel.setProperty("/IsGrpEnabled", true);
                this.onChangeRole(oEvent,"P");
            },
            onFnshMapCatGrpToRole: function(oEvent){
                var sSrc = oEvent.getSource().data("key");
                var aCatalog = oLocalModel.getProperty("/Catalog");
                var aGroup = oLocalModel.getProperty("/Group");
                var iIndex;
                var aSelItems = oEvent.getParameter("selectedItems");
                var sRowBinding = oEvent.getSource().getParent().getBindingContext("LocalModel").getObject();
                var sRowBindingPath = oEvent.getSource().getParent().getBindingContext("LocalModel").getPath();
                for(var i=0; i<aSelItems.length; i++){
                    if(sSrc === 'C'){
                        iIndex = aCatalog.findIndex(function(el){ return el.catID === aSelItems[i].getBindingContext("LocalModel").getObject().catID});
                        aCatalog[iIndex].role = aCatalog[iIndex].role ? aCatalog[iIndex].role : [];
                        if(!aCatalog[iIndex].role.find(function(el){ return el === sRowBinding.roleID})){
                            aCatalog[iIndex].IsUpdated = true;
                            aCatalog[iIndex].role.push(sRowBinding.roleID);
                        }
                        
                    } else {
                        iIndex = aGroup.findIndex(function(el){ return el.groupID === aSelItems[i].getBindingContext("LocalModel").getObject().groupID});
                        aGroup[iIndex].role = aGroup[iIndex].role ? aGroup[iIndex].role : [];
                        if(!aGroup[iIndex].role.find(function(el){ return el === sRowBinding.roleID})){
                            aGroup[iIndex].IsUpdated = true;
                            aGroup[iIndex].role.push(sRowBinding.roleID);
                        }
                    }
                }
                oLocalModel.setProperty("/Catalog", $.extend(true,[],aCatalog));
                oLocalModel.setProperty("/Group", $.extend(true,[],aGroup));
                oLocalModel.setProperty(sRowBindingPath+"/IsUpdated", true);
            },
            onTapWizardStep: function(oEvent){
                var oParams = oEvent.getParameters();
                var sSelStepID = oParams.step.getId();
                this._iSelectedStepIndex = this._oWizard.getSteps().findIndex(function(el){
                    return el.getId() == sSelStepID;
                });
                this._oWizard.goToStep(oParams.step, true);
                this._oSelectedStep = oParams.step;
                for(var i=this._iSelectedStepIndex+1; i<this._oWizard.getSteps().length; i++){
                    this._oWizard.getSteps()[i].setValidated(false);
                }
                this.handleButtonsVisibility(true);
            },
            onNextButtonPress: function () {
                var aSelectedIdx, oBinding, aSelectedApps=[];
                // MER-177
                if (!oLocalModel.getProperty("/customerName")) {
                    MessageToast.show(oBundle.getText("mandtCheck"));
                } else {
                    // MER-178: Hide Active/CGR/Mapping sections
                    // switch (this._iSelectedStepIndex) {
                    //     case 0:
                    //         if(oLocalModel.getProperty("/chooseFromOption") === 'V'){
                    //             if(!oLocalModel.getProperty("/oSelVariant/name")){
                    //                 MessageToast.show(oBundle.getText("mandtCheck"));
                    //                 return;
                    //             }
                    //             this.afterVariantSelection(true);
                    //         } else if (oLocalModel.getProperty("/chooseFromOption") === 'M') {
                    //             if(!oLocalModel.getProperty("/PastedTcodes")){
                    //                 MessageToast.show(oBundle.getText("mandtCheck"));
                    //                 return;
                    //             }
                    //             this.onPressSubmit(null,null,false,function(){
                    //                 this.handleNextBtnPress();
                    //             }.bind(this));
                    //         } else {
                    //             if(!oLocalModel.getProperty("/File")){
                    //                 MessageToast.show(oBundle.getText("mandtCheck"));
                    //                 return;
                    //             }
                    //             this.onPressSubmit(null,null,false,function(){
                    //                 this.handleNextBtnPress();
                    //             }.bind(this));
                    //         }
                    //         break;
                    //     case 1:
                    //         aSelectedIdx = this.getView().byId("mainSmartTable").getTable().getSelectedIndices();
                    //         for(var i=0; i<aSelectedIdx.length; i++){
                    //             oBinding = this.getView().byId("mainSmartTable").getTable().getBinding("rows").getAllCurrentContexts()[aSelectedIdx[i]].getObject();
                    //             aSelectedApps.push(oBinding);
                    //         }
                    //         if(aSelectedApps.length === 0){
                    //             MessageToast.show(oBundle.getText("appsNoSelectWarning"));
                    //             return;
                    //         }
                    //         oLocalModel.setProperty("/AppsReadyForActivation", $.extend(true,[],aSelectedApps));
                    //         this.getView().byId("activationSmartTable").rebindTable();
                            
                    //         this.handleNextBtnPress();
                    //         break;
                    //     case 2:
                    //         //comment below code to bypass capm service if it's down & uncomment once it is up
                    //         this.saveActivateApps(function(){
                    //             this.loadBusyIndicator("activationPage",true);
                    //             this._getCGR(sServiceUrl + "CatalogSet", "/Catalog", "C", function(){
                    //                 this._getCGR(sServiceUrl + "GroupSet", "/Group", "G", function(){
                    //                     this._getCGR(sServiceUrl + "RoleSet", "/Role", "R");
                    //                     this.loadBusyIndicator("activationPage",false);
                    //                     this.handleNextBtnPress();
                    //                 }.bind(this));
                    //             }.bind(this));   
                    //         }.bind(this));
                            
                    //         //comment below line if capm service is up & running & uncomment when it is down
                    //         //this.handleNextBtnPress();
                    //         break;
                    //     case 3:
                    //         //comment below code to bypass capm service if it's down & uncomment once it is up
                    //         this.loadBusyIndicator("launchpadConfigPage",true);
                    //         Promise.all([this.saveRole(), this.saveCatalog(), this.saveGroup()]).then(function(values){
                    //             this.loadBusyIndicator("launchpadConfigPage",false);
                    //             oLocalModel.setProperty("/AssignApps", $.extend(true,[],oLocalModel.getProperty("/AppsReadyForActivation")));
                    //             oLocalModel.setProperty("/MapTblSelCtxPaths",[]);
                    //             oLocalModel.setProperty("/massConfigBtlEnabe", false);
                    //             this.getView().byId("MapTbl").rebindTable();
                    //             this._getCGR(sServiceUrl + "CatalogSet", "/Catalog", "C", function(){
                    //                 this._getCGR(sServiceUrl + "GroupSet", "/Group", "G", function(){
                    //                     this._getCGR(sServiceUrl + "RoleSet", "/Role", "R");
                    //                     this.handleNextBtnPress();
                    //                 }.bind(this));
                    //             }.bind(this));
                    //         }.bind(this)).catch(function (error) {
                    //             this.loadBusyIndicator("launchpadConfigPage",false);
                    //             this.handleErrors(oBundle.getText("invalidTcodesErr"),null);
                    //         }.bind(this));
                            

                    //         //comment below code if capm service is up & running & uncomment when it is down
                    //         /*
                    //         this.handleNextBtnPress();
                    //         oLocalModel.setProperty("/AssignApps", $.extend(true,[],oLocalModel.getProperty("/AppsReadyForActivation")));
                    //         oLocalModel.setProperty("/MapTblSelCtxPaths",[]);
                    //         oLocalModel.setProperty("/massConfigBtlEnabe", false);
                    //         this.getView().byId("MapTbl").rebindTable();
                    //         */
                    //         break;
                    //     case 4:
                    //         var bIsValidated = this.validateMapping();
                    //         if(!bIsValidated){
                    //             MessageBox.warning(oBundle.getText("validtnError"), {
                    //                 actions: ["Proceed", MessageBox.Action.CANCEL],
                    //                 emphasizedAction: "Proceed",
                    //                 onClose: function (sAction) {
                    //                     if(sAction == "Proceed"){
                    //                         this.getView().byId("reviewSmartTable").rebindTable();
                    //                         this.handleNextBtnPress();
                    //                     }
                    //                 }.bind(this)
                    //             });
                    //         } else {
                    //             this.getView().byId("reviewSmartTable").rebindTable();
                    //             this.handleNextBtnPress();
                    //         }
                    //         break;
                    //     default:
                    //         this.handleNextBtnPress();
                    //         break;
                    // }
                

                    // MER-178 : Hide Active/CGR/Mapping sections
                    switch (this._iSelectedStepIndex) {
                        case 0:
                            if(oLocalModel.getProperty("/chooseFromOption") === 'V'){
                                if(!oLocalModel.getProperty("/oSelVariant/name")){
                                    MessageToast.show(oBundle.getText("mandtCheck"));
                                    return;
                                }
                                this.afterVariantSelection(true);
                            } else if (oLocalModel.getProperty("/chooseFromOption") === 'M') {
                                if(!oLocalModel.getProperty("/PastedTcodes")){
                                    MessageToast.show(oBundle.getText("mandtCheck"));
                                    return;
                                }
                                this.onPressSubmit(null,null,false,function(){
                                    this.handleNextBtnPress();
                                }.bind(this));
                            } else {
                                if(!oLocalModel.getProperty("/File")){
                                    MessageToast.show(oBundle.getText("mandtCheck"));
                                    return;
                                }
                                this.onPressSubmit(null,null,false,function(){
                                    this.handleNextBtnPress();
                                }.bind(this));
                            }
                            break;                    
                       case 1: 
                            var aPromises = [];                            
                            // this.loadBusyIndicator("reviewPage",true);
                            var that = this;
                            
                            aPromises.push(new Promise(
                                function (resolve) {
                                    sap.ui.core.BusyIndicator.show(0);
                                    aSelectedIdx = that.getView().byId("mainSmartTable").getTable().getSelectedIndices();
                                    let oContexts = that.getView().byId("mainSmartTable").getTable().getBinding("rows").getAllCurrentContexts();
                                    for(var i=0; i<aSelectedIdx.length; i++){
                                        oBinding = oContexts[aSelectedIdx[i]].getObject();
                                        aSelectedApps.push(oBinding);
                                    }
                                    if(aSelectedApps.length === 0){
                                        MessageToast.show(oBundle.getText("appsNoSelectWarning"));
                                        sap.ui.core.BusyIndicator.hide();
                                        return;
                                    }

                                    oLocalModel.setProperty("/AppsReadyForActivation", $.extend(true,[],aSelectedApps));
                                    oLocalModel.setProperty("/AssignApps", $.extend(true,[], aSelectedApps));

                                    if (aSelectedApps && aSelectedApps.length > 0) {
                                        oLocalModel.setProperty("/AssignAppsEnable", true);
                                    } else {
                                        oLocalModel.setProperty("/AssignAppsEnable", false)
                                    }
                                    if (resolve) 
                                        resolve();
                            }));
                            Promise.all(aPromises).then(
                                function () {
                                    sap.ui.core.BusyIndicator.hide();
                                    // that.loadBusyIndicator("reviewPage", false);
                                    that.getView().byId("reviewSmartTable").rebindTable();                            
                                    that.handleNextBtnPress();
                                    if (oLocalModel.getProperty("/AssignApps") && oLocalModel.getProperty("/AssignApps").length > 0) {
                                        oLocalModel.setProperty("/AssignAppsEnable", true);
                                    } else {
                                        oLocalModel.setProperty("/AssignAppsEnable", false)
                                    } 
                            });               
                            break;
                            
                        default:
                            this.handleNextBtnPress();
                            break;
                    }
                }
            },
            handleNextBtnPress: function(){
                this._iSelectedStepIndex = this._oWizard.getSteps().indexOf(this._oSelectedStep);
                var oNextStep = this._oWizard.getSteps()[this._iSelectedStepIndex + 1];

                if (this._oSelectedStep && !this._oSelectedStep.bLast) {
                    this._oWizard.goToStep(oNextStep, true);
                } else {
                    this._oWizard.nextStep();
                }
    
                this._iSelectedStepIndex++;
                this._oSelectedStep = oNextStep;
    
                this.handleButtonsVisibility();
            },
            validateMapping: function(){
                var aApps = oLocalModel.getProperty("/AssignApps");
                var bFlag = true;
                for(var i=0; i<aApps.length; i++){
                    oLocalModel.setProperty("/AssignApps/"+i+"/ValueState", "None");
                    if(!aApps[i].roleID || !aApps[i].catID || !aApps[i].groupID){
                        bFlag = false;
                        oLocalModel.setProperty("/AssignApps/"+i+"/ValueState", "Warning");
                    }
                }
                return bFlag;
            },
            onPreviousButtonPress: function () {
                switch (this._iSelectedStepIndex) {
                    case 2:
                        this.handlePrevBtnPress();
                        break;
                    default:
                        this.handlePrevBtnPress();
                        break;
                } 
            },
            handlePrevBtnPress: function () {
                this._iSelectedStepIndex = this._oWizard.getSteps().indexOf(this._oSelectedStep);
                var oPreviousStep = this._oWizard.getSteps()[this._iSelectedStepIndex - 1];
    
                if (this._oSelectedStep) {
                    this._oWizard.goToStep(oPreviousStep, true);
                } else {
                    this._oWizard.previousStep();
                }

                this._iSelectedStepIndex--;
                this._oSelectedStep = oPreviousStep;
    
                this.handleButtonsVisibility(true);
            },
            _makeTblExprtReady: function(aItems){
                this.getUniqueFucArea(aItems);
                this.make_Separate_Reuslts(aItems, oLocalModel.getProperty("/aFunArea"));
            },
            saveCatalog: function(){
                var aCatalog = oLocalModel.getProperty("/Catalog");
                return new Promise(function(resolve,reject) {
                    this.saveCGR(aCatalog, 'C', resolve,reject);
                }.bind(this));
            },
            saveGroup: function(){
                var aGroup = oLocalModel.getProperty("/Group");
                return new Promise(function(resolve,reject) {
                    this.saveCGR(aGroup, 'G', resolve,reject);
                }.bind(this));
            },
            saveRole: function(fnCallback){
                var aRole = oLocalModel.getProperty("/Role");
                return new Promise(function(resolve,reject) {
                    this.saveCGR(aRole, 'R', resolve,reject);
                }.bind(this));
            },
            saveCGR: function(aCGR, configType, resolve,reject){
                var sUrl, oPayload={}, bNothingToPost=true;
                if(aCGR && aCGR.length > 0){
                    for(var i=0; i<aCGR.length; i++){
                        oPayload={};
                        if(aCGR[i].IsNew){
                            bNothingToPost = false;
                            oPayload.user_id = oLocalModel.getProperty("/loggedInUser/keyID");
                            oPayload.name = aCGR[i].name;
                            switch (configType) {
                                case 'C':
                                    sUrl = sServiceUrl + "CatalogSet";
                                    oPayload.catID = aCGR[i].catID;
                                    oPayload.type = aCGR[i].type;
                                    oPayload.role = aCGR[i].role;
                                    break;
                                case 'G':
                                    sUrl = sServiceUrl + "GroupSet";
                                    oPayload.groupID = aCGR[i].groupID;
                                    oPayload.role = aCGR[i].role;
                                    break;
                                case 'R':
                                    sUrl = sServiceUrl + "RoleSet";
                                    oPayload.roleID = aCGR[i].roleID;
                                    oPayload.catalog = aCGR[i].catalog;
                                    oPayload.group = aCGR[i].group;
                                    break;
                                default:
                                    break;
                            }
                            ReqHelper.sendCreateReq(sUrl, oPayload).then(function (oRes) {
                                    resolve();
                                }.bind(this))
                                .catch(function (response) {
                                    reject(response);
                            }.bind(this));
                        } else if(aCGR[i].IsUpdated) {
                            bNothingToPost = false;
                            switch (configType) {
                                case 'C':
                                    sUrl = sServiceUrl + "CatalogSet/"+ aCGR[i].id;
                                    oPayload.role = aCGR[i].role;
                                    break;
                                case 'G':
                                    sUrl = sServiceUrl + "GroupSet/"+ aCGR[i].id;
                                    oPayload.role = aCGR[i].role;
                                    break;
                                case 'R':
                                    sUrl = sServiceUrl + "RoleSet/"+ aCGR[i].id;
                                    oPayload.catalog = aCGR[i].catalog;
                                    oPayload.group = aCGR[i].group;
                                    break;
                                default:
                                    break;
                            }
                            ReqHelper.sendUpdateReq(sUrl, oPayload).then(function (response) {
                                resolve();
                                }.bind(this))
                                .catch(function (response) {
                                    reject(response);
                            }.bind(this));
                        }
                    }
                    if(bNothingToPost){
                        resolve();
                    }
                } else {
                    resolve();
                }
            },
            _getCGR: function(sUrl, sPath, configType, fnCallback){
                sUrl += "?$filter=user_id eq "+oLocalModel.getProperty("/loggedInUser/keyID");
                ReqHelper.sendGetReq(sUrl).then(function (response) {
                    if(response && response.value && response.value.length > 0){
                        var aCatalog = oLocalModel.getProperty("/Catalog");
                        var aGroup = oLocalModel.getProperty("/Group");
                        if(response && response.value){
                            if(configType === "R"){
                                for(var i=0; i<response.value.length; i++){
                                    response.value[i].AllotCatalogs = [];
                                    response.value[i].AllotGroups = [];
                                    for(var j=0; j<response.value[i].catalog.length; j++){
                                        response.value[i].AllotCatalogs.push(aCatalog.find(function(el){ return el.catID === response.value[i].catalog[j]}));
                                    }
                                    for(var k=0; k<response.value[i].group.length; k++){
                                        response.value[i].AllotGroups.push(aGroup.find(function(el){ return el.groupID === response.value[i].group[k]}));
                                    }
                                }
                            } else {
                                fnCallback();
                            }
                            oLocalModel.setProperty(sPath, response.value);
                        }
                    } else {
                        fnCallback();
                    }
                }.bind(this))
                    .catch(function (response) {
                        this.handleErrors(response,oBundle);
                }.bind(this));
            },
            saveActivateApps: function(fnCallback){
                var aApps = oLocalModel.getProperty("/AppsReadyForActivation");
                var sUrl = sServiceUrl + "UserSet/" + oLocalModel.getProperty("/loggedInUser/keyID");
                var oPayload={
                    activateApps: []
                };
                for(var i=0; i<aApps.length; i++){
                    oPayload.activateApps.push({
                        tCode: aApps[i].TCode,
                        appID: aApps[i].appId
                    });
                }
                this.loadBusyIndicator("activationPage",true);
                ReqHelper.sendUpdateReq(sUrl, oPayload).then(function (response) {
                        this.loadBusyIndicator("activationPage",false);
                        MessageToast.show(oBundle.getText("saveSuccess"));
                        fnCallback();
                    }.bind(this))
                    .catch(function (response) {
                        this.loadBusyIndicator("activationPage",false);
                        this.handleErrors(response,null);
                }.bind(this));
            },
            onDeleteCGR: function(oEvent){
                var oSrc = oEvent.getSource().data("configType");
                var sID = oEvent.getSource().getBindingContext("LocalModel").getObject().id;
                var sUrl;
                switch (oSrc) {
                    case 'C':
                        sUrl = sServiceUrl + "CatalogSet/" + sID;
                        break;
                    case 'G':
                        sUrl = sServiceUrl + "GroupSet/" + sID;
                        break;
                    case 'R':
                        sUrl = sServiceUrl + "RoleSet/" + sID;
                        break;
                    default:
                        break;
                }
                this.loadBusyIndicator("launchpadConfigPage",true);
                ReqHelper.sendDeleteReq(sUrl).then(function (response) {
                        this.loadBusyIndicator("launchpadConfigPage",false);
                        switch (oSrc) {
                            case 'C':
                                this._getCGR(sServiceUrl + "CatalogSet", "/Catalog", "C");
                                break;
                            case 'G':
                                this._getCGR(sServiceUrl + "GroupSet", "/Group", "G");
                                break;
                            case 'R':
                                this._getCGR(sServiceUrl + "RoleSet", "/Role", "R");
                                break;
                            default:
                                break;
                        }
                    }.bind(this))
                    .catch(function (response) {
                        this.loadBusyIndicator("launchpadConfigPage",false);
                        this.handleErrors(response,null);
                }.bind(this));
            },
            
            /**
             * MER-125 (Task - MER-176)
             * // MER-177
             * Post API Calls for saving data.
             *  @param {*} oEvent
             */
            onReportSave: function(oEvent) {                
                var sUrl = sServiceUrl + "ShareInfoSet";
                var sUrlST = sServiceUrl + "STO3NReportSet";
                var that = this;
                if (oLocalModel.getProperty("/AssignApps") && oLocalModel.getProperty("/AssignApps").length > 0) {
                    var userName = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("UserInfo");
                    var oPayloadData = {
                        createdBy: ((userName) && (userName.getEmail() || 'testuser1@mindsetconsulting.com')) || 'testuser1@mindsetconsulting.com',
                        customerName: oLocalModel.getProperty("/customerName"),
                        selectedVersion: oLocalModel.getProperty("/releaseId") || "",
                        passKey: "P" + new Date().toISOString().replace(/[-:.]/g, ''),
                        lastAccessDate: new Date(),
                        tcodes:[],
                        svariant:  oLocalModel.getProperty("/oSelVariant/name"),
                        svariant_id: oLocalModel.getProperty("/oSelVariant/id")
                    }
                    if (oLocalModel.getProperty("/chooseFromOption") === 'ST') {
                        oPayloadData.STO3NRepost = true,
                        oPayloadData.top_overall_tran = oLocalModel.getProperty("/aExcelTopFinalDataResult/0/aOverall_Transactions") || [],
                        oPayloadData.top_standard_tran = oLocalModel.getProperty("/aExcelTopFinalDataResult/0/aStandard_Transactions") || [],
                        oPayloadData.top_custom_tran = oLocalModel.getProperty("/aExcelTopFinalDataResult/0/aCustom_Transactions") || []
                    } 
                    /**
                    if (oLocalModel.getProperty("/chooseFromOption") === 'ST') {
                        var oPayloadDataSTO3N = {
                            createdBy: ((userName) && (userName.getEmail() || 'testuser1@mindsetconsulting.com')) || 'testuser1@mindsetconsulting.com',
                            customerName: oLocalModel.getProperty("/customerName"),
                            selectedVersion: oLocalModel.getProperty("/releaseId") || "",
                            top_overall_tran: oLocalModel.getProperty("/aExcelTopFinalDataResult/0/aOverall_Transactions") || [],
                            top_standard_tran: oLocalModel.getProperty("/aExcelTopFinalDataResult/0/aStandard_Transactions") || [],
                            top_custom_tran: oLocalModel.getProperty("/aExcelTopFinalDataResult/0/aCustom_Transactions") || []
                        }
                    }
                    */
                    var tcode = [];
                    oLocalModel.getProperty("/AssignApps").forEach(element => {
                        if (element.TCode && !tcode.includes(element.TCode)) {
                            tcode.push(element.TCode);
                            oPayloadData.tcodes.push({tcode: element.TCode, appids:[{appid: element.appId}]})
                        } else {
                            oPayloadData.tcodes.forEach(item => {   
                                if (item.tcode === element.TCode) {                                         
                                    item.appids.push({appid: element.appId})
                                }
                            });
                        }
                    });
                    if (oLocalModel.getProperty("/oResShareReportSave") && oLocalModel.getProperty("/oResShareReportSave/id") && oLocalModel.getProperty("/oResShareReportSave/passKey")) {
                        oLocalModel.setProperty("/reportGenerationData", false);
                        // Logic for Update call
                        sUrl = sUrl + "/" + oLocalModel.getProperty("/oResShareReportSave/id");
                        oPayloadData.passKey = oLocalModel.getProperty("/oResShareReportSave/passKey") || "P" + new Date().toISOString().replace(/[-:.]/g, '');
                        
                        ReqHelper.sendUpdateReq(sUrl, oPayloadData).then(function (response) {
                            if(response && response.id){
                                var oResShareReport = response;
                                oLocalModel.setProperty("/oResShareReportSave", response);
                                /**
                                    if (oLocalModel.getProperty("/chooseFromOption") === 'ST') {
                                        sUrlST = sUrlST + "/" + response.id;
                                        ReqHelper.sendUpdateReq(sUrlST, oPayloadDataSTO3N).then(function (res) {
                                            if(res && res.id){ 
                                                that.onGenerateShareURL(oResShareReport || oLocalModel.getProperty("/oResShareReportSave")); 
                                            }
                                        }.bind(that))
                                            .catch(function (res) {
                                                that.handleErrors(res, oBundle);
                                        }.bind(that));
                                    } else {
                                        that.onGenerateShareURL(oResShareReport || oLocalModel.getProperty("/oResShareReportSave")); 
                                    } 
                                */

                                that.onGenerateShareURL(oResShareReport || oLocalModel.getProperty("/oResShareReportSave")); 
                            } else {
                                // TBD                            
                                oLocalModel.setProperty("/reportUpdateData", false);
                            }
                        }.bind(that))
                            .catch(function (response) {
                                that.handleErrors(response,oBundle);                            
                                 oLocalModel.setProperty("/reportUpdateData", false);
                        }.bind(that));
                    } else {
                        if(oLocalModel.getProperty("/chooseFromOption") !== 'ST') {
                            oPayloadData.STO3NRepost = false,
                            oPayloadData.top_overall_tran =  [],
                            oPayloadData.top_standard_tran = [],
                            oPayloadData.top_custom_tran = []
                        }
                        ReqHelper.sendCreateReq(sUrl, oPayloadData).then(function (response) {
                            oLocalModel.setProperty("/reportUpdateData", false);
                            if(response && response.id){
                                var oResShareReport = response;
                                oLocalModel.setProperty("/oResShareReportSave", response);
                                // Verint update
                                if (oLocalModel.getProperty("/oSelVariant/id")) {
                                    let opaylod = {
                                        shareinfo_id:  response.id
                                    }
                                    let sVerintURL = sServiceUrl + "VariantSet/" + oLocalModel.getProperty("/oSelVariant/id");
                                    ReqHelper.sendUpdateReq(sVerintURL, opaylod).then(function (res) {
                                        // TBD
                                        oLocalModel.setProperty("/oSelVariant", res);
                                    }.bind(that))
                                        .catch(function (res) {
                                            that.handleErrors(res, oBundle);
                                    }.bind(that));
                                } 
                                that.onGenerateShareURL(oResShareReport || oLocalModel.getProperty("/oResShareReportSave"), "New"); 
                            } else {
                                // TBD                            
                                oLocalModel.setProperty("/reportUpdateData", false);
                            }
                        }.bind(that))
                            .catch(function (response) {
                                that.handleErrors(response,oBundle);                            
                                 oLocalModel.setProperty("/reportUpdateData", false);
                        }.bind(that));
                    }
                } else {
                    oLocalModel.setProperty("/reportUpdateData", false);
                }
            }, 
            /**
             * 
             * @param {*} oEvent 
             */
            /** 
                 onReportDelete: function(oEvent) {                
                    var oResShareReportSave = oLocalModel.getProperty("/oResShareReportSave");
                    if (oResShareReportSave && oResShareReportSave.id) {
                        var sUrl = sServiceUrl + "ShareInfoSet/" + oResShareReportSave.id;
                        var sUrlST = sServiceUrl + "STO3NReportSet/" + oResShareReportSave.id;
                        ReqHelper.sendDeleteReq(sUrl, oPayloadDataSTO3N).then(function (response) {
                            ReqHelper.sendDeleteReq(sUrlST, oPayloadDataSTO3N).then(function (res) {
                                // oLocalModel.setProperty("/copyURLButtonVisible", false);
                            }.bind(that))
                                .catch(function (res) {
                                    that.handleErrors(res, oBundle);
                            }.bind(that));
                        }.bind(that))
                            .catch(function (response) {
                                that.handleErrors(response, oBundle);
                        }.bind(that));
                    }
                }, 
            */
            /**
             * // MER-177
             * Generating Public access URL
             * @param {*} oData 
             */
            onGenerateShareURL: function(oData, sValue){
                var oDataRes = oData || oLocalModel.getProperty("/oResShareReportSave");
                var hostURL = window.location.origin;
                // Local test case (TTD dev)
                var sUIAppURL = '/c27d66ec-ef19-4d40-b7f2-a72646435d9f.commindsetacceleratorappfinderappinfo.commindsetacceleratorappfinderappinfo-0.0.1/index.html';
                // This is only for software work place only
                if (hostURL && hostURL.indexOf("mindsetdevelopment") !== -1) {
                    // TTD
                    hostURL = hostURL;
                    sUIAppURL = '/c27d66ec-ef19-4d40-b7f2-a72646435d9f.commindsetacceleratorappfinderappinfo.commindsetacceleratorappfinderappinfo-0.0.1/index.html';
                } else if (hostURL && hostURL.indexOf("mindset-software-dev") !== -1) {
                    // Software
                    hostURL = hostURL;
                    sUIAppURL = '/b588e763-6027-439e-a570-ca1e1b70f3f7.commindsetacceleratorappfinderappinfo.commindsetacceleratorappfinderappinfo-0.0.1/index.html';
                } else {
                    //  Local test case (TTD dev)
                    hostURL = 'https://mindsetdevelopment.launchpad.cfapps.us10.hana.ondemand.com/';
                }

                if (oDataRes && oDataRes.id) {
                    var sGenerateShareURL =  hostURL + sUIAppURL;
                    oLocalModel.setProperty("/sGenerateShareURL", sGenerateShareURL);
                    oLocalModel.setProperty("/sGenerateDomainShareURL",  hostURL + sUIAppURL);
                    if (sValue) {
                        oLocalModel.setProperty("/reportUpdateData", false);
                        oLocalModel.setProperty("/reportGenerationData", true);
                    } else {
                        oLocalModel.setProperty("/reportUpdateData", false);
                        oLocalModel.setProperty("/reportGenerationData", true);
                    }
                    this.onPressCopy(sGenerateShareURL, oDataRes);
                } else {
                    oLocalModel.setProperty("/reportUpdateData", false);
                    oLocalModel.setProperty("/reportGenerationData", true);
                }
            },  
            
            /**
             * // MER-177
             * @param {*} oEvent 
             */
            onPressCopy: function(oEvent, oData) {
                var sURL = oLocalModel.getProperty("/sGenerateShareURL") || window.location.origin;
                var sURL1 = oLocalModel.getProperty("/sGenerateDomainShareURL");
                copyUrlToClipboard(sURL, sURL1, oData);

                function copyUrlToClipboard(url, sURL1) {
                    // Create a hidden input element
                    var input = document.createElement('textarea');
                    input.style.position = 'fixed';
                    input.style.opacity = 0;
                    input.value = "URL: " + url + "\n\n Report ID: " +  oData.passKey;
                    document.body.appendChild(input);
                  
                    // Select the URL in the input element
                    input.select();
                    input.setSelectionRange(0, 99999); // For mobile devices
                  
                    // Copy the URL to the clipboard
                    document.execCommand('copy');
                  
                    // Remove the input element from the DOM
                    document.body.removeChild(input);
                  
                    // // Optionally, provide feedback to the user
                    MessageBox.success(oBundle.getText("oBundleSucc_1") + ' "' + oData.customerName + '"  ' + oBundle.getText("oBundleSucc_2") + "\n" + 
                        oBundle.getText("oBundleSucc_3") +  "\n\n URL : " +  sURL1 + "\n\n" +  "Report ID: "  + oData.passKey, {
                        title: "The following details are now availabe in your clip-board",
                        actions: [MessageBox.Action.OK],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: function (sAction) {
                            // MessageToast.show("Action selected: " + sAction);
                        }
                    });                    
                }                
            },        

            /**
             * MER-25
             * Added sorting function on graphical representation for functional area
             * Added sorting function on graphical representation for job role
             * @param {*} oEvent 
             */
            onChartSortFunChange: function(oEvent){
                if (oEvent && oEvent.getSource() && oEvent.getSource().getCustomData() && oEvent.getSource().getCustomData()[0]) {
                    var sKey = oEvent.getSource().getCustomData()[0].getKey();
                    var aSelectedChartData = oEvent.getSource().getCustomData()[0].getValue();
                    // Get the selected sort order
                    var sSortOrder =  oLocalModel.getProperty("/" + sKey) || ""; 
                    // Get the chart data from the model
                    var aChartData =  oLocalModel.getProperty("/" + aSelectedChartData) || [];
                    if (sSortOrder === "asc" || sSortOrder === "desc") {
                        aChartData.sort((a, b) => {
                            // Update code base on MER-25 story comments.
                            const nameA = a["App Count"]; // ignore upper and lowercase
                            const nameB = b["App Count"]; // ignore upper and lowercase
                            if (sSortOrder === "asc") {
                                if (nameA < nameB) {
                                    return -1;
                                }
                                if (nameA > nameB) {
                                    return 1;
                                }
                            } else if (sSortOrder === "desc") {
                                if (nameA > nameB) {
                                    return -1;
                                }
                                if (nameA < nameB) {
                                    return 1;
                                }
                            }                  
                            // names must be equal
                            return 0;
                        });
                        // Update the model with sorted data
                        oLocalModel.setProperty("/" + aSelectedChartData, aChartData);
                    } else {
                        oLocalModel.setProperty("/" + aSelectedChartData, this.aChartDataClone);
                    }                      
                }                                 
            },
            /**
             *  MER-26 Graphical Representation of Top Transactions Used
             *  Top 10 Standard Transactions used (not start with Z and Y)
             *  Top 10 Custom Transactions used (start with Z and Y)
             *  Top 10 overall transactions used  Combined (All)
             * @param {*} aData 
             */
            onHandelSortingTopTenData: function(aData) {
                var aArrayData = [
                        { Key : "", Text: "Select Your Transaction...!" , enabled: false},
                        { Key : "aOverall_TransactionsAll", Text: "All Overall Transactions", enabled: false},
                        { Key : "aOverall_Transactions", Text: "Top 10 Overall Transactions", enabled: true} ,
                        { Key : "aStandard_TransactionsAll", Text: "All Standard Transactions", enabled: false},                        
                        { Key : "aStandard_Transactions", Text: "Top 10 Standard Transactions", enabled: true},
                        { Key : "aCustom_TransactionsAll", Text: "All Custom Transactions", enabled: false},
                        { Key : "aCustom_Transactions", Text: "Top 10 Custom Transactions", enabled: true}  
                    ]
                if (aData) {
                    this.aExcelAllData = structuredClone(aData);
                    this.aExcelAllDataResult = [];
                    if(this.aExcelAllData && this.aExcelAllData.length > 0){
                        this.aExcelAllData = this.aExcelAllData.forEach(element => {
                            if(element) {
                                this.aExcelAllDataResult.push({
                                    Report_or_Transaction_name : element["Report or Transaction name"] || "", 
                                    Number_of_Dialog_Steps : element["Number of Dialog Steps"] || 0
                                });
                            } 
                        });
                    } else {
                        this.aExcelAllDataResult = [];
                    }
                    // Create an object to store sum of dialog steps for each report/transaction
                    const sumDialogSteps = {};
                    // Iterate over each item in the data array
                    this.aExcelAllDataResult.forEach(item => {
                        const reportName = item.Report_or_Transaction_name;
                        const dialogSteps = item.Number_of_Dialog_Steps;
                        
                        // If report name already exists, add dialog steps to its sum
                        if (sumDialogSteps.hasOwnProperty(reportName)) {
                            sumDialogSteps[reportName] += dialogSteps;
                        } 
                        // If report name doesn't exist, initialize its sum with dialog steps
                        else {
                            sumDialogSteps[reportName] = dialogSteps;
                        }
                    });
                    // Convert sumDialogSteps object to array of objects
                    this.aExcelAllDataResult = Object.entries(sumDialogSteps).map(([reportName, sumSteps]) => ({ 
                        Report_or_Transaction_name: reportName, 
                        Number_of_Dialog_Steps: sumSteps
                    }));

                    // Create arrays to store separate objects
                    const zyObjects = [];
                    const otherObjects = [];

                    // Iterate over each item in the data array
                    this.aExcelAllDataResult.forEach(item => {
                        const reportName = item.Report_or_Transaction_name;
                        const dialogSteps = item.Number_of_Dialog_Steps;
                        
                        // Check if report name starts with "Z" or "Y"
                        if (reportName.startsWith("Z") || reportName.startsWith("z") || reportName.startsWith("y") || reportName.startsWith("Y")) {
                            zyObjects.push({ Report_or_Transaction_name: reportName, Number_of_Dialog_Steps: dialogSteps });
                        } else {
                            otherObjects.push({ Report_or_Transaction_name: reportName, Number_of_Dialog_Steps: dialogSteps });
                        }
                    });
                    
                    // Sort otherObjects, zyObjects and in descending order based on Number_of_Dialog_Steps
                    this.aExcelFinalDataResult = [{
                        aStandard_TransactionsAll : otherObjects && otherObjects.sort((a, b) => b.Number_of_Dialog_Steps - a.Number_of_Dialog_Steps),
                        aCustom_TransactionsAll : zyObjects && zyObjects.sort((a, b) => b.Number_of_Dialog_Steps - a.Number_of_Dialog_Steps),
                        aOverall_TransactionsAll : this.aExcelAllDataResult && this.aExcelAllDataResult.sort((a, b) => b.Number_of_Dialog_Steps - a.Number_of_Dialog_Steps),

                        aStandard_Transactions : otherObjects && otherObjects.sort((a, b) => b.Number_of_Dialog_Steps - a.Number_of_Dialog_Steps).slice(0, 10),
                        aCustom_Transactions : zyObjects && zyObjects.sort((a, b) => b.Number_of_Dialog_Steps - a.Number_of_Dialog_Steps).slice(0, 10),
                        aOverall_Transactions : this.aExcelAllDataResult && this.aExcelAllDataResult.sort((a, b) => b.Number_of_Dialog_Steps - a.Number_of_Dialog_Steps).slice(0, 10)
                    }]                    
                    oLocalModel.setProperty("/aExcelFinalDataResultKeys", aArrayData);
                    oLocalModel.setProperty("/aExcelTopFinalDataResult", this.aExcelFinalDataResult);
                    oLocalModel.setProperty("/aExcelFinalDataResultSelectKeys", "aOverall_Transactions");
                    this.onFilterTopTenSelectChange(false, "aOverall_Transactions", "Top 10 Overall Transactions");
                } else {
                    oLocalModel.setProperty("/aExcelFinalDataResultKeys", aArrayData);
                    oLocalModel.setProperty("/aExcelTopFinalDataResult", []);
                    oLocalModel.setProperty("/aExcelFinalDataResultSelectKeys", "");
                }
            },
            /**
             * MER-26 Graphical Representation of Top Transactions Used
             * Added sorting function on graphical representation for job role
             * @param {*} oEvent 
             */
            onFilterTopTenSelectChange: function(oEvent, sKey, sValue){
                // Get the selected Key
                var sSelectedKey =  oLocalModel.getProperty("/aExcelFinalDataResultSelectKeys") || sKey;
                var svalueData = sValue;
                if (oEvent && oEvent.getSource() && oEvent.getSource().getSelectedItem() && oEvent.getSource().getSelectedItem().getText()) {
                    svalueData = oEvent.getSource().getSelectedItem().getText();
                } 
                oLocalModel.setProperty("/aExcelFinalDataResultText", (svalueData || "Top 10 Transactions"));
                // Get the chart data from the model
                var aChartData =  (sSelectedKey && oLocalModel.getProperty("/aExcelTopFinalDataResult/0/" + sSelectedKey)) || [];
                if (aChartData && aChartData.length > 0) {
                    // Update the model with sorted data
                    oLocalModel.setProperty("/aExcelTopSelectedFinalDataResult", aChartData);            
                } else {
                    oLocalModel.setProperty("/aExcelTopSelectedFinalDataResult", []);
                }                
            }
        });
    });
