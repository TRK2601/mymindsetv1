sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet'
    ],
/**
 * @param {typeof sap.ui.core.mvc.Controller} Controller
 */
function (Controller, JSONModel, MessageBox, Filter, FilterOperator, Sorter, exportLibrary, Spreadsheet) {
    "use strict";
    var oLocalModel, EdmType = exportLibrary.EdmType,oController, oModel;
    return Controller.extend("com.mindset.ui.assetwisepg.masterdata.controller.App", {
        onInit: function (oEvent) {
            oController = this;
            oModel = oController.getOwnerComponent().getModel();
            oController.dataUrl = this.getOwnerComponent().getModel().sServiceUrl;
            oLocalModel = this.getOwnerComponent().getModel("LocalModel");            
            oLocalModel.setProperty("/saveBtnEnabled", false);
            oLocalModel.setProperty("/ErrorMessags",[]);
            this.oBundle = this.getOwnerComponent().getModel('i18n').getResourceBundle();
            oLocalModel.setProperty("/sSelItemName", "");
            this.createMessagePopover();

            const script = document.createElement("script");
                  script.src = "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js";
                  script.onload = () => {
                    console.log("SheetJS library loaded.");
                  };
                  document.head.appendChild(script);
        },
        onlistItemPress: function (oEvent) {
          //  var oLocalModel = this.getView().getModel('LocalModel');
          if (!oLocalModel.getProperty("/saveBtnEnabled")) {
            oLocalModel.setProperty("/saveBtnEnabled", false);
            var sToPageId = oEvent.getParameter("listItem").getCustomData()[0].getValue();
            oLocalModel.setProperty('/SelItem', sToPageId);
            oLocalModel.setProperty("/sSelItemName", this.oBundle.getText(sToPageId));
            oLocalModel.setProperty('/SelItemDataCount', 0);
            this._bindData(sToPageId);
          } else {
            var sToPageId = oEvent.getParameter("listItem").getCustomData()[0].getValue();
            if (sToPageId !== oLocalModel.getProperty('/SelItem')) {
                let sTab = oController.oBundle.getText(oLocalModel.getProperty('/SelItem'));
                MessageBox.warning("You have unsaved changes in " + sTab +". Do you want to discard them?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            oLocalModel.setProperty("/saveBtnEnabled", false);
                            var sToPageId = oEvent.getParameter("listItem").getCustomData()[0].getValue();
                            oLocalModel.setProperty('/SelItem', sToPageId);
                            oLocalModel.setProperty("/sSelItemName", oController.oBundle.getText(sToPageId));
                            oLocalModel.setProperty('/SelItemDataCount', 0);
                            oController._bindData(sToPageId);
                        } 
                    },
                    dependentOn: this.getView()
                });
            }
          }
        },
        _bindData: function(sSelParam){
            //var oLocalModel = this.getView().getModel('LocalModel');
            oLocalModel.setProperty("/ErrorMessags",[]);
            oLocalModel.setProperty("/saveBtnEnabled", false);
            this.getView().byId("fileUploader_"+ oLocalModel.getProperty('/SelItem')).setValue("");
            var aTriggerGETCall=[];
            if(sSelParam === "MaterialType"){
                aTriggerGETCall.push(this._getData('MaterialType?$expand=assignedCurrencies($expand=currency),assignedBaseLocations,assignedFunctionalLocations,assignedGroups,assignedSubGroups'));
                aTriggerGETCall.push(this._getData('Currency'));
                aTriggerGETCall.push(this._getData('BaseLocation'));
                aTriggerGETCall.push(this._getData('FunctionalLocation'));
                aTriggerGETCall.push(this._getData('Groups'));
                aTriggerGETCall.push(this._getData('SubGroup'));
            } else if(sSelParam === "BaseLocation"){
                aTriggerGETCall.push(this._getData('BaseLocation'));
            } else if(sSelParam === "Currency"){
                aTriggerGETCall.push(this._getData('Currency'));
            } else if(sSelParam === "FunctionalLocation"){
                aTriggerGETCall.push(this._getData('FunctionalLocation'));
                aTriggerGETCall.push(this._getData('BaseLocation'));
            } else if(sSelParam === "Groups"){
                aTriggerGETCall.push(this._getData('Groups'));
            } else if(sSelParam === "SubGroup"){
                aTriggerGETCall.push(this._getData('SubGroup'));
                aTriggerGETCall.push(this._getData('Groups'));
            } else if(sSelParam === "Employee"){
                aTriggerGETCall.push(this._getData('Employee'));
                aTriggerGETCall.push(this._getData('Teams'));
            } else if(sSelParam === "RequestTypes"){
                aTriggerGETCall.push(this._getData('RequestTypes'));
            } else if(sSelParam === "Statuses"){
                aTriggerGETCall.push(this._getData('Statuses'));
            } else if(sSelParam === "Actions"){
                aTriggerGETCall.push(this._getData('Actions'));
            } else if(sSelParam === "Teams" || sSelParam === "/Teams"){
                aTriggerGETCall.push(this._getData('Teams'));
            }else if(sSelParam === "AssetStatus"){
                aTriggerGETCall.push(this._getData('AssetStatus'));
            }
            this._setBusy('detailPage', true);
            Promise.all(aTriggerGETCall).then(function(data){
                this._setBusy('detailPage', false);
                var sEntityName;
                for(var i=0; i<data.length; i++){
                    sEntityName = data[i]['@odata.context'].split('#')[1].split('(')[0];
                    for(var idx=0; idx<data[i].value.length; idx++){
                        if(sEntityName === 'MaterialType'){
                            data[i].value[idx].assignedCurrenciesKeys = data[i].value[idx].assignedCurrencies.map(function(el){
                                return el['currency_code'];
                            });
                            data[i].value[idx].assignedBaseLocationsKeys = data[i].value[idx].assignedBaseLocations.map(function(el){
                                return el['baseLocation_code'];
                            });
                            data[i].value[idx].assignedGroupsKeys = data[i].value[idx].assignedGroups.map(function(el){
                                return el['group_name'];
                            });
                            data[i].value[idx].assignedFunctionalLocationsKeys = data[i].value[idx].assignedFunctionalLocations.map(function(el){
                                return el['functionalLocation_ID'];
                            });
                            data[i].value[idx].assignedSubGroupsKeys = data[i].value[idx].assignedSubGroups.map(function(el){
                                return el['subGroup_ID'];
                            });
                        }
                        data[i].value[idx].type = 'R';
                        data[i].value[idx].editable = false;
                    }
                    oLocalModel.setProperty('/'+sEntityName, data[i].value);
                    if(sSelParam === sEntityName){
                        oLocalModel.setProperty('/SelItemDataCount', data[i].value.length);
                    }
                }
                // if(oLocalModel.getProperty('/SelItem') && oLocalModel.getProperty("/"+oLocalModel.getProperty('/SelItem')).length > 0){
                //     this.getView().getModel("LocalModel").setProperty("/saveBtnEnabled",true);
                // }else{
                //     this.getView().getModel("LocalModel").setProperty("/saveBtnEnabled",false);
                // }
            }.bind(this)).catch(function (error) {
                this._setBusy('detailPage', false);
                if(error && error.responseJSON && error.responseJSON.error && error.responseJSON.error.message){
                    MessageBox.error(error.responseJSON.error.message);
                    return;
                }
                MessageBox.error("Sorry, an error has occurred");
            }.bind(this));
        },
        _getData: function(sPath){
            return new Promise(function(resolve, reject) {
                $.ajax({
                    url: oController.dataUrl + sPath,
                    method: 'GET',
                    contentType: "application/json",
                    success: function (oData) {
                        resolve(oData);
                    }.bind(this),
                    error: function(error){
                        reject(error);
                    }.bind(this)
                    });
            });
        },
        /**
         * Mutiple delete call
         * @param {*} oEvent 
         */
        onPressDelete: function(oEvent){
            var oSrc = oEvent.getSource();
            var oTbl = this.getView().byId(oSrc.data('TblId'));
            var aContexts = oTbl.getBinding('rows').getContexts();
            var sPath = oSrc.data('Path');
            let sTableName = oSrc.data('TblId');
          //  var oLocalModel = this.getView().getModel('LocalModel');
            var aSelItems = oTbl.getSelectedIndices();
            var aItems;
            if(aSelItems.length > 0 && sTableName && sPath){              
                for(var i=0; i<aSelItems.length; i++){
                    if(aContexts[aSelItems[i]].getObject().type === 'C'){
                        oLocalModel.setProperty(aContexts[aSelItems[i]].getPath()+'/localDelete', true);
                    } else {
                        oLocalModel.setProperty(aContexts[aSelItems[i]].getPath()+'/type', 'D');
                    }
                }
                aItems = oLocalModel.getProperty(sPath);
                for(var idx=0; idx<aItems.length; idx++){
                    if(aItems[idx].localDelete){
                        aItems.splice(idx, 1);
                        idx--;
                    }
                }
                oLocalModel.setProperty(sPath, jQuery.extend(true,[],aItems));

                // New code by Ravi Krishna Thota.
                oController._saveTeamsorAssetStatusDataDelete(aItems, sTableName, sPath);
            }
        },
        /**
         *  Row wise deletion
         * @param {*} oEvent 
         */
        onPressSingleDeleteAllSection: function(oEvent) {
            let oSc = oEvent.getSource();
            let oCtx = oSc.getBindingContext("LocalModel");
            let sPath = oCtx.getPath();
            let oBj = oCtx.getObject();
            let aData = oLocalModel.getProperty("/" + sPath.split("/")[1]);
            if (oBj.type === 'C') {
                aData.splice(sPath.split("/")[2],1)
                oLocalModel.setProperty("/" + sPath.split("/")[1], oLocalModel.getProperty("/" + sPath.split("/")[1]));
                MessageBox.success(oController.oBundle.getText(sPath.split("/")[1])+ ' row data has been deleted');
            } else {
                oBj.type = 'D'
                let element = oBj;
                let aRequests = [], sName = "", sNames = "";
                let sSelItem = "/" + sPath.split("/")[1];
                if (sSelItem === "/Teams" || sSelItem === "/AssetStatus" || sSelItem === "/Groups" || sSelItem === "/MaterialType") {
                    sName = element.name || "";
                    sNames = sName;
                } else if ( sSelItem === "/Employee") {
                    sName = element.ID || "";
                    sNames = element.name;
                } else if (sSelItem === "/RequestTypes" || sSelItem === "/Statuses" || sSelItem === "/Currency" ||
                        sSelItem === "/Actions" || sSelItem === "/BaseLocation" || sSelItem === "/FunctionalLocation") {
                    if (sSelItem === "/FunctionalLocation") {
                        sName =  (element.ID + '/' + element.code) || "";
                    } else {                            
                        sName = element.code || "";
                    } 
                    if (sSelItem === "/BaseLocation" || sSelItem === "/FunctionalLocation") {
                        sNames = element.code;
                    }
                    sNames = element.name;
                } else if (sSelItem === "/SubGroup") {
                    sName =  (element.ID + '/' + element.name) || "";
                    sNames = element.name;
                }
                if (sName && element.type === "D") {
                    let uPath;
                    if (sSelItem === "/SubGroup" || sSelItem === "/FunctionalLocation") {
                        uPath = sSelItem + "/" + sName;
                    } else {
                        uPath = sSelItem + "('" + sName + "')";
                    }
                    
                    aRequests.push(new Promise(
                        function (resolve) {                                                                      
                        oModel.delete(uPath).then(function() { if (resolve) {resolve()}});
                    }));
                }        
                oController._setBusy('detailPage', true);
                Promise.all(aRequests).then(function(data){
                    oController._setBusy('detailPage', false);                    
                    aData.splice(sPath.split("/")[2],1);
                    oLocalModel.setProperty(sSelItem, oLocalModel.getProperty(sSelItem));
                    sSelItem = sSelItem.split("/")[1];
                    MessageBox.success(oController.oBundle.getText(sSelItem) + ` "${sNames}"` + ' data has been deleted');
                    // oController._bindData(sSelItem);
                }.bind(this)).catch(function (error) {
                    oController._setBusy('detailPage', false);
                    MessageBox.error("Sorry, an error has occurred");
                }.bind(this));
            }       
        },
        onPressAddRow: function(oEvent){
            oLocalModel.setProperty("/saveBtnEnabled", true);
            var oSrc = oEvent.getSource();
            var sPath = oSrc.data('Path');
           // var oLocalModel = this.getView().getModel('LocalModel');
            var aItems = oLocalModel.getProperty(sPath) || [];
            if(sPath === "/MaterialType"){
                aItems.push({
                    name: "",
                    type: "C",
                    editable: true,
                });
            } else if(sPath === "/BaseLocation"){
                aItems.push({
                    code: "",
                    type: "C",
                    editable: true,
                });
            } else if(sPath === "/Currency"){
                var bFlag = false;
                aItems.forEach(function(oItem){
                    if(oItem.code){
                        bFlag = false;
                    }else{
                        bFlag = true;
                    }
                });
                if(!bFlag){
                    aItems.push({
                        name: "",
                        symbol: "",
                        code: "",
                        type: "C",
                        editable: true,
                    });
                }
            } else if(sPath === "/FunctionalLocation"){
                aItems.push({
                    baseLocationCode: "",
                    code: "",
                    type: "C",
                    editable: true,
                });
            } else if(sPath === "/Groups"){
                aItems.push({
                    name: "",
                    type: "C",
                    editable: true,
                });
            } else if(sPath === "/SubGroup"){
                aItems.push({
                    name: "",
                    group_name: "",
                    type: "C",
                    editable: true,
                });
            } else if(sPath === "/Employee"){
                aItems.push({
                    name: "",
                    code: "",
                    email: "",
                    team: "",
                    managerName: "",
                    managerCode: "",
                    managerEmail: "",
                    isOwner: false,
                    isManager: false,
                    isUser: false,
                    hasCreatable: false,
                    hasUpdatble: false,
                    type: "C",
                    editable: true
                });
            } else if(sPath === "/RequestTypes" || sPath === "/Statuses" || sPath === "/Actions"){
                aItems.push({
                    name: "",
                    code: "",
                    type: "C",
                    editable: true,
                });
            } else if(sPath === "/Teams" || sPath === "/AssetStatus"){
                aItems.push({
                    name: "",
                    description: "",
                    type: "C",
                    editable: true,
                });
            }
            oLocalModel.setProperty(sPath, $.extend(true,[],aItems));
        },
        
        onChange: function(oEvent){
           // var oLocalModel = this.getView().getModel('LocalModel');
            var oSrc = oEvent.getSource();
            var oBindingCtx = oSrc.getBindingContext('LocalModel');
            var sPath = oBindingCtx.getPath();
            if(oLocalModel.getProperty(sPath+'/type') === 'R'){
                oLocalModel.setProperty(sPath+'/type', 'U');
            }
            oLocalModel.setProperty("/saveBtnEnabled", true);
        },
        _getFuncLocCodeByID: function(funcLocID){
           // var oLocalModel = this.getView().getModel('LocalModel');
            var aFuncLoc = oLocalModel.getProperty('/FunctionalLocation');
            var sFuncLocCode="";
            if(aFuncLoc.find(function(el){
                return el['ID'] === funcLocID;
            })){
                sFuncLocCode = aFuncLoc.find(function(el){
                    return el['ID'] === funcLocID;
                }).code;
            }
            return sFuncLocCode;
        },
        _getBaseLocCodeByFuncLocID: function(funcLocID){
          //  var oLocalModel = this.getView().getModel('LocalModel');
            var aFuncLoc = oLocalModel.getProperty('/FunctionalLocation');
            var sBaseLocCode="";
            if(aFuncLoc.find(function(el){
                return el['ID'] === funcLocID;
            })){
                sBaseLocCode = aFuncLoc.find(function(el){
                    return el['ID'] === funcLocID;
                }).baseLocationCode;
            }
            return sBaseLocCode;
        },
        _getSubGropNameByID: function(subGroupID){
         //   var oLocalModel = this.getView().getModel('LocalModel');
            var aSubGroup = oLocalModel.getProperty('/SubGroup');
            var sSubGroupName="";
            if(aSubGroup.find(function(el){
                return el['ID'] === subGroupID;
            })){
                sSubGroupName = aSubGroup.find(function(el){
                    return el['ID'] === subGroupID;
                }).name;
            }
            return sSubGroupName;
        },
        _getGropNameBySubGroupID: function(subGroupID){
        //    var oLocalModel = this.getView().getModel('LocalModel');
            var aSubGroup = oLocalModel.getProperty('/SubGroup');
            var sGroupName="";
            if(aSubGroup.find(function(el){
                return el['ID'] === subGroupID;
            })){
                sGroupName = aSubGroup.find(function(el){
                    return el['ID'] === subGroupID;
                }).group_name;
            }
            return sGroupName;
        },
        _constructMaterialPayload: function(matTypeObj, payload){
            if(matTypeObj){
                payload.assignedCurrencies = matTypeObj.assignedCurrenciesKeys ? matTypeObj.assignedCurrenciesKeys.map(function(el){
                    return {
                        "currency_code": el,
                        "materialType_name": matTypeObj.name
                    };
                }) || [] : [];
                payload.assignedBaseLocations = matTypeObj.assignedBaseLocationsKeys ? matTypeObj.assignedBaseLocationsKeys.map(function(el){
                    return {
                        "baseLocation_code": el,
                        "materialType_name": matTypeObj.name
                    };
                }) || [] : [];
                payload.assignedFunctionalLocations = matTypeObj.assignedFunctionalLocationsKeys ? matTypeObj.assignedFunctionalLocationsKeys.map(function(el){
                    return {
                        "functionalLocation_ID": el,
                        "functionalLocation_code": this._getFuncLocCodeByID(el),
                        "baseLocation_code": this._getBaseLocCodeByFuncLocID(el),
                        "materialType_name": matTypeObj.name
                    };
                }.bind(this)) || [] : [];
                payload.assignedGroups = matTypeObj.assignedGroupsKeys ? matTypeObj.assignedGroupsKeys.map(function(el){
                    return {
                        "group_name": el,
                        "materialType_name": matTypeObj.name
                    };
                }) || [] : [];
                payload.assignedSubGroups = matTypeObj.assignedSubGroupsKeys ? matTypeObj.assignedSubGroupsKeys.map(function(el){
                    return {
                        "subGroup_ID": el,
                        "subGroup_name": this._getSubGropNameByID(el),
                        "group_name": this._getGropNameBySubGroupID(el),
                        "materialType_name": matTypeObj.name
                    };
                }.bind(this)) || [] : [];
            }
        },
        /**
         * Changed by Ravi Krishna Thota.(Need to check)
         * @param {*} aItems 
         * @param {*} sSelItem 
         */
        _saveMaterialTypeData: function(aItems, sSelItem){
            oController._setBusy('detailPage', true);
            var payload={}, aRequests=[];
            for(var i=0; i<aItems.length; i++){
                if(aItems[i].type === 'C' && aItems[i].name){
                    payload = {
                        name: aItems[i].name ? aItems[i].name.toUpperCase() : ''
                    };
                    oController._constructMaterialPayload(aItems[i], payload);
                    aRequests.push(this._writeData('MaterialType', 'POST', payload));
                    // let oListBinding = oModel.bindList(
                    //     "/" + sSelItem,
                    //     undefined,
                    //     undefined,
                    //     undefined,
                    //     { $$updateGroupId: "GroupIDCreateUpdateMat" }
                    //   );
                    //   let oContext = oListBinding.create(payload);
                } else if (aItems[i].type === 'U'){
                    this._constructMaterialPayload(aItems[i], payload);
                    aRequests.push(this._writeData(`MaterialType(name='${aItems[i].name}')`, 'PATCH', payload));
                    // let oContext = oModel.bindContext("/" + sSelItem + "('"+ aItems[i].name + "')", undefined, { $$updateGroupId: "GroupIDCreateUpdateMat" });
                    // oContext.oElementContext.setProperty("assignedBaseLocations", aItems[i].assignedBaseLocations);
                    // oContext.oElementContext.setProperty("assignedCurrencies", aItems[i].assignedCurrencies);
                    // oContext.oElementContext.setProperty("assignedFunctionalLocations", aItems[i].assignedFunctionalLocations);
                    // oContext.oElementContext.setProperty("assignedGroups", aItems[i].assignedGroups);
                    // oContext.oElementContext.setProperty("assignedSubGroups", aItems[i].assignedSubGroups);
                } 
                // else if (aItems[i].type === 'D'){
                //     aRequests.push(this._writeData(`MaterialType/${aItems[i].name}`, 'DELETE', null));
                // }
            }
            this._setBusy('detailPage', true);
            Promise.all(aRequests).then(function(data){
                this._setBusy('detailPage', false);
                MessageBox.success('Material type data has been updated');
                this._bindData(sSelItem);
            }.bind(this)).catch(function (error) {
                this._setBusy('detailPage', false);
                MessageBox.error("Sorry, an error has occurred");
            }.bind(this));

            // oModel.submitBatch("GroupIDCreateUpdateMat")
            // .then(function() {
            //     console.log("Batch operation successful");
            //     oController._setBusy('detailPage', false);
            //     MessageBox.success(sSelItem +' data has been updated');
            //         oController._bindData(sSelItem);
            //     })
            // .catch(function(oError) {
            //     console.error("Batch operation failed: ", oError);
            //     oController._setBusy('detailPage', false);
            //     MessageBox.error("Sorry, an error has occurred");
            // });
        },
        /**
         * Changed by Ravi Krishna Thota.
         * @param {*} obj 
         * @param {*} payload 
         */
        _constructCurrencyPayload: function(obj, payload){
            if(obj){
                payload.name = obj.name || '';
                payload.symbol = obj.symbol || '';
            }
        },
        /**
         * Changed by Ravi Krishna Thota.
         * @param {*} aItems 
         * @param {*} sSelItem 
         */
        _saveCurrencyData: function(aItems, sSelItem){
            var payload={}, aRequests=[];
            oController._setBusy('detailPage', true);
//            aItems = aItems[aItems.length - 1].code !==  ? aItems : aItems.splice(aItems.length - 1,1);
            for(var i=0; i<aItems.length; i++){
                if(aItems[i].type === 'C' && aItems[i].code){
                    if(aItems[i].code){
                        payload = {
                            code: aItems[i].code ?  aItems[i].code.toUpperCase() : ''
                        };
                        oController._constructCurrencyPayload(aItems[i], payload);
                        // aRequests.push(this._writeData('Currency', 'POST', payload));
                        let oListBinding = oModel.bindList(
                            "/" + sSelItem,
                            undefined,
                            undefined,
                            undefined,
                            { $$updateGroupId: "GroupIDCreateUpdateCurr" }
                          );
                          let oContext = oListBinding.create(payload);
                    }
                } else if (aItems[i].type === 'U'){
                    this._constructCurrencyPayload(aItems[i], payload);
                    // aRequests.push(this._writeData(`Currency(code='${aItems[i].code}')`, 'PATCH', payload));
                    let oContext = oModel.bindContext("/" + sSelItem + "('"+ aItems[i].code + "')", undefined, { $$updateGroupId: "GroupIDCreateUpdateCurr" });
                    oContext.oElementContext.setProperty("descr", aItems[i].descr);
                    oContext.oElementContext.setProperty("name", aItems[i].name);
                    oContext.oElementContext.setProperty("symbol", aItems[i].symbol);
                } 
                // else if (aItems[i].type === 'D'){
                //     aRequests.push(this._writeData(`Currency/${aItems[i].code}`, 'DELETE', null));
                // }
            }
            // this._setBusy('detailPage', true);
            // Promise.all(aRequests).then(function(data){
            //     this._setBusy('detailPage', false);
            //     MessageBox.success('Currency data has been updated');
            //     this._bindData(sSelItem);
            // }.bind(this)).catch(function (error) {
            //     this._setBusy('detailPage', false);
            //     MessageBox.error("Sorry, an error has occurred");
            // }.bind(this));
            oModel.submitBatch("GroupIDCreateUpdateCurr")
            .then(function() {
                console.log("Batch operation successful");
                oController._setBusy('detailPage', false);
                MessageBox.success(sSelItem +' data has been updated');
                    oController._bindData(sSelItem);
                })
            .catch(function(oError) {
                console.error("Batch operation failed: ", oError);
                oController._setBusy('detailPage', false);
                MessageBox.error("Sorry, an error has occurred");
            });
        },
        /**
         * Changed by Ravi Krishna Thota.
         * @param {*} aItems 
         * @param {*} sSelItem 
         */
        _saveBaseLocData: function(aItems, sSelItem){
            var payload={}, aRequests=[];
            for(var i=0; i<aItems.length; i++){
                if(aItems[i].type === 'C'){
                    payload = {
                        code: aItems[i].code ? aItems[i].code.toUpperCase() : ''
                    };
                    // aRequests.push(this._writeData('BaseLocation', 'POST', payload));
                    let oListBinding = oModel.bindList(
                        "/" + sSelItem,
                        undefined,
                        undefined,
                        undefined,
                        { $$updateGroupId: "GroupIDCreateUpdateBase" }
                      );
                      let oContext = oListBinding.create(payload);
                } 
                // else if (aItems[i].type === 'D'){
                //     aRequests.push(this._writeData(`BaseLocation/${aItems[i].code}`, 'DELETE', null));
                // }
            }
            // this._setBusy('detailPage', true);
            // Promise.all(aRequests).then(function(data){
            //     this._setBusy('detailPage', false);
            //     MessageBox.success('Base location data has been updated');
            //     this._bindData(sSelItem);
            // }.bind(this)).catch(function (error) {
            //     this._setBusy('detailPage', false);
            //     MessageBox.error("Sorry, an error has occurred");
            // }.bind(this));
            oModel.submitBatch("GroupIDCreateUpdateBase")
            .then(function() {
                console.log("Batch operation successful");
                oController._setBusy('detailPage', false);
                MessageBox.success(sSelItem +' data has been updated');
                    oController._bindData(sSelItem);
                })
            .catch(function(oError) {
                console.error("Batch operation failed: ", oError);
                oController._setBusy('detailPage', false);
                MessageBox.error("Sorry, an error has occurred");
            });
        },
        /**
         * Changed by Ravi Krishna Thota.
         * @param {*} aItems 
         * @param {*} sSelItem 
         */
        _saveFuncLocData: function(aItems, sSelItem){
            var payload={}, aRequests=[];
            oController._setBusy('detailPage', true);
            for(var i=0; i<aItems.length; i++){
                if(aItems[i].type === 'C'){
                    payload = {
                        code: aItems[i].code ? aItems[i].code.toUpperCase () : '',
                        baseLocationCode: aItems[i].baseLocationCode || ''
                    };
                    // aRequests.push(this._writeData('FunctionalLocation', 'POST', payload));
                    let oListBinding = oModel.bindList(
                        "/" + sSelItem,
                        undefined,
                        undefined,
                        undefined,
                        { $$updateGroupId: "GroupIDCreateUpdateFun" }
                      );
                      let oContext = oListBinding.create(payload);
                } 
                // else if (aItems[i].type === 'D'){
                //     aRequests.push(this._writeData(`FunctionalLocation/${aItems[i].ID}/${aItems[i].code}`, 'DELETE', null));
                // }
            }
            // this._setBusy('detailPage', true);
            // Promise.all(aRequests).then(function(data){
            //     this._setBusy('detailPage', false);
            //     MessageBox.success('Functional location data has been updated');
            //     this._bindData(sSelItem);
            // }.bind(this)).catch(function (error) {
            //     this._setBusy('detailPage', false);
            //     MessageBox.error("Sorry, an error has occurred");
            // }.bind(this));
            oModel.submitBatch("GroupIDCreateUpdateFun")
            .then(function() {
                console.log("Batch operation successful");
                oController._setBusy('detailPage', false);
                MessageBox.success(sSelItem +' data has been updated');
                    oController._bindData(sSelItem);
                })
            .catch(function(oError) {
                console.error("Batch operation failed: ", oError);
                oController._setBusy('detailPage', false);
                MessageBox.error("Sorry, an error has occurred");
            });
        },
        /**
         * Changed by Ravi Krishna Thota.
         * @param {*} aItems 
         * @param {*} sSelItem 
         */
        _saveGroupData: function(aItems, sSelItem){
            oController._setBusy('detailPage', true);
            var payload={}, aRequests=[];
            for(var i=0; i<aItems.length; i++){
                if(aItems[i].type === 'C' && aItems[i].name){
                    payload = {
                        name: aItems[i].name ? aItems[i].name.toUpperCase() : ''
                    };
                    let oListBinding = oModel.bindList(
                        "/" + sSelItem,
                        undefined,
                        undefined,
                        undefined,
                        { $$updateGroupId: "GroupIDCreateUpdateGrp" }
                      );
                      let oContext = oListBinding.create(payload);
                    // aRequests.push(this._writeData('Groups', 'POST', payload));
                } 
                // else if (aItems[i].type === 'D'){
                //     aRequests.push(this._writeData(`Groups/${aItems[i].name}`, 'DELETE', null));
                // }
            }
            // oController._setBusy('detailPage', true);
            // Promise.all(aRequests).then(function(data){
            //     this._setBusy('detailPage', false);
            //     MessageBox.success('Group data has been updated');
            //     this._bindData(sSelItem);
            // }.bind(this)).catch(function (error) {
            //     this._setBusy('detailPage', false);
            //     MessageBox.error("Sorry, an error has occurred");
            // }.bind(this));
            oModel.submitBatch("GroupIDCreateUpdateGrp")
            .then(function() {
                console.log("Batch operation successful");
                oController._setBusy('detailPage', false);
                MessageBox.success(sSelItem +' data has been updated');
                    oController._bindData(sSelItem);
                })
            .catch(function(oError) {
                console.error("Batch operation failed: ", oError);
                oController._setBusy('detailPage', false);
                MessageBox.error("Sorry, an error has occurred");
            });
        },
        /**
         * Changed by Ravi Krishna Thota.
         * @param {*} aItems 
         * @param {*} sSelItem 
         */
        _saveSubGroupData: function(aItems, sSelItem){
            // var payload={}, aRequests=[];
            // for(var i=0; i<aItems.length; i++){
            //     if(aItems[i].type === 'C'){
            //         payload = {
            //             name: aItems[i].name || '',
            //             group_name: aItems[i].group_name || ''
            //         };
            //         aRequests.push(this._writeData('SubGroup', 'POST', payload));
            //     } else if (aItems[i].type === 'D'){
            //         aRequests.push(this._writeData(`SubGroup/${aItems[i].ID}/${aItems[i].name}`, 'DELETE', null));
            //     }
            // }
            // this._setBusy('detailPage', true);
            // Promise.all(aRequests).then(function(data){
            //     this._setBusy('detailPage', false);
            //     MessageBox.success('Sub group data has been updated');
            //     this._bindData(sSelItem);
            // }.bind(this)).catch(function (error) {
            //     this._setBusy('detailPage', false);
            //     MessageBox.error("Sorry, an error has occurred");
            // }.bind(this));
            oController._setBusy('detailPage', true);
            let payload={};
            for(let i=0; i<aItems.length; i++){
                if(aItems[i].type === 'C' && aItems[i].name){                  
                    payload = {
                        name: aItems[i].name.toUpperCase() || '',
                        group_name: aItems[i].group_name || ''
                    };
                    let oListBinding = oModel.bindList(
                        "/" + sSelItem,
                        undefined,
                        undefined,
                        undefined,
                        { $$updateGroupId: "GroupIDCreateUpdateSub" }
                      );
                      let oContext = oListBinding.create(payload);
                } else if(aItems[i].type === 'U'){  
                    let oContext = oModel.bindContext("/" + sSelItem + "('"+ aItems[i].name + "')", undefined, { $$updateGroupId: "GroupIDCreateUpdateSub" });
                    oContext.oElementContext.setProperty("group_name", aItems[i].group_name);                                              
                } 
            }            
            oModel.submitBatch("GroupIDCreateUpdateSub")
            .then(function() {
                console.log("Batch operation successful");
                oController._setBusy('detailPage', false);
                MessageBox.success(sSelItem +' data has been updated');
                    oController._bindData(sSelItem);
                })
            .catch(function(oError) {
                console.error("Batch operation failed: ", oError);
                oController._setBusy('detailPage', false);
                MessageBox.error("Sorry, an error has occurred");
            });
        },
        _constructEmpPayload: function(obj, payload){
            if(obj){
                payload.name = obj.name || '';
                payload.code = obj.code || '';
                payload.email = obj.email || '';
                payload.team = obj.team || '';
                payload.managerName = obj.managerName || '';
                payload.managerCode = obj.managerCode || '';
                payload.managerEmail = obj.managerEmail || '';
                payload.isOwner = obj.isOwner || false;
                payload.isManager = obj.isManager || false;
                payload.isUser = obj.isUser || false;
                payload.hasCreatable = obj.hasCreatable || false;
                payload.hasUpdatble = obj.hasUpdatble || false;
            }
        },
        /**
         * Changed by Ravi Krishna Thota.
         * Create and Update Emp Data 
         * @param {*} aItems 
         * @param {*} sSelItem 
         */
        _saveEmpData: function(aItems, sSelItem){
            // var payload={}, aRequests=[];
            // for(var i=0; i<aItems.length; i++){
            //     if(aItems[i].type === 'C'){
            //         this._constructEmpPayload(aItems[i],payload);
            //         aRequests.push(this._writeData('Employee', 'POST', payload));
            //     } else if(aItems[i].type === 'U'){
            //         this._constructEmpPayload(aItems[i],payload);
            //         aRequests.push(this._writeData(`Employee(ID=${aItems[i].ID})`, 'PATCH', payload));
            //     } else if (aItems[i].type === 'D'){
            //         aRequests.push(this._writeData(`Employee/${aItems[i].ID}`, 'DELETE', null));
            //     }
            // }
            // this._setBusy('detailPage', true);
            // Promise.all(aRequests).then(function(data){
            //     this._setBusy('detailPage', false);
            //     MessageBox.success('Employee data has been updated');
            //     this._bindData(sSelItem);
            // }.bind(this)).catch(function (error) {
            //     this._setBusy('detailPage', false);
            //     MessageBox.error("Sorry, an error has occurred");
            // }.bind(this));

            oController._setBusy('detailPage', true);
            let payload={};
            for(let i=0; i<aItems.length; i++){
                if(aItems[i].type === 'C' && aItems[i].name){                  
                    oController._constructEmpPayload(aItems[i],payload)
                    let oListBinding = oModel.bindList(
                        "/" + sSelItem,
                        undefined,
                        undefined,
                        undefined,
                        { $$updateGroupId: "GroupIDCreateUpdateEMP" }
                      );
                      let oContext = oListBinding.create(payload);
                } else if(aItems[i].type === 'U'){  
                    let oContext = oModel.bindContext("/" + sSelItem + "('"+ aItems[i].ID + "')", undefined, { $$updateGroupId: "GroupIDCreateUpdateEMP" });
                    // oContext.oElementContext.setProperty("description", aItems[i].description);
                    oContext.oElementContext.setProperty("name",  aItems[i].name || '');
                    oContext.oElementContext.setProperty("code", aItems[i].code || '');
                    oContext.oElementContext.setProperty("email",  aItems[i].email || '');
                    oContext.oElementContext.setProperty("team",  aItems[i].team || '');
                    oContext.oElementContext.setProperty("managerName",  aItems[i].managerName || '');
                    oContext.oElementContext.setProperty("managerCode",   aItems[i].managerCode || '');
                    oContext.oElementContext.setProperty("managerEmail",   aItems[i].managerEmail || '');
                    oContext.oElementContext.setProperty("isOwner",  aItems[i].isOwner || false);
                    oContext.oElementContext.setProperty("isManager",  aItems[i].isManager || false);
                    oContext.oElementContext.setProperty("isUser",   aItems[i].isUser || false);
                    oContext.oElementContext.setProperty("hasCreatable",   aItems[i].hasCreatable || false);
                    oContext.oElementContext.setProperty("hasUpdatble",   aItems[i].hasUpdatble || false);                             
                } 
            }            
            oModel.submitBatch("GroupIDCreateUpdateEMP")
            .then(function() {
                console.log("Batch operation successful");
                oController._setBusy('detailPage', false);
                MessageBox.success(sSelItem +' data has been updated');
                    oController._bindData(sSelItem);
                })
            .catch(function(oError) {
                console.error("Batch operation failed: ", oError);
                oController._setBusy('detailPage', false);
                MessageBox.error("Sorry, an error has occurred");
            });
        },
        
        //Save Teams Data and Asset Status
        _constructTeams_AssetStatusPayload: function(obj, payload){
            if(obj){
                payload.description = obj.description || '';
            }
        },
        // No need req to this fun (Ravi Krishna Thota)
        // _saveTeamsorAssetStatusData1: function(aItems, sSelItem){
        //     var payload={}, aRequests=[];
            
        //     for(var i=0; i<aItems.length; i++){
        //         if(aItems[i].type === 'C'){
        //             //entity primary keys
        //             payload = {
        //                 name: aItems[i].name || ''
        //             };
        //             this._constructTeams_AssetStatusPayload(aItems[i], payload);
        //             aRequests.push(this._writeData(sSelItem, 'POST', payload));
        //         } else if (aItems[i].type === 'U'){
        //             this._constructTeams_AssetStatusPayload(aItems[i], payload);
        //             if(sSelItem === "Teams"){  
        //                 aRequests.push(this._writeData(`Teams/${aItems[i].name}`, 'PATCH', payload)); // New update fix
        //             }else if(sSelItem === "AssetStatus"){
        //                 aRequests.push(this._writeData(`AssetStatus/${aItems[i].name}`, 'PATCH', payload));
        //             }                    
        //         } else if (aItems[i].type === 'D'){
        //             if(sSelItem === "Teams"){
        //                 aRequests.push(this._writeData(`Teams/${aItems[i].name}`, 'DELETE', null));
        //             }else if(sSelItem === "AssetStatus"){
        //                 aRequests.push(this._writeData(`AssetStatus/${aItems[i].name}`, 'DELETE', null));
        //             }                   
        //         }           
        //     }
        //     this._setBusy('detailPage', true);
        //     Promise.all(aRequests).then(function(data){
        //         this._setBusy('detailPage', false);
        //         MessageBox.success(sSelItem+'data has been updated');
        //         this._bindData(sSelItem);
        //     }.bind(this)).catch(function (error) {
        //         this._setBusy('detailPage', false);
        //         MessageBox.error("Sorry, an error has occurred");
        //     }.bind(this));
        // },     

        //Save Request Type, Statuses, and Actions Data
        _constructGenericPayload: function(obj, payload){
            if(obj){
                payload.name = obj.name || '';
            }
        },
        /**
         * Changed by Ravi Krishna Thota.
         * Create and Update Generic Data 
         * @param {*} aItems 
         * @param {*} sSelItem 
         */
        _saveGenericTypeData: function(aItems, sSelItem){
            // var payload={}, aRequests=[];
            // for(var i=0; i<aItems.length; i++){
            //     if(aItems[i].type === 'C'){
            //         payload = {
            //             code: aItems[i].code || ''
            //         };
            //         this._constructGenericPayload(aItems[i], payload);
            //         aRequests.push(this._writeData(sSelItem, 'POST', payload));
            //     } else if (aItems[i].type === 'U'){
            //         this._constructGenericPayload(aItems[i], payload);
            //         aRequests.push(this._writeData(`${sSelItem}(code='${aItems[i].code}')`, 'PATCH', payload));
            //     } else if (aItems[i].type === 'D'){
            //         aRequests.push(this._writeData(`${sSelItem}/${aItems[i].code}`, 'DELETE', null));
            //     }
            // }
            // this._setBusy('detailPage', true);
            // Promise.all(aRequests).then(function(data){
            //     this._setBusy('detailPage', false);
            //     MessageBox.success(sSelItem+' data has been updated');
            //     this._bindData(sSelItem);
            // }.bind(this)).catch(function (error) {
            //     this._setBusy('detailPage', false);
            //     MessageBox.error("Sorry, an error has occurred");
            // }.bind(this));

            oController._setBusy('detailPage', true);
            let payload={};
            for(let i=0; i<aItems.length; i++){
                if(aItems[i].type === 'C' && aItems[i].code){                  
                    payload = {
                        code: aItems[i].code.toUpperCase() || ''
                    };
                    this._constructGenericPayload(aItems[i], payload);
                    let oListBinding = oModel.bindList(
                        "/" + sSelItem,
                        undefined,
                        undefined,
                        undefined,
                        { $$updateGroupId: "GroupIDCreateUpdateGen" }
                      );
                      let oContext = oListBinding.create(payload);
                } else if(aItems[i].type === 'U'){  
                    let oContext = oModel.bindContext("/" + sSelItem + "('"+ aItems[i].code + "')", undefined, { $$updateGroupId: "GroupIDCreateUpdateGen" });
                    oContext.oElementContext.setProperty("description", aItems[i].description);                                              
                } 
            }            
            oModel.submitBatch("GroupIDCreateUpdateGen")
            .then(function() {
                console.log("Batch operation successful");
                oController._setBusy('detailPage', false);
                MessageBox.success(sSelItem +' data has been updated');
                    oController._bindData(sSelItem);
                })
            .catch(function(oError) {
                console.error("Batch operation failed: ", oError);
                oController._setBusy('detailPage', false);
                MessageBox.error("Sorry, an error has occurred");
            });
        },
        onSaveData: function(){
         //   var oLocalModel = this.getView().getModel('LocalModel');
            var sSelItem = oLocalModel.getProperty('/SelItem');
            var aItems = $.extend(true,[],oLocalModel.getProperty('/'+sSelItem));
            // New Change
            if (!this.validateInputsPayloadData(aItems, sSelItem)) {
                MessageBox.information("Are you sure you want to update data?", {
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    emphasizedAction: MessageBox.Action.YES,
                    onClose: function (sAction) {
                        if(sAction === 'YES'){
                            if(sSelItem === "MaterialType"){
                                this._saveMaterialTypeData(aItems, sSelItem);
                            } else if(sSelItem === "BaseLocation"){
                                this._saveBaseLocData(aItems, sSelItem);
                            } else if(sSelItem === "Currency"){
                                this._saveCurrencyData(aItems, sSelItem);
                            } else if(sSelItem === "FunctionalLocation"){
                                this._saveFuncLocData(aItems, sSelItem);
                            } else if(sSelItem === "Groups"){
                                this._saveGroupData(aItems, sSelItem);
                            } else if(sSelItem === "SubGroup"){
                                this._saveSubGroupData(aItems, sSelItem);
                            } else if(sSelItem === "Employee"){
                                this._saveEmpData(aItems, sSelItem);
                            } else if(sSelItem === "RequestTypes" || sSelItem === "Statuses" || sSelItem === "Actions"){
                                this._saveGenericTypeData(aItems, sSelItem);
                            } else if(sSelItem === "Teams" || sSelItem === "AssetStatus"){
                                this._saveTeamsorAssetStatusData(aItems, sSelItem);
                            }
                        }
                    }.bind(this)
                });
            }
        },        
        _writeData: function(sPath, sMethod, payload){
            var oSettings;
            return new Promise(function(resolve, reject) {
                oSettings = {
                    url: oController.dataUrl +sPath,
                    method: sMethod,
                    contentType: "application/json",
                    success: function (data) {
                        resolve(data);
                    }.bind(this),
                    error: function(error){
                        reject(error);
                    }.bind(this)
                };
                if(payload){
                    oSettings.data = JSON.stringify(payload);
                }
                $.ajax(oSettings);
            });
        },
        /**
		 * Method to display the list
		 * @Param {oEvent} - event from input value help
		 */
        onValueHelpRequest: function (oEvent) {
            var oSrc = oEvent.getSource(),
                oBindingCtx = oSrc.getBindingContext('LocalModel'),
                sBindingPath = oBindingCtx.getPath(),
                oBindingObj = oBindingCtx.getObject(),
                oLocalModel = this.getView().getModel("LocalModel"),
                sSelectedInputFld = oSrc.data("vhProp"),
                aLocalDataProp = oSrc.data("localDataProp").split(','),
                aValueListProp = oSrc.data("valueListProp").split(','),
                titleProp, descProp, infoProp, dialogTitle, itemsObj = {}, aFilter=[], aKeyProps=[]; 
            oLocalModel.setProperty("/VHSelectedFieldName", sSelectedInputFld);
            oLocalModel.setProperty("/BindingPath", sBindingPath);
            for(var i=0; i<aLocalDataProp.length; i++){
                aKeyProps.push({
                    "LocalProp": aLocalDataProp[i],
                    "ValueListProp": aValueListProp[i]
                });
            }
            oLocalModel.setProperty("/VHKeyProperties", aKeyProps);
            oLocalModel.setProperty("/VHKeyProperties", aKeyProps);
            if (sSelectedInputFld === "manager") {
                itemsObj.path = "LocalModel>/Employee";
                itemsObj.model = oLocalModel;
                itemsObj.sorter = new Sorter("name", false);
                titleProp = "LocalModel>name";
                descProp = "LocalModel>email";
                infoProp = "LocalModel>code";
                dialogTitle = this.oBundle.getText("vhTitle.Manager");
                aFilter.push(new Filter( "isManager", sap.ui.model.FilterOperator.EQ, true));
                aFilter.push(new Filter( "code", sap.ui.model.FilterOperator.NE, oBindingObj.code));
                itemsObj.filters = aFilter;
            }
            if (!this._oValueHelpDialog) {
                this._oValueHelpDialog = sap.ui.xmlfragment("com.mindset.ui.assetwisepg.masterdata.fragment.Valuehelp", this);
                this.getView().addDependent(this._oValueHelpDialog);
            }
            itemsObj.template = new sap.m.StandardListItem({
                    title: "{" + titleProp + "}",
                    info: "{" + infoProp + "}",
                    description: descProp ? "{" + descProp + "}" : "",
                    type:"Active"
                });
            oLocalModel.setProperty("/valueHelpDlgTtl", dialogTitle);
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
                oLocalModel = this.getView().getModel("LocalModel"),
                aKeyProps = oLocalModel.getProperty("/VHKeyProperties"),
                oSelectedVHFieldName = oLocalModel.getProperty("/VHSelectedFieldName"),
                aFilter=[];
            if(sValue){
                if (oSelectedVHFieldName === "manager") {
                    for(var i=0; i<aKeyProps.length; i++){
                        aFilter.push(new Filter(aKeyProps[i].ValueListProp, sap.ui.model.FilterOperator.Contains, sValue));
                    }
                }
            }
            aFilter = new Filter({
                filters: aFilter,
                and: false
            });
            oSrc.getBinding("items").filter(aFilter);
        },
		/**
		 * Function calls when country/infotype f4 help gets closed
		 * Method to set input value based on the selected item
		 * @Param {oEvent} - item selection or close button event
		 */
        onValueHelpClose: function (oEvent) {
         //   var oLocalModel = this.getView().getModel("LocalModel");
            var aKeyProps = oLocalModel.getProperty("/VHKeyProperties");
            var sParentBindingPath = oLocalModel.getProperty("/BindingPath");
            var oSelectedItem = oEvent.getParameter("selectedItem");
            var oBindingCtx;
            if (!oSelectedItem) {
                return;
            }
            oBindingCtx = oSelectedItem.getBindingContext('LocalModel');
            for(var i=0; i<aKeyProps.length; i++){
                oLocalModel.setProperty(sParentBindingPath+'/'+aKeyProps[i].LocalProp, oBindingCtx.getObject()[aKeyProps[i].ValueListProp]);
            }
            oEvent.getSource().getBinding("items").filter([]);
            oLocalModel.setProperty("/saveBtnEnabled", true);
        },
        _setBusy: function(sId, bFlag){
            var oControl = this.getView().byId(sId) || sap.ui.getCore(sId).byId();
            oControl.setBusy(bFlag);
        },
        handleDownloadTemplate:function(oEvent){
            var oSrc = oEvent.getSource(), oSettings, oSheet,
                sPath = oSrc.data('Path'),aCols = [], sColumn,sDataType,
                oColObj, oLocalModel = this.getView().getModel("LocalModel"),
                templateData = oLocalModel.getProperty(sPath),
                tablColumns = oSrc.data('Columns'),
                dataObj = {};
                
            //Modifying data for Material Type for selected Keys
            if(sPath.split("/")[1] === "MaterialType"){
                var aTemplateData = structuredClone(templateData);
                var aFunArray = [], aSubGroup = [];
                aTemplateData.forEach(function(item, idx){
                    if(item.assignedFunctionalLocations && item.assignedFunctionalLocationsKeys.length > 0){
                        for(var funKeyIdx = 0; funKeyIdx < item.assignedFunctionalLocationsKeys.length ; funKeyIdx++){
                            for(var funIdx = 0; funIdx <  item.assignedFunctionalLocations.length ; funIdx++){
                                if(item.assignedFunctionalLocationsKeys[funKeyIdx] === item.assignedFunctionalLocations[funIdx].functionalLocation_ID){
                                    aFunArray.push(item.assignedFunctionalLocations[funIdx].functionalLocation_code);
                                }
                            }
                        }
                    }
                    item.assignedFunctionalLocationsKeys = aFunArray.toString();   
                    if(item.assignedSubGroups && item.assignedSubGroupsKeys.length > 0){
                        for(var subGrpKeyIdx = 0; subGrpKeyIdx < item.assignedSubGroupsKeys.length ; subGrpKeyIdx++){
                            for(var subIdx = 0; subIdx <  item.assignedSubGroups.length ; subIdx++){
                                if(item.assignedSubGroupsKeys[subGrpKeyIdx] === item.assignedSubGroups[subIdx].subGroup_ID){
                                    aSubGroup.push(item.assignedSubGroups[subIdx].subGroup_name);
                                }
                            }
                        }
                    }
                    item.assignedSubGroupsKeys = aSubGroup.toString();
                    item.assignedGroupsKeys = item.assignedGroupsKeys.toString();
                    item.assignedBaseLocationsKeys = item.assignedBaseLocationsKeys.toString();                   
                    item.assignedCurrenciesKeys = item.assignedCurrenciesKeys.toString();                   
                });
                templateData = aTemplateData;
            }
            for(var i=0; i < tablColumns.split(",").length ; i++){
                sColumn = tablColumns.split(",")[i].split("/");
                dataObj[sColumn[1]] = "";
                oColObj = {
                    label: sColumn[0],
                    type: sDataType,
                    property: sColumn[1]
                };
                if(sColumn[2].indexOf("str") >= 0){
                    oColObj["type"] =  EdmType.String;
                }else if(sColumn[2].indexOf("nbr") >= 0 ){
                    oColObj["type"] =  EdmType.Number;
                }else if(sColumn[2].indexOf("bool") >= 0){
                    oColObj["type"] =  EdmType.Boolean;
                    oColObj["trueValue"] = "YES";
                    oColObj["falseValue"] = "NO";
                }else if(sColumn[2].indexOf("double") >= 0){
                    oColObj["type"] =  EdmType.Double;
                }else if(sColumn[2].indexOf("date") >= 0){
                    oColObj["type"] =  EdmType.Date;
                }
                aCols.push(oColObj);
            }
            if (sPath && sPath === "/Employee") {
                // aCols.push({label: 'Manager Code', type: 'String', property: 'managerCode'});
                aCols.push({label: 'Manager Email', type: 'String', property: 'managerEmail'});
            }
            if(templateData && templateData.length === 0){
                templateData.push(dataObj);
            }
            oSettings = {
                workbook: {
                    columns: aCols,
                    context: {
                    sheetName: sPath.split("/")[1]
                    }
                },
                dataSource: templateData ? templateData : [],
                fileName: sPath.split("/")[1] +"_Template.xlsx",
                worker: false // We need to disable worker because we are using a MockServer as OData Service
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                oSheet.destroy();
            });
        },
        onFileUploadChange: function (oEvent) {
            var that = this;
            var file = oEvent.getParameter("files")[0];
            var fileName = file.name;
            var reader = new FileReader();
            var oSrc = oEvent.getSource(), oSettings, oSheet,
                sPath = oSrc.data('Path');
            that.sConfigKey = fileName && fileName.split("_")[1];
            that.sTableColumns = oSrc.data('TableColumns');
            that.sTablColProrp = oSrc.data("TableColumnsProperties");
            oLocalModel.setProperty("/sTablColProrp", oSrc.data("TableColumnsProperties"));
            that.getView().getModel("LocalModel").setProperty("/ErrorMessags", []);          
            reader.onload = function (e) {
              var data = new Uint8Array(e.target.result);
              var workbook = XLSX.read(data, {
                type: "array",
                cellDates: true
              });
              // Extract data from the first sheet
              var worksheet = workbook.Sheets[workbook.SheetNames[0]],
              jsonData = XLSX.utils.sheet_to_json(worksheet);
              if(jsonData && jsonData.length === 0){
                MessageBox.alert('No data found in the file.');
                return;
              }
              if(sPath === "Employee"){
                jsonData.forEach(function(oObject){
                    oObject.Creatable = oObject.Creatable === 1 ? "YES" : oObject.Creatable === 0 ? "NO" : oObject.Creatable;
                    oObject.Manager = oObject.Manager === 1 ? "YES" : oObject.Manager === 0 ? "NO" : oObject.Manager;
                    oObject.User = oObject.User === 1 ? "YES" : oObject.User === 0 ? "NO" : oObject.User;
                    oObject.Owner = oObject.Owner === 1 ? "YES" : oObject.Owner === 0 ? "NO" : oObject.Owner;
                    oObject.Updatable = oObject.Updatable === 1 ? "YES" : oObject.Updatable === 0 ? "NO" : oObject.Updatable;
                });
              }
              var sExcelColumns =[], count = 0, bIsMandateColumnExist = false, aTableCols = that.sTableColumns.split(",");
              for(var key in jsonData[0]){
                    sExcelColumns.push(key);
              }
              aTableCols.forEach(function(sColumn){
                    if(sExcelColumns.includes(sColumn)){
                        count = count + 1;
                    }
              });
              if(aTableCols.length === count){
                bIsMandateColumnExist = true;
              }

            if(bIsMandateColumnExist){
                var aPromises = [], aResult;
                    aPromises.push(new Promise(
                        function (resolve) {
                            aResult = that._validateExcelData(jsonData, sPath, resolve);						
                        }
                    ));
                    Promise.all(aPromises).then(
                        function (data) {
                            if(!that.uploadValidationErrorStatus){
                                // validation success
                                that.getView().getModel("LocalModel").setProperty("/"+sPath, $.extend(true,[],that.removeDuplicates(aResult)));
                                that.getView().getModel("LocalModel").setProperty('/SelItemDataCount', aResult.length);
                            }else{
                                // validatoin Error
                                that.getView().getModel("LocalModel").setProperty("/ErrorMessags", $.extend(true,[],aResult));
                                that.invokeMessagePopover();
                            }                           
                    });   
            }else {
                var aResult = [{
                    error:"Invalid Excel",
                    type:"Error",
                    title:"Invalid Excel",
                    subTitle:"Invalid Excel"
                }];
                that.getView().getModel("LocalModel").setProperty("/ErrorMessags", aResult);
                that.invokeMessagePopover();
            }
            
            };
            reader.readAsArrayBuffer(file);
          },
          removeDuplicates:function(arr) {
            var uniqueArray=[], aProperties = oLocalModel.getProperty("/sTablColProrp").split(",");
                jQuery.each(arr, function (idx, itm) {
                    var unique = true;
                    jQuery.each(uniqueArray, function (imx, itm2) {
                        aProperties.forEach(function(sPropery){
                            if (itm2[sPropery] === itm[sPropery]){
                                unique = false; 
                            }                            
                        });                    
                    });				
                    if (unique) {
                            uniqueArray.push(itm);
                        }
                });		
                return uniqueArray;                
                    
            },
          _validateExcelData:function(jsonData, sKey, resolve){
            var aModifiedColsData =[], errorArray = [], rowPosition, 
                oLocalModel = this.getView().getModel("LocalModel");
                if(sKey === "Teams"){                   
                    jsonData.forEach(function(row) {
                        rowPosition = row.__rowNum__ + 1;
                        if(row.Name && row.Name.length > 6){
                            errorArray.push({
                                error: "At Postion no:" + rowPosition +" - Name must be less than or equal to 6 characters.",
                                type:"Error",
                                title:row.Name + " Length error",
                                subTitle:row.Name + " Length error"
                            });
                        }else if(!row.Name || row.Name.trim().length === 0){
                            errorArray.push({
                                error: "At Postion no:" + rowPosition +" - Name is empty,it must be less than or equal to 6 characters. ",
                                type:"Error",
                                title: "Length error",
                                subTitle: "Length error"
                            });
                        }
                        aModifiedColsData.push({ 
                            name : row.Name ? row.Name : "", 
                            description : row.Description ? row.Description : "",
                            type: "C",
                            editable: true
                         });
                        
                    });
                                      
                }else if(sKey === "Employee"){
                    var aEmpTeams = [], aTeamsData = oLocalModel.getProperty("/Teams") || [] , aTempOrg = [], bError = false;                    
                    var sFieldsEmpty = [];
                     jsonData.forEach(function(row) {
                        if(row.Team){
                            aEmpTeams.push(row.Team);
                        }           
                        if(!row.Name){
                            sFieldsEmpty.push("Name");
                        }
                        if(!row.Code){
                            sFieldsEmpty.push("Code");
                        }
                        if(!row.Email){
                            sFieldsEmpty.push("Email");
                        }
                        if(sFieldsEmpty.length > 0){
                            errorArray.push({
                                error: "At Postion no:" + rowPosition +" - "+ sFieldsEmpty.toString() +" Field(s) should not be empty",
                                type:"Error",
                                title:row.Name + " Length error",
                                subTitle:row.Name + " Length error"
                            });   
                        }     
                        aModifiedColsData.push({ 
                            name : row.Name ? row.Name : "", 
                            code: row.Code ? row.Code.toString()  : "",
                            email: row.Email ? row.Email : "",
                            team: row.Team ? row.Team : "",
                            managerName: row["Reporting Manager"] ? row["Reporting Manager"]: "",
                            managerCode: "",
                            managerEmail: row["Manager Email"] || "",
                            isOwner: row.Owner && row.Owner.toUpperCase() === 'YES' ? true: false,
                            isManager: row.Manager && row.Manager.toUpperCase() === 'YES' ? true: false,
                            isUser: row.User && row.User.toUpperCase() === 'YES' ? true: false,
                            hasCreatable: row.Creatable && row.Creatable.toUpperCase() === 'YES' ? true: false,
                            hasUpdatble: row.Updatable && row.Updatable.toUpperCase() === 'YES' ? true: false,
                            type: "C",
                            editable: true
                         });
                        
                    });
                    bError = aTeamsData && aTeamsData.length === 0 ? true : false ;                    
                    aTeamsData.forEach(function(item){
                        aTempOrg.push(item.name);
                    });
                    aEmpTeams.forEach(function(item){
                        if(!aTempOrg.includes(item)){
                            bError = true;
                        }
                    });
                    if(aTeamsData.length === 0 && aEmpTeams.length === 0){
                        bError = false;
                    }else if(aTeamsData.length > 0 && aEmpTeams.length === 0){
                        bError = false;
                    }
                    if(bError){
                        errorArray.push({
                            error: "Teams Data is mismatching or empty",
                            type:"Error",
                            title:"Data error",
                            subTitle:" Data error"
                        });
                    }  

                }else if(sKey === "RequestTypes"){
                    jsonData.forEach(function(row) {
                        rowPosition = row.__rowNum__ + 1;
                        if(row.Code && row.Code.length > 3){
                            errorArray.push({
                                error: "At Postion no:" + rowPosition +" - Code must be less than or equal to 3 characters. ",
                                type:"Error",
                                title: "Length error",
                                subTitle:"Length error"
                            });  
                        }else if(!row.Code || row.Code.trim().length === 0){                            
                            errorArray.push({
                                error: "At Postion no:" + rowPosition +" - Code is empty,it must be less than or equal to 3 characters. ",
                                type:"Error",
                                title: "Length error",
                                subTitle:"Length error"
                            });  
                        }                                                    
                        aModifiedColsData.push({
                            code: row.Code ? row.Code.toString().toUpperCase() :"",
                            name: row.Name ? row.Name :"",
                            type: "C",
                            editable: true
                        });
                    });

                }else if(sKey === "Currency"){
                    var sFieldsEmpty = [];
                    jsonData.forEach(function(row) {
                        rowPosition = row.__rowNum__ + 1;
                        if(row.Code && row.Code.length > 3){
                            errorArray.push({
                                error: "At Postion no:" + rowPosition +" - Code must be less than or equal to 3 characters. ",
                                type:"Error",
                                title: "Length error",
                                subTitle:"Length error"
                            });  
                        }
                        if(!row.Name || row.Name.trim().length === 0){                            
                            errorArray.push({
                                error: "At Postion no:" + rowPosition +" - Name is empty,it must be less than or equal to 3 characters. ",
                                type:"Error",
                                title: "Name error",
                                subTitle:"Name error"
                            });  
                        }
                        if(row.Symbol && row.Symbol.length > 5){
                            errorArray.push({
                                error: "At Postion no:" + rowPosition +" - Symbol must be less than or equal to 5 characters. ",
                                type:"Error",
                                title: "Length error",
                                subTitle:"Length error"
                            });  
                        }                        
                        aModifiedColsData.push({
                            code: row.Code ? row.Code.toString().toUpperCase() :"",
                            name: row.Name ? row.Name :"",
                            symbol: row.Symbol ? row.Symbol :"",
                            type: "C",
                            editable: true
                        });
                    });
                }else if(sKey === "BaseLocation"){
                    jsonData.forEach(function(row) {
                        aModifiedColsData.push({
                            code: row.Code ? row.Code.toString().toUpperCase() :"",                           
                            type: "C",
                            editable: true
                        });
                    });
                }else if(sKey === "FunctionalLocation"){
                    var aBaseLocations = oLocalModel.getProperty("/BaseLocation"), aSelBaseLoc = [];
                    if(aBaseLocations && aBaseLocations.length > 0){                        
                        jsonData.forEach(function(row) {
                            rowPosition = row.__rowNum__ + 1;
                            //validation for Code should not be empty
                            if(!row.Code || row.Code.trim().length === 0){
                                errorArray.push({
                                    error: "At Postion no:" + rowPosition +" - Code should not be empty.",
                                    type:"Error",
                                    title: "Code is empty",
                                    subTitle:"Code is empty"
                                });
                            }
                            if(!row["Base Location"] || row["Base Location"].trim().length === 0){
                                errorArray.push({
                                    error: "At Postion no:" + rowPosition +" - Base Location should not be empty.",
                                    type:"Error",
                                    title: "Base Location is empty",
                                    subTitle:"Base Location is empty"
                                });
                            }
                            if(row["Base Location"]){
                                let aArray = [];
                                aBaseLocations.forEach(function(baseLocRow, baseLocIdx){
                                    if (baseLocRow.code) {
                                        aArray.push(baseLocRow.code);
                                    }                                    
                                });
                                if (!aArray.includes(row["Base Location"])) {                                   
                                    errorArray.push({
                                        error: "At Postion no:" + rowPosition +" - Base Location ("+ row["Base Location"] +") is not matching with the existing Base locations.",
                                        type:"Error",
                                        title: "Base Location is not matching",
                                        subTitle:"Base Location is not matching"
                                    });
                                }
                            }
                            aModifiedColsData.push({
                                code: row.Code ? row.Code.toString().toUpperCase() :"",   
                                baseLocationCode: row["Base Location"] ? row["Base Location"] : "",
                                type: "C",
                                editable: true
                            });
                        });
                    }else{
                        errorArray.push({
                            error: "Please check Base Locations do not exist, to add Functional Locations, Base Locations are required.",
                            type:"Error",
                            title: "Base Locations  do not exist.",
                            subTitle:"Base Locations  do not exist."
                        });
                    }
                }else if(sKey === "Groups"){
                    jsonData.forEach(function(row) {
                        aModifiedColsData.push({
                            name: row.Name ? row.Name.toString().toUpperCase() : "",                           
                            type: "C",
                            editable: true
                        });
                    });
                }else if(sKey === "SubGroup"){
                    var GroupsData = oLocalModel.getProperty("/Groups");
                    if(GroupsData && GroupsData.length > 0){
                    jsonData.forEach(function(row) {                        
                        rowPosition = row.__rowNum__ + 1;
                            //validation for Code should not be empty
                            if(!row.Name || row.Name.trim().length === 0){
                                errorArray.push({
                                    error: "At Postion no:" + rowPosition +" - Name should not be empty.",
                                    type:"Error",
                                    title: "Name is empty",
                                    subTitle:"Name is empty"
                                });
                            }
                            if(!row["Group"] || row["Group"].trim().length === 0){
                                errorArray.push({
                                    error: "At Postion no:" + rowPosition +" - Groups should not be empty.",
                                    type:"Error",
                                    title: "Groups are empty",
                                    subTitle:"Groups are empty"
                                });
                            }
                            if(row["Group"]){
                                let aArray = [];
                                GroupsData.forEach(function(GroupsRow, baseLocIdx){
                                    if (GroupsRow.name) {
                                        aArray.push(GroupsRow.name);
                                    }                                      
                                });

                                if(!aArray.includes(row["Group"])){
                                    errorArray.push({
                                        error: "At Postion no:" + rowPosition +" - Group ("+ row["Group"] +") is not matching with the existing Groups.",
                                        type:"Error",
                                        title: "Group is not matching",
                                        subTitle:"Group is not matching"
                                    });
                                }
                            }
                            // Groups.forEach(function(groupsObj){                                
                            // });
                            aModifiedColsData.push({
                                name: row.Name ? row.Name.toString() :"",    
                                group_name:row.Group ? row.Group.toUpperCase() :"",
                                type: "C",
                                editable: true
                            });
                        
                    });
                }else{
                    errorArray.push({
                        error: "Please check Groups are does not exist, to add Sub Groups, Groups are required.",
                        type:"Error",
                        title: "Groups does not exist.",
                        subTitle:"Groups does not exist."
                    });
                }
                }else if(sKey === "MaterialType"){
                    var Currencies, BaseLocations, FunctionalLocations, GroupsData, SubGroupsData, selectedKeys;
                    Currencies = oLocalModel.getProperty("/Currency") ? oLocalModel.getProperty("/Currency") : [];
                    BaseLocations = oLocalModel.getProperty("/BaseLocation") ? oLocalModel.getProperty("/BaseLocation") : [];
                    FunctionalLocations = oLocalModel.getProperty("/FunctionalLocation") ? oLocalModel.getProperty("/FunctionalLocation") : [];
                    GroupsData = oLocalModel.getProperty("/Groups") ? oLocalModel.getProperty("/Groups") : [];
                    SubGroupsData = oLocalModel.getProperty("/SubGroup") ? oLocalModel.getProperty("/SubGroup") : [];
                             
                        jsonData.forEach(function(row) {
                            rowPosition = row.__rowNum__ + 1;
                            // Currency Validation 
                            if(row.Currency && row.Currency.length > 0){
                                if(Currencies.length > 0){
                                    selectedKeys = row.Currency.split(",");
                                    Currencies.forEach(function(currenyObj, idx){
                                        if(selectedKeys.indexOf(currenyObj.code.trim()) === -1){
                                            errorArray.push({
                                                error: "At Postion no:" + rowPosition +"- ' "+ selectedKeys[idx] + "'  currency does not already exist in the Currencies list, please add it",
                                                type:"Error",
                                                title: "Currencies does not exist.",
                                                subTitle: " Currencies does not exist."
                                            });
                                        }
                                    });
                                }else{
                                    errorArray.push({
                                        error: "Please check Currencies are do not exist, please add.",
                                        type:"Error",
                                        title: "Currencies does not exist.",
                                        subTitle: " Currencies does not exist."
                                    });
                                }

                            }   
                            //BaseLocation validation
                            if(row["Base Location"] && row["Base Location"].length > 0){
                                if(BaseLocations.length > 0){
                                    selectedKeys = row["Base Location"].split(",");
                                    BaseLocations.forEach(function(baseLocObj, idx){
                                        if(selectedKeys.indexOf(baseLocObj.code.trim()) === -1){
                                            errorArray.push({
                                                error: "At Postion no:" + rowPosition +"- '"+ selectedKeys[idx] + "' Baselocation does not already exist in the BaseLocations list, please add it",
                                                type:"Error",
                                                title: "Baselocation does not exist.",
                                                subTitle: " Baselocation does not exist."
                                            });
                                        }
                                    });
                                }else{
                                    errorArray.push({
                                        error: "Please check Baselocation are do not exist, please add.",
                                        type:"Error",
                                        title: "Baselocation does not exist.",
                                        subTitle: " Baselocation does not exist."
                                    });
                                }

                            } 
                            //validating functional locations
                            if(row["Functional Location"] && row["Functional Location"].length > 0){
                                if(FunctionalLocations.length > 0){
                                    selectedKeys = row["Functional Location"].split(",");
                                    FunctionalLocations.forEach(function(funLocObj, idx){
                                        if(selectedKeys.indexOf(funLocObj.code.trim()) === -1){
                                            errorArray.push({
                                                error: "At Postion no:" + rowPosition +"- '"+ selectedKeys[idx] + "'  Functional Location does not already exist in the Functional Locations list, please add it",
                                                type:"Error",
                                                title: "Functional Location does not exist.",
                                                subTitle: " Functional Location does not exist."
                                            });
                                        }
                                    });
                                }else{
                                    errorArray.push({
                                        error: "Please check Funcional Locations  does not exist, please add.",
                                        type:"Error",
                                        title: "Funcional Location does not exist.",
                                        subTitle: " Funcional Location does not exist."
                                    });
                                }

                            }
                            //Validating Groups
                            if(row.Group && row.Group.length > 0){
                                if(GroupsData.length > 0){
                                    selectedKeys = row.Group.split(",");
                                    GroupsData.forEach(function(groupsObj, idx){
                                        if(selectedKeys.indexOf(groupsObj.code.trim()) === -1){
                                            errorArray.push({
                                                error: "At Postion no:" + rowPosition +"- '"+ selectedKeys[idx] + "'  Groups does not already exist in the Groups list, please add it",
                                                type:"Error",
                                                title: "Groups does not exist.",
                                                subTitle: " Groups does not exist."
                                            });
                                        }
                                    });
                                }else{
                                    errorArray.push({
                                        error: "Please check Groups  does not exist, please add.",
                                        type:"Error",
                                        title: "Groups does not exist.",
                                        subTitle: "Groups Location does not exist."
                                    });
                                }
                            }
                            //validating Sub Groups

                            if(row["Sub Group"] && row["Sub Group"].length > 0){
                                if(SubGroupsData.length > 0){
                                    selectedKeys = row["Sub Group"].split(",");
                                    SubGroupsData.forEach(function(subGroupObj, idx){
                                        if(selectedKeys.indexOf(subGroupObj.code.trim()) === -1){
                                            errorArray.push({
                                                error: "At Postion no:" + rowPosition +"- '"+ selectedKeys[idx] + "' Sub Groups does not already exist in the Sub Groups list, please add it",
                                                type:"Error",
                                                title: "Sub Groups does not exist.",
                                                subTitle: " Sub Groups does not exist."
                                            });
                                        }
                                    });
                                }else{
                                    errorArray.push({
                                        error: "Please check Sub Groups are do not exist, please add.",
                                        type:"Error",
                                        title: "Sub Groups does not exist.",
                                        subTitle: "Sub Groups does not exist."
                                    });
                                }
                            }

                            aModifiedColsData.push({
                                name: row.Name ? row.Name :"",                           
                                assignedCurrenciesKeys:row.Currency ? row.Currency.split(",").map(el => el.trim()) : [],
                                assignedBaseLocationsKeys:row["Base Location"] ? row["Base Location"].split(",").map(el => el.trim()) : [],
                                assignedFunctionalLocationsKeys:row["Functional Location"] ? row["Functional Location"].split(",").map(el => el.trim()) : [],
                                assignedGroupsKeys: row.Group ? row.Group.split(",").map(el => el.trim()) : [],
                                assignedSubGroupsKeys:row["Sub Group"] ? row["Sub Group"].split(",").map(el => el.trim()) : [],
                                type: "C",
                                editable: true
                            });
                        });
                   

                }else if(sKey === "Actions"){
                    jsonData.forEach(function(row) {
                        rowPosition = row.__rowNum__ + 1;
                        if(row.Code && row.Code.length > 4){
                            errorArray.push({
                                error: "At Postion no:" + rowPosition +" - Code must be less than or equal to 4 characters. ",
                                type:"Error",
                                title: "Length error",
                                subTitle:"Length error"
                            });  
                        }else if(!row.Code || row.Code.trim().length === 0){                            
                            errorArray.push({
                                error: "At Postion no:" + rowPosition +" - Code is empty,it must be less than or equal to 4 characters. ",
                                type:"Error",
                                title: "Length error",
                                subTitle:"Length error"
                            });  
                        }                                                    
                        aModifiedColsData.push({
                            code: row.Code ? row.Code.toString().toUpperCase() :"",
                            name: row.Name ? row.Name :"",                           
                            type: "C",
                            editable: true
                        });
                    });
                }else if(sKey === "Statuses"){
                    jsonData.forEach(function(row) {
                        rowPosition = row.__rowNum__ + 1;
                        if(row.Code && row.Code.length > 3){
                            errorArray.push({
                                error: "At Postion no:" + rowPosition +" - Code must be less than or equal to 3 characters. ",
                                type:"Error",
                                title: "Length error",
                                subTitle:"Length error"
                            });  
                        }else if(!row.Code || row.Code.trim().length === 0){                            
                            errorArray.push({
                                error: "At Postion no:" + rowPosition +" - Code is empty,it must be less than or equal to 3 characters. ",
                                type:"Error",
                                title: "Length error",
                                subTitle:"Length error"
                            });  
                        }                                                    
                        aModifiedColsData.push({
                            code: row.Code ? row.Code.toString().toUpperCase() :"",
                            name: row.Name ? row.Name :"",                           
                            type: "C",
                            editable: true
                        });
                    });

                }else if(sKey === "AssetStatus"){
                    jsonData.forEach(function(row) {
                        rowPosition = row.__rowNum__ + 1;
                        if(!row.Name || row.Name.trim().length === 0){
                            errorArray.push({
                                error: "At Postion no:" + rowPosition +" - Name is empty. ",
                                type:"Error",
                                title: "Length error",
                                subTitle: "Length error"
                            });
                        }
                        aModifiedColsData.push({ 
                            name : row.Name ? row.Name : "", 
                            description : row.Description ? row.Description : "",
                            type: "C",
                            editable: true
                         });
                        
                    });
                }
                if(resolve)
                    resolve();

                if(errorArray && errorArray.length === 0){
                    this.uploadValidationErrorStatus = false;
                    return aModifiedColsData; 
                }else{
                    this.uploadValidationErrorStatus = true;
                    return errorArray;
                }         
                      
          },
        createMessagePopover:function(){
            var that = this;
            that.oMP = sap.ui.xmlfragment("com.mindset.ui.assetwisepg.masterdata.fragment.ErrorMessage", that);
            that.getView().addDependent(that.oMP);
        },
        handleMessagePopoverPress: function (oEvent) {
            var that = this;
			if (!that.oMP) {
				that.createMessagePopover();
			}
			that.oMP.toggle(oEvent.getSource());
		},
        invokeMessagePopover:function(){
            var that = this;
            var oMessagePopoverBtnId = that.getView().byId("messagePopoverBtn");
            this.oMP.getBinding("items").attachChange(function(oEvent){
				this.oMP.navigateBack();
			}.bind(this));
            setTimeout(function(){
				this.oMP.openBy(oMessagePopoverBtnId);
			}.bind(this), 100);
        },
        //=====================================================================================//
        //=============================== New Changes By Ravi Krishna Thota====================//
        //====================================================================================//
        /**
         *  Input values validation functionality.
         * @param {*} aItems 
         * @param {*} sSelItem 
         * @returns 
         */
        validateInputsPayloadData: function (aItems, sSelItem){
            let bFlag = false, aArray = [], aOrgArray = [];
            oController.aValidateArray = [];
            if (sSelItem && aItems && aItems.length > 0 ) {
                if (sSelItem === "Teams") {
                    aItems.forEach(element => {
                        if (!element.name || !element.description) {
                            element.valueStateN = element.name ? 'None' : 'Error';
                            element.valueStateD = element.description ? 'None' : 'Error';
                            aArray.push(element);
                        } else {
                            delete element.valueStateN;
                            delete element.valueStateD;
                        }
                        aOrgArray.push(element);
    
                    });
                } else if (sSelItem === "MaterialType" || sSelItem === "Employee") { // TBD
                    /*aItems.forEach(element => {
                        if (!element.name) {
                            element.valueStateN = element.name ? 'None' : 'Error';
                            aArray.push(element);
                        } else {
                            delete element.valueStateN;
                        }
                        aOrgArray.push(element);    
                    });*/
                }
                
                oLocalModel.setProperty('/'+sSelItem, aOrgArray);
            }
            return bFlag = aArray.length > 0 ? true : false;
        },
        /**
         *  Copy desc to name (Request Type)
         * @param {*} oEvent 
         */
        onChangeReqType: function(oEvent) {
            let oSrc = oEvent.getSource();
            let oBindingCtx = oSrc.getBindingContext('LocalModel');
            let sPath = oBindingCtx.getPath();
            let sText = oSrc && oSrc.getSelectedItem() && oSrc.getSelectedItem().getAdditionalText(); 
            let aArray = oLocalModel.getProperty("/" + sPath.split("/")[1]) || [];
            let sKey = oSrc && oSrc.getSelectedItem() && oSrc.getSelectedItem().getKey();
            let aArrayData = [];  let aArrayDataNew = [];
            if(sPath && !sPath.includes("/AssetStatus") && sText){
                oLocalModel.setProperty(sPath+'/name', sText);
            } 
            if(sPath && sPath.includes("/AssetStatus") && sText){
                oLocalModel.setProperty(sPath+'/description', sText);
            } 
            if (aArray && aArray.length === 1) {
                aArrayDataNew = aArray;
            } else if (aArray.length > 1) {   
                aArray.forEach(element => {
                    if (!sPath.includes("/AssetStatus") && element.code === sKey && !aArrayData.includes(element.code)) {
                        aArrayData.push(element.code);                     
                    } else if (sPath.includes("/AssetStatus") && element.name === sKey && !aArrayData.includes(element.name)) {
                        aArrayData.push(element.name);  
                    } else if (!sPath.includes("/AssetStatus") && !aArrayData.includes(element.code)) {
                        aArrayData.push(element.code);
                    } else if (sPath.includes("/AssetStatus") && !aArrayData.includes(element.name)) {
                        aArrayData.push(element.name);
                    } else if (!sPath.includes("/AssetStatus") && element.code === sKey && aArrayData.includes(element.code)) {
                        element.bFlag = false;
                    } else if (sPath.includes("/AssetStatus") && element.name === sKey && aArrayData.includes(element.name)) {
                        element.bFlag = false;
                    }
                });
            }
            if (aArray && aArray.length > 1) {
                aArray.forEach(element => {
                    if (!sPath.includes("/AssetStatus") && element && aArrayData.includes(element.code) && element.bFlag !== false) {
                        aArrayDataNew.push(element);
                    } else if (sPath.includes("/AssetStatus") && element && aArrayData.includes(element.name) && element.bFlag !== false) {
                        aArrayDataNew.push(element);
                    }
                });    
            }            
            oLocalModel.setProperty("/" + sPath.split("/")[1], aArrayDataNew);
        },
        /**
         * Save data
         * @param {*} aItems 
         * @param {*} sSelItem 
         */
        _saveTeamsorAssetStatusData: function(aItems, sSelItem){
            oController._setBusy('detailPage', true);
            var payload={}, aRequests=[], bFlageD = false, bFlageCU = false;
            for(var i=0; i<aItems.length; i++){
                if(aItems[i].type === 'C' && aItems[i].name){
                    bFlageCU = true;
                    //entity primary keys
                    payload = {
                        name: aItems[i].name.toUpperCase() || ''
                    };
                    this._constructTeams_AssetStatusPayload(aItems[i], payload);
                    var oListBinding = oModel.bindList(
                        "/" + sSelItem,
                        undefined,
                        undefined,
                        undefined,
                        { $$updateGroupId: "GroupIDCreateUpdateTS" }
                      );
                      var oContext = oListBinding.create(payload);
                    // aRequests.push(this._writeData(sSelItem, 'POST', payload));
                } else if(aItems[i].type === 'U'){     
                    bFlageCU = true;               
                    var oContext = oModel.bindContext("/" + sSelItem + "('"+ aItems[i].name + "')", undefined, { $$updateGroupId: "GroupIDCreateUpdateTS" });
                    oContext.oElementContext.setProperty("description", aItems[i].description);                 
                      
                } 
            }            
            oModel.submitBatch("GroupIDCreateUpdateTS")
            .then(function() {
                console.log("Batch operation successful");
                oController._setBusy('detailPage', false);
                MessageBox.success(sSelItem +' data has been updated');
                    oController._bindData(sSelItem);
                })
            .catch(function(oError) {
                console.error("Batch operation failed: ", oError);
                oController._setBusy('detailPage', false);
                MessageBox.error("Sorry, an error has occurred");
            });
        },
        /**
         * Delete data
         * @param {*} aItems 
         * @param {*} sSelItem 
         */
        _saveTeamsorAssetStatusDataDelete: function(aItems, sTablename, sSelItem) {
            let aRequests = [], sName = "";
            aItems.forEach(element => {
                if (sSelItem === "/Teams" || sSelItem === "/AssetStatus" || sSelItem === "/Groups" || sSelItem === "/MaterialType") {
                    sName = element.name || "";
                } else if ( sSelItem === "/Employee") {
                    sName = element.ID || "";
                } else if (sSelItem === "/RequestTypes" || sSelItem === "/Statuses" || sSelItem === "/Currency" ||
                         sSelItem === "/Actions" || sSelItem === "/BaseLocation" || sSelItem === "/FunctionalLocation") {
                      if (sSelItem === "/FunctionalLocation") {
                        sName =  (element.ID + '/' + element.code) || "";
                      } else {                            
                        sName = element.code || "";
                      } 
                } else if (sSelItem === "/SubGroup") {
                    sName =  (element.ID + '/' + element.name) || "";
                }
                if (sName && element.type === "D") {
                    let uPath;
                    if (sSelItem === "/SubGroup" || sSelItem === "/FunctionalLocation") {
                        uPath = sSelItem + "/" + sName;
                    } else {
                        uPath = sSelItem + "('" + sName + "')";
                    }
                     
                    aRequests.push(new Promise(
                        function (resolve) {                                                                      
                        oModel.delete(uPath).then(function() { if (resolve) {resolve()}});
                    }));
                }
            });            
            oController._setBusy('detailPage', true);
            Promise.all(aRequests).then(function(data){
                oController._setBusy('detailPage', false);
                sSelItem = sSelItem.split("/")[1];
                MessageBox.success(oController.oBundle.getText(sSelItem) + ' data has been deleted');
                oController._bindData(sSelItem);
            }.bind(this)).catch(function (error) {
                oController._setBusy('detailPage', false);
                MessageBox.error("Sorry, an error has occurred");
            }.bind(this));
        }

        //==========================================================================================//
        //==========================================================================================//
        //==========================================================================================//
    });
});
    