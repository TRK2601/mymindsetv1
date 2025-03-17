sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/viz/ui5/format/ChartFormatter',
    "sap/ui/model/Filter",
    "sap/viz/ui5/controls/VizTooltip",
    "sap/ui/core/UIComponent"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, ChartFormatter, Filter, VizTooltip, UIComponent) {
        "use strict";
        var oLocalModel, oController;
        return Controller.extend("com.mindset.ui.assetwise.dashboard.controller.AssetOverview", {
            onInit: function () {
                oController = this;
                oLocalModel = this.getOwnerComponent().getModel("LocalModel");
                var router = UIComponent.getRouterFor(this); 
                router.attachRouteMatched(this.handleRouteMatch, this);
            },  
            handleRouteMatch:function(){
                $.ajax({
                    url: "/odata/v4/assetwise/AssetMaster",
                    method: "GET",
                    contentType: "application/json",
                    success: function (data) {
                        if(data && data.value && data.value.length > 0){
                            oLocalModel.setProperty("/AssetDataSet",data.value);
                        }
                        oController.dataModification();
                    },
                    error: function(error){
                        oController.dataModification();
                    }
                });
                                
            },
            dataModification:function(){
                oLocalModel.setProperty("/procFromDate",null);
                oLocalModel.setProperty("/procToDate",null);
                oController.getUniqueFucLocation(oLocalModel.getProperty("/AssetDataSet"));
                oController.getUniqueAssetGroup(oLocalModel.getProperty("/AssetDataSet"));
                oController.getUniqueBaseLocation(oLocalModel.getProperty("/AssetDataSet"));
                oLocalModel.setProperty("/sSelectedBaseLocation", oLocalModel.getProperty("/AssetDataSet")[0].baseLocation);
                oLocalModel.setProperty("/sSelectedAssetGrp", oLocalModel.getProperty("/AssetDataSet")[0].group);
                oController.addingDatetoData(oLocalModel.getProperty("/AssetDataSet"));                
                oController.onSelectBaseLocationChange();                
                oController.preparingArrayForScrapped(oLocalModel.getProperty("/AssetDataSet"));
                oController.onAssetGroupChange();
                oController.getCountofAssets();
            },
            getCountofAssets:function(){
                var aAssetData = oLocalModel.getProperty("/AssetDataSet");
                aAssetData.forEach(element =>{
                        element["locationStr"] = element.baseLocation + "-" + element.funcLocation + "-" + element.group + "-" + element.subGroup;
                });
                var aStrLoc = [], aUniquelocStrData =[];
                aAssetData.forEach(element => {
                    if(element.locationStr){
                        aStrLoc.push(element.locationStr);
                      }
                });
                aUniquelocStrData = [... new Set(aStrLoc)]; 
                var aTempReuslts = [];
                for(var i=0; i < aAssetData.length; i++){
                    aTempReuslts = aAssetData.filter(function(el){
                        return el.locationStr && el.locationStr.indexOf(aAssetData[i].locationStr) !== -1 ;
                    });
                    aAssetData[i].noofAssetcount = aTempReuslts.length;
                 }
                 oLocalModel.setProperty("/AssetDataSet", aAssetData);
            },
            onAfterRendering:function(){
                var oDonutVizFrame = oController.getView().byId("idBreakDownDonutChart");
                var oBaseLocation =  oController.getView().byId("BaseLocationIdVizFrame");
                var oAssetGroupChart = oController.getView().byId("idVizFrameAssetGroupChart"); 
                var oProcVizChart = oController.getView().byId("idVizFrameProcurement"); 
                var oScrappedVizChart = oController.getView().byId("idVizdFramesScrappedChart"); 
                var oTooltip = new VizTooltip({});
                //oTooltip.connect(oDonutVizFrame.getVizUid());
                oTooltip.connect(oBaseLocation.getVizUid());
                oTooltip.connect(oAssetGroupChart.getVizUid());
                oTooltip.connect(oProcVizChart.getVizUid());
                oTooltip.connect(oScrappedVizChart.getVizUid());
                var oBreakDownPopover = oController.getView().byId("breakDownPopoverId");
                oBreakDownPopover.connect(oDonutVizFrame.getVizUid());
            },
             preparingArrayForScrapped:function(aArray){
                var toDay = new Date(), endDate, diff, diffDays;
                
                aArray.forEach(element =>{
                    if(element && element.assetScrappedDate){
                        endDate  = new Date(element.assetScrappedDate);
                        diff     = endDate - toDay;
                        diffDays = Math.ceil(diff/(1000*60*60*24));
                        element["scrappedtodays"] = diffDays;
                    }
                });
                oLocalModel.setProperty("/ScrappedDataSet",aArray);
            },
            addingDatetoData:function(aArray){
                aArray.forEach(element =>{
                    if(element && element.procuredDate){
                        element["procDate"] = new Date(element.procuredDate);
                    }
                })
                oLocalModel.setProperty("/procuementDataSet",aArray);
            },
        
            getUniqueFucLocation: function(aItems){
                var aFunLocation = [], aSplitArr =[];
                aItems.forEach(element => {
                    if(element.funcLocation){
                        if(element.funcLocation.indexOf(";") !== -1){
                            aSplitArr = element.funcLocation.split(";");
                        } else {
                            aSplitArr = element.funcLocation.split(",");
                        }
                        for(var sIdx = 0; sIdx < aSplitArr.length; sIdx++){
                            aFunLocation.push(aSplitArr[sIdx].trim());
                        }
                    }
                });
                aFunLocation = [... new Set(aFunLocation)];
                oLocalModel.setProperty("/aFunLocations",aFunLocation);
                oController.make_Separate_Reuslts(aItems, aFunLocation ,"FunLoc");
            },
            
            getUniqueBaseLocation: function(aItems){
                var aBaseLocation = [], aSplitArr =[], aBaseLocDrp = [], oDropdwn={};
                aItems.forEach(element => {
                    if(element.baseLocation){
                        if(element.baseLocation.indexOf(";") !== -1){
                            aSplitArr = element.baseLocation.split(";");
                        } else {
                            aSplitArr = element.baseLocation.split(",");
                        }
                        for(var sIdx = 0; sIdx < aSplitArr.length; sIdx++){
                            aBaseLocation.push(aSplitArr[sIdx].trim());
                        }
                    }
                });
                aBaseLocation = [... new Set(aBaseLocation)];
                if(aBaseLocation && aBaseLocation.length > 0){
                    for(var idx = 0; idx < aBaseLocation.length; idx++){
                        oDropdwn = {
                            "key":aBaseLocation[idx],
                            "text":aBaseLocation[idx]
                        }
                        aBaseLocDrp.push(oDropdwn);
                        oDropdwn = {};
                    }
                    oLocalModel.setProperty("/aBaseLocDropdown",aBaseLocDrp);
                }
                oLocalModel.setProperty("/aBaseLocations",aBaseLocation);
           },
            onSelectBaseLocationChange:function(){
                var sSelectedBaseLoc = oLocalModel.getProperty("/sSelectedBaseLocation");
                var aAssetData = oLocalModel.getProperty("/AssetDataSet");
                if(!sSelectedBaseLoc || sSelectedBaseLoc === null || sSelectedBaseLoc === ""){
                    sSelectedBaseLoc = aAssetData[0].baseLocation;
                }
                var aFilteredBaseLocData = [];
                aFilteredBaseLocData = aAssetData.filter(function(el){
                    return el.baseLocation && el.baseLocation.indexOf(sSelectedBaseLoc) !== -1;
                });
                var aTempReuslts = [];
                for(var i=0; i < aFilteredBaseLocData.length; i++){
                    aTempReuslts = aFilteredBaseLocData.filter(function(el){
                        return el.baseLocation && el.baseLocation.indexOf(sSelectedBaseLoc) !== -1;
                    });
                    aFilteredBaseLocData[i].noOfAssets = aTempReuslts.length;
                   
                }
                oLocalModel.setProperty("/aBaseLocChartData",aFilteredBaseLocData);
            },
         
            make_Separate_Reuslts:function(aFinal, aFunArea, cFilter){
                aFinal = $.extend(true, [], aFinal);
                var aTempReuslts = [], aChartDataSet=[], sObj={};
                for(var i=0; i < aFunArea.length; i++){
                        aTempReuslts = aFinal.filter(function(el){
                            return el.funcLocation && el.funcLocation.indexOf(aFunArea[i]) !== -1;
                        });
                        sObj = {
                            "Functional Location":aFunArea[i],
                            "Asset Count":aTempReuslts.length
                        };
                        oLocalModel.setProperty("/"+aFunArea[i].replace(/[\/\\#,+()$~%.'":*?<>{}]/g, ' ').replace("&", " and ")+"_Results",$.extend(true, [], aTempReuslts));
                        aChartDataSet.push(sObj);
                    }
                    oLocalModel.setProperty("/aChartDataByFunLocation",aChartDataSet);            
            },
            getUniqueAssetGroup:function(aItems){
                var aUniqueAssetGroups = [], aSplitArr =[], aAssetGroupDrp = [], oDropdwn={};
                aItems.forEach(element => {
                    if(element.group){
                        if(element.group.indexOf(";") !== -1){
                            aSplitArr = element.group.split(";");
                        } else {
                            aSplitArr = element.group.split(",");
                        }
                        for(var sIdx = 0; sIdx < aSplitArr.length; sIdx++){
                            aUniqueAssetGroups.push(aSplitArr[sIdx].trim());
                        }
                    }
                });
                aUniqueAssetGroups = [... new Set(aUniqueAssetGroups)];
                if(aUniqueAssetGroups && aUniqueAssetGroups.length > 0){
                    for(var idx = 0; idx < aUniqueAssetGroups.length; idx++){
                        oDropdwn = {
                            "key":aUniqueAssetGroups[idx],
                            "text":aUniqueAssetGroups[idx]
                        }
                        aAssetGroupDrp.push(oDropdwn);
                        oDropdwn = {};
                    }
                    oLocalModel.setProperty("/aAssetGroupDropdown",aAssetGroupDrp);
                }
                
            },
            onAssetGroupChange:function(){
                var sSelectedKey = oLocalModel.getProperty("/sSelectedAssetGrp");
                var aAssetData = oLocalModel.getProperty("/AssetDataSet");
                if(!sSelectedKey || sSelectedKey === null || sSelectedKey === ""){
                    sSelectedKey = aAssetData[0].group;
                }
                var aFilteredBaseLocData = [];
                aFilteredBaseLocData = aAssetData.filter(function(el){
                    return el.group && el.group.indexOf(sSelectedKey) !== -1;
                });
                var aTempReuslts = [];
                for(var i=0; i < aFilteredBaseLocData.length; i++){
                    aTempReuslts = aFilteredBaseLocData.filter(function(el){
                        return el.group && el.group.indexOf(sSelectedKey) !== -1;
                    });
                    aFilteredBaseLocData[i].noOfAssets = aTempReuslts.length;
                   
                }
                oLocalModel.setProperty("/aAssetGroupChartData",aFilteredBaseLocData);
            },
            onProcurementDatePress:function(){
                var oFromDate = oLocalModel.getProperty("/procFromDate");
                var oToDate = oLocalModel.getProperty("/procToDate");
                var oProcureChart = oController.getView().byId("idVizFrameProcurement");
                var oChartModel = oProcureChart.getModel("LocalModel");
                if (oFromDate != null && oToDate != null) {
                    var filterData = oChartModel.getProperty("/AssetDataSet").filter(function(item ){
                            var date = new Date(item.procDate);
                            return date >= oFromDate && date <= oToDate;
                    });
                    oChartModel.setProperty("/procuementDataSet", filterData);
                                      
                }
            }
        });
    });
