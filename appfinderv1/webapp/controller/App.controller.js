sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "./lib/jszip",
    "./lib/xlsx",
    "sap/ui/core/util/Export",
    "sap/ui/core/util/ExportTypeCSV",
    "sap/ui/core/IconPool",
    'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, jszip, xlsx, Export, ExportTypeCSV, IconPool, library, Spreadsheet, Filter, FilterOperator,Fragment) {
        "use strict";
        var oController, oLocalModel;
        return Controller.extend("com.mindset.accelerator.appfinder.controller.App", {
            onInit: function () {
                oController = this;
                oController.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                var oSmartTable = this.getView().byId("smartTable");
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
                oLocalModel = oController.getView().getModel("LocalModel");
                oLocalModel.setProperty("/chooseFromOption", 0);
                oLocalModel.setProperty("/chooseVersion", "");
                oLocalModel.setProperty("/TCodesCount", 0);
                oLocalModel.setProperty("/ExporBtnEnable", false);
                oLocalModel.setProperty("/displaySelect","Table");
                oLocalModel.setProperty("/chartType","column");
                oSmartTable.applyVariant({});
                oController.getReleaseVersions();
            },
            getReleaseVersions: function(){
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
                        sap.m.MessageBox.error("Failed to load the release versions !!");
                    }
                });
            },
            onPressSubmit: function(oEvent){
                var oSmartTable = this.getView().byId("smartTable");
                var sEnteredTCodes = oLocalModel.getProperty("/PastedTcodes");
                var aExcelTcodes = oLocalModel.getProperty("/ExcelTcodes");
                var iSelectedIdx = oLocalModel.getProperty("/chooseFromOption");
                var oBusyDialog = new sap.m.BusyDialog({
                    text: "Loading applications..."
                });
                var aTCodes;
                oSmartTable.applyVariant({});
                if(iSelectedIdx === 0){
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
                if(aTCodes && aTCodes.length > 0){
                    var aTriggerAjaxCall = [];
                    for(var i=0; i<aTCodes.length; i++){
                        aTriggerAjaxCall.push(this.makePromiseAjaxCall(aTCodes[i],"/InputFilterParam(InpFilterValue='"+aTCodes[i].trim()+"')/Results"));
                    }
                    oBusyDialog.open();
                    oLocalModel.setProperty("/displaySelect","Table");
                    Promise.all(aTriggerAjaxCall).then(function(values){
                        var aFinal = [], aFunArea = [], aSplitArr =[] , aAppType = [] , aUiTechnology= [], aJobRole = [];
                        for(var i=0; i<values.length; i++){
                            aFinal=aFinal.concat(values[i].results);
                            values[i].results.forEach(element => {
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
                        aFunArea = [... new Set(aFunArea)];
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
                        oController.make_Separate_Reuslts(aFinal, aFunArea);
                        oBusyDialog.close();
                        oLocalModel.setProperty("/aFunArea",aFunArea);
                        oLocalModel.setProperty("/Apps",aFinal);
                        oLocalModel.setProperty("/TCodesCount", aTCodes.length);
                        oSmartTable.rebindTable();
                        //oController._attachChartProperties();
                    }).catch(function (error) {
                        oBusyDialog.close();
                        sap.m.MessageBox.error("Invalid TCode(s) found. Please remove and try again");
                    });
                } else {
                    sap.m.MessageBox.error("Invalid file uploaded. Please try again..");
                }
            },
            onChangeTCodesInput: function(oEvent){
                oLocalModel.setProperty("/PastedTcodes", oEvent.getSource().getValue());
            },
            onPressLink: function(oEvent){
                sap.m.URLHelper.redirect(oEvent.getSource().getBindingContext("LocalModel").getObject().AppLink,true);
            },
            onSelectRdBtn: function(){
                oLocalModel.setProperty("/File", "");
            },
            onCustomExcelExport: function() {
               var aFunArea =  oLocalModel.getProperty("/aFunArea");
                var aAppsFromNone = oLocalModel.getProperty("/NONE");
                var workSheet, sSheetName;
                var oWorkbook = XLSX.utils.book_new();
                for(var i = 0; i< aFunArea.length; i++){
                    aFunArea[i] = aFunArea[i].replace(/[\/\\#,+()$~%.'":*?<>{}]/g, ' ').replace("&", "and");
                    sSheetName = aFunArea[i];
                    workSheet = XLSX.utils.json_to_sheet(oController.make_Sheet_Json(oLocalModel.getProperty("/"+aFunArea[i]+"_Results")));
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
                    workSheet = XLSX.utils.json_to_sheet(oController.make_Sheet_Json(aAppsFromNone));
                    jQuery.each(workSheet, function(cell, item) {
                        if (item.v != null && item.v.toString().indexOf('http') == 0){
                            workSheet[cell].l = {
                                Target: item.v.toString()
                              };
                        }
                    });
                    XLSX.utils.book_append_sheet(oWorkbook, workSheet, "NONE");
                }
                var sFileName = oLocalModel.getProperty("/chooseVersion") ? oLocalModel.getProperty("/releaseName") + " - " + oLocalModel.getProperty("/chooseVersion") + ".xlsx" : "All Applications.xlsx";
                XLSX.writeFile(oWorkbook, sFileName);
            },
            make_Sheet_Json:function(aResult){
                var that = this;
                var oTable = that.getView().byId("smartTable").getTable();
                var aFunArea = $.extend(true, [], aResult);
                var Obj = {}, aModifiedResult = [];
                if(aFunArea && aFunArea.length > 0){
                    aFunArea.forEach(element => {
                        Obj={};
                        for(var i=0; i<oTable.getColumns().length; i++){
                            if(oTable.getColumns()[i].getVisible()){
                                if(oTable.getColumns()[i].getLabel().getText() === that.oBundle.getText("lighthouse")){
                                    Obj[oTable.getColumns()[i].getLabel().getText()] = oController.Lighthouse_Values(element.Lighthouse);
                                } else if(oTable.getColumns()[i].getLabel().getText() === that.oBundle.getText("deviceTypes")){
                                    Obj[oTable.getColumns()[i].getLabel().getText()] = element.FormFactors;
                                } else if(oTable.getColumns()[i].getLabel().getText() === that.oBundle.getText("funcArea")){
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
            onChooseVersionValueHelpOpen:function(){
                if (!oController._ChooseVHPoDialog) {
                    oController._ChooseVHPoDialog = sap.ui.xmlfragment("com.mindset.accelerator.appfinder.fragment.ChooseVersionVH", oController);
                    oController.getView().addDependent(oController._ChooseVHPoDialog);
                 }
                oController._ChooseVHPoDialog.getBinding("items").filter([]);
                oController._ChooseVHPoDialog.open();
            },
            onDialogConfirm:function(oEvent){
                var oSelectedItem = oEvent.getParameter("selectedItem");
                if(oSelectedItem){
                    var oBinding = oSelectedItem.getBindingContext("LocalModel").getObject();
                    oLocalModel.setProperty("/chooseVersion",oBinding.releaseId);
                    oLocalModel.setProperty("/releaseName",oBinding.releaseName);
                    oLocalModel.setProperty("/releaseId",oBinding.releaseId);
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
            handleSearch: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oBinding = oEvent.getSource().getBinding("items");
                var aFilters = [];
                if(sValue){
                    aFilters = new Filter({
                        filters: [
                            new Filter("releaseName", FilterOperator.Contains, sValue.toUpperCase()),
                            new Filter("releaseId", FilterOperator.Contains, sValue.toUpperCase()),
                            new Filter("externalName", FilterOperator.Contains, sValue)
                        ],
                        and: false
                    });
                }
                oBinding.filter(aFilters);
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
                 var oSrc       = oEvent.getSource();
                 var aTableData = oLocalModel.getProperty("/Apps");
                 var oSmartTable = oController.getView().byId("smartTable");
                 var aIndices = oSmartTable.getTable().getBinding("rows").aIndices;
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
                    if(aFinalArray && aFinalArray.length > 0 ){
                        oController.make_Separate_Reuslts(aFinalArray, oLocalModel.getProperty("/aFunArea"));
                    }else{
                        oController.make_Separate_Reuslts(aTableData, oLocalModel.getProperty("/aFunArea"));
                    }
                }
                
            },
            onPressInfoBtn: function(oEvent){
                var oButton = oEvent.getSource(),
				oView = this.getView();

                // create popover
                if (!this._pPopover) {
                    this._pPopover = sap.ui.core.Fragment.load({
                        id: oView.getId(),
                        name: "com.mindset.accelerator.appfinder.fragment.InfoPopover",
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
                    sap.m.MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
                }).then(function() {
                    oExport.destroy();
                });
            },
            onChangeUpload: function (oEvent) {
                var that = this;
                var file = oEvent.getParameter("files") ? oEvent.getParameter("files")[0] : "";
                var excelData;
                var oBusyDialog = new sap.m.BusyDialog({
                    text: "Please sit back while fetching the excel sheet data..."
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
                        if(oLocalModel.getProperty("/chooseFromOption") === 1){
                            if(excelData && excelData.length > 0 && excelData[0].Tcode){
                                excelData = excelData.map(function(el){
                                    if(el.Tcode){
                                        return el.Tcode;
                                    }
                                });
                            } else {
                                excelData = [];
                            }
                        }else if(oLocalModel.getProperty("/chooseFromOption") === 2){
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
                var oDataModel = this.getView().getModel();
                var sVersion = oLocalModel.getProperty("/chooseVersion");
                var aFilter=[], aFuncAreas;
                if(sVersion){
                    aFilter.push(new Filter("otherReleases", FilterOperator.Contains, '"fallBackReleaseId\":\"'+sVersion +'\"'));
                }
                return new Promise(function(resolve) {
                    oDataModel.read(url, {
                        filters: aFilter,
                        urlParameters: {
                            "$select": "appId,RoleName,HighlightedAppsCombined,FormFactors,ApplicationType,UITechnologyCombined,GTMLoBName,AppName,releaseId,BSPApplicationURL,BSPName,ODataServicesCombined,BusinessRoleNameCombined,BusinessCatalog,TechnicalCatalog,IntentsCombined,BusinessGroupNameCombined"
                        },
                        success: function(oData) {
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
                                oData.results[i]["TargetMapping"] = oController.Remove_SpecialChar(oData.results[i].IntentsCombined);
                                oData.results[i]["BusinessGroup"] = oController.Remove_SpecialChar(oData.results[i].BusinessGroupNameCombined);
                                
                                oData.results[i]["BusinessRole"] = oController.Remove_SpecialChar(oData.results[i].BusinessRoleNameCombined);
                                oData.results[i]["oDataSrv"] = oController.Remove_SpecialChar(oData.results[i].ODataServicesCombined);
                                oData.results[i]["AppLink"] = "https://fioriappslibrary.hana.ondemand.com/sap/fix/externalViewer/#/detail/Apps('"+oData.results[i].appId+"')/"+oData.results[i].releaseId;
                                oData.results[i]["UITechnology"] = oData.results[i].UITechnologyCombined.substring(1, oData.results[i].UITechnologyCombined.length-1);
                                oData.results[i]["Lighthouse"] = oData.results[i].HighlightedAppsCombined === '$LH$' ? true : false;
                                oData.results[i]["TCode"] = tCode.toUpperCase();
                            }
                            resolve(oData);
                        },
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
                })
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
                    oLocalModel.setProperty("/"+aFunArea[i].replace(/[\/\\#,+()$~%.'":*?<>{}]/g, ' ').replace("&", "and")+"_Results",$.extend(true, [], aTempReuslts));
                    aChartDataSet.push(sObj);
	            }
                oLocalModel.setProperty("/aChartDataByFunArea",aChartDataSet);
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
                var aAppsFromNone = aFinal.filter(function(el){
                    return el.GTMLoBName === "";
                });
                
                oLocalModel.setProperty("/NONE", aAppsFromNone);
            },
            onChartOpenFullScreen:function(){
                if (!oController.oDefaultDialog) {
                    this.oDefaultDialog = new sap.m.Dialog({
                        title: "Chart",
                        contentHeight:"100%",
                        contentWidth:"100%",
                        content: new sap.m.HBox({
                             alignItems:"Center",
                             items:  sap.ui.xmlfragment("com.mindset.accelerator.appfinder.fragment.Chart")
                            }),
                        endButton: new sap.m.Button({
                            text: "Close",
                            press: function () {
                                this.oDefaultDialog.close();
                            }.bind(this)
                        })
                    });
    
                    // to get access to the controller's model
                    this.getView().addDependent(this.oDefaultDialog);
                }
    
                this.oDefaultDialog.open();
                   
            }
        });
    });
