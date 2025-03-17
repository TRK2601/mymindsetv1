sap.ui.define(["sap/ui/core/mvc/Controller", 
    "sap/m/MessageBox", 
    "sap/ui/model/json/JSONModel", 
    "sap/fe/core/PageController", 
    "sap/ui/core/routing/History", 
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet',
    'sap/m/MessageToast', 
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
  ], 
    function (Controller, MessageBox, JSONModel, PageController, History, exportLibrary, 
        Spreadsheet, MessageToast, Filter, FilterOperator) {
    "use strict";

    var EdmType = exportLibrary.EdmType;
    var jsonData;
    var controller, oMainModelUrls;

    return PageController.extend("com.mindset.ui.assetwisepg.ext.view.MassUpload", {
      onInit: function () {
        controller = this;
        var rModel = new JSONModel({
          "ErrorResponses": []
        });
        this.getView().setModel(rModel, "newModel");
        oMainModelUrls =  `/odata/v4/assetwise_pg/`;

        const script = document.createElement("script");
        script.src = "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js";
        script.onload = () => {
            console.log("SheetJS library loaded.");
        };
        document.head.appendChild(script);
        
      },
      onExit: function () {

      },
      onAfterBinding: function () {

      },
      _handleRouteMatched: function () {
        var oLocalModel = controller.getView().getModel("newModel");
      },
      onSearch: function (oEvent) {
        var oTableSearchState = [],
          sQuery = oEvent.getParameter("query") || oEvent.getSource().getValue();

        if (sQuery && sQuery.length > 0) {
          oTableSearchState.push(new Filter("Position", FilterOperator.Contains, sQuery));
          oTableSearchState.push(new Filter("Description", FilterOperator.Contains, sQuery));
          oTableSearchState = [new Filter({
            filters: oTableSearchState,
            and: false
          })];
        }
        this.getView().byId("errorLogTable").getBinding("items").filter(oTableSearchState, "Application");
      },
      navToListReport: function (oEvent) {
        MessageBox.warning("Unsaved data might be deleted! Are you sure you want to go back?", {
          actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
          emphasizedAction: MessageBox.Action.OK,
          onClose: function (sAction) {
            if (sAction === "OK") {
              controller.byId("fileUploader").setValue("");
              controller.byId("errorLogTable").setVisible(false);
              controller.byId("errorlogform").setVisible(false);
              controller.routing.navigateToRoute("AssetMasterList");
              controller.getView().getModel("newModel").setData(null);
            }
          }
        });
      },
      onFileUploadChange: async function (event) {
        let oMainModelUrl = this.getView().getModel().getServiceUrl() || oMainModelUrls;
        var that = this;
        var file = event.getParameter("files")[0];
        var reader = new FileReader();
        var error_Log = [];
        const curData = [], baseLocData = [], funLocData = [], groupData = [], subGroupData = [];
        const ownerDataUrl = oMainModelUrl + `Employee?$filter=isOwner eq true`;
        const matDataUrl =  oMainModelUrl + `MaterialType`;
        const aStatusUrl = oMainModelUrl + `AssetStatus`;
        var getMatData = await this.getMatandOwnerData(matDataUrl);
        that.getView().getModel("newModel").setProperty('/matData', getMatData);
        var getOwnerData = await this.getMatandOwnerData(ownerDataUrl);
        that.getView().getModel("newModel").setProperty('/ownerData', getOwnerData);
        var getStatusData = await this.getMatandOwnerData(aStatusUrl);
        that.getView().getModel("newModel").setProperty("/aStatusData", getStatusData);
        await this.getDeepValidationData(curData,baseLocData,funLocData,groupData,subGroupData);
        this.getView().getModel("newModel").setProperty("/curData", curData);
        this.getView().getModel("newModel").setProperty("/baseLocData", baseLocData);
        this.getView().getModel("newModel").setProperty("/funLocData", funLocData);
        this.getView().getModel("newModel").setProperty("/groupData", groupData);
        this.getView().getModel("newModel").setProperty("/subGroupData", subGroupData);

        that.getView().getModel("newModel").setProperty('/Errors', error_Log);
        that.getView().getModel("newModel").setProperty('/ErrorResponses', []);
        that.byId("errorLogTable").setVisible(false);
        that.byId("errorlogform").setVisible(false);
        that.byId("excelFileUploadBtn").setEnabled(false);
        reader.onload = function (e) {
          var data = new Uint8Array(e.target.result);
          var workbook = XLSX.read(data, {
            type: "array",
            cellDates: true
          });
          // Extract data from the first sheet
          var worksheet = workbook.Sheets[workbook.SheetNames[0]];
          jsonData = XLSX.utils.sheet_to_json(worksheet);
          if (jsonData && jsonData.length === 0) {
            MessageBox.alert('No data found in the file.');
            return;
          }
          that.getView().getModel("newModel").setProperty('/UploadedExcelData', $.extend(true, [], jsonData));
          that._validateExcel(jsonData, error_Log);
          if (error_Log.length > 0) {
            that.byId("errorLogTable").setVisible(true);
            that.byId("errorlogform").setVisible(true);
          } else {
            that.byId("excelFileUploadBtn").setEnabled(true);
            MessageBox.confirm("Excel has been validated successfully & ready to upload");
          }
          that.getView().getModel("newModel").setProperty('/Errors', error_Log);
        };
        reader.readAsArrayBuffer(file);
      },
      getMatandOwnerData: function (dataUrl) {
        var matOwnerAndStatusData = [];
        return new Promise(function (resolve, reject) {
          $.get({
            url: dataUrl,
            success: function (data) {
              for (let i = 0; i < data.value.length; i++) {
                matOwnerAndStatusData[i] = data.value[i].name;
              }
              resolve(matOwnerAndStatusData);
            },
            error: function (data) {
              reject(data);
            },
          });
        });
      },
      getDeepValidationData: function (curData,baseLocData,funLocData,groupData,subGroupData) { 
        let oMainModelUrl = this.getView().getModel().getServiceUrl() || oMainModelUrls;
        let c = 0, b = 0, g = 0, s = 0, f = 0, a = 0;
        return new Promise(function (resolve, reject) {
          $.get({
            url: oMainModelUrl + `MaterialType?$expand=assignedCurrencies,assignedBaseLocations,assignedFunctionalLocations,assignedGroups,assignedSubGroups`,
            success: function (data) {
              for (let i = 0; i < data.value.length; i++) {
                for (let j = 0; j < data.value[i].assignedCurrencies.length; j++) {
                  curData[c] = data.value[i].assignedCurrencies[j];
                  c++;
                }
                for (let j = 0; j < data.value[i].assignedBaseLocations.length; j++) {
                  baseLocData[b] = data.value[i].assignedBaseLocations[j];
                  b++;
                }
                for (let j = 0; j < data.value[i].assignedFunctionalLocations.length; j++) {
                  funLocData[f] = data.value[i].assignedFunctionalLocations[j];
                  f++;
                }
                for (let j = 0; j < data.value[i].assignedGroups.length; j++) {
                  groupData[g] = data.value[i].assignedGroups[j];
                  g++;
                }
                for (let j = 0; j < data.value[i].assignedSubGroups.length; j++) {
                  subGroupData[s] = data.value[i].assignedSubGroups[j];
                  s++;
                }
              }
              resolve();
            },
            error: function (data) {
              reject(data);
            },
          });
        });
      
      },
      deepValidation: function (aExcelData, flag) { 
        const curData = this.getView().getModel("newModel").getProperty("/curData");
        const baseLocData = this.getView().getModel("newModel").getProperty("/baseLocData");
        const funLocData = this.getView().getModel("newModel").getProperty("/funLocData");
        const groupData = this.getView().getModel("newModel").getProperty("/groupData");
        const subGroupData = this.getView().getModel("newModel").getProperty("/subGroupData");

        if (flag == 'N') {
          return (
            curData.some(
              (element_2) =>
                aExcelData['Material Type'] === element_2.materialType_name &&
                aExcelData['Net Value Currency'] === element_2.currency_code
            )
          );
        }
        else if (flag == 'P') {
          return (
            curData.some(
              (element_2) =>
                aExcelData['Material Type'] === element_2.materialType_name &&
                aExcelData['Procurement Cost Currency'] === element_2.currency_code
            )
          );
        }
        else if (flag == 'C') {
          return (
            curData.some(
              (element_2) =>
                aExcelData['Material Type'] === element_2.materialType_name &&
                aExcelData['Service Cost Currency'] === element_2.currency_code
            )
          );
        }
        else if (flag == 'R') {
          return (
            curData.some(
              (element_2) =>
                aExcelData['Material Type'] === element_2.materialType_name &&
                aExcelData['Scrapping Value Currency'] === element_2.currency_code
            )
          );
        }
        else if (flag == 'B') {
          return (
            baseLocData.some(
              (element_2) =>
                aExcelData['Material Type'] === element_2.materialType_name &&
                aExcelData['Base Location'] === element_2.baseLocation_code
            )
          );
        }
        else if (flag == 'F') {
          return (
            funLocData.some(
              (element_2) =>
                aExcelData['Material Type'] === element_2.materialType_name &&
                aExcelData['Base Location'] === element_2.baseLocation_code &&
                aExcelData['Functional Location'] === element_2.functionalLocation_code
            )
          );
        }
        else if (flag == 'G') {
          return (
            groupData.some(
              (element_2) =>
                aExcelData['Material Type'] === element_2.materialType_name &&
                aExcelData['Group'] === element_2.group_name
            )
          );
        }
        else if (flag == 'S') {
          return (
            subGroupData.some(
              (element_2) =>
                aExcelData['Material Type'] === element_2.materialType_name &&
                aExcelData['Group'] === element_2.group_name &&
                aExcelData['Sub Group'] === element_2.subGroup_name
            )
          );
        }
      },
      _validateExcel: function (aExcelData, error_Log) { 
        const validationMaterialType = this.getView().getModel("newModel").getProperty('/matData');
        const validationOwnerData = this.getView().getModel("newModel").getProperty('/ownerData');
        const validationStatusData = this.getView().getModel("newModel").getProperty('/aStatusData');
        var sRowPos;
        for (var i = 0; i < aExcelData.length; i++) {
          sRowPos = i + 1;
          const validationResultBaseLoc = this.deepValidation(aExcelData[i],'B');
          const validationResultFuncLoc = this.deepValidation(aExcelData[i],'F');
          const validationResultGroup = this.deepValidation(aExcelData[i],'G');
          const validationResultSubGroup = this.deepValidation(aExcelData[i],'S');
          const validationResultNetValueCurr = this.deepValidation(aExcelData[i],'N');
          const validationResultProcCurr = this.deepValidation(aExcelData[i],'P');
          const validationResultServCostCur  = this.deepValidation(aExcelData[i],'C');
          const validationResultScrapCostCur  = this.deepValidation(aExcelData[i],'R');
      
          if (!aExcelData[i].Name) {
            error_Log.push({
              Position: sRowPos.toString(),
              Description: "Name is missing",
            });
          }
          if ((aExcelData[i]['Base Location']) && (!validationResultBaseLoc)) {
            error_Log.push({
              Position: sRowPos.toString(),
              Description: "Base Location is invalid",
            });
          }
          if ((aExcelData[i]['Base Location']) && (aExcelData['Functional Location']) && (!validationResultFuncLoc)) {
            error_Log.push({
              Position: sRowPos.toString(),
              Description: "Functional Location is invalid",
            });
          }
          if ((aExcelData['Group']) && (!validationResultGroup)) {
            error_Log.push({
              Position: sRowPos.toString(),
              Description: "Group is invalid",
            });
          }
          if ((aExcelData['Group']) && (aExcelData['Sub Group']) && (!validationResultSubGroup)) {
            error_Log.push({
              Position: sRowPos.toString(),
              Description: "Sub Group is invalid",
            });
          }
          if ((aExcelData['Net Value Currency']) && (!validationResultNetValueCurr)) {
            error_Log.push({
              Position: sRowPos.toString(),
              Description: "Net Value Currency is invalid",
            });
          }
          if ((aExcelData['Procurement Cost Currency']) && (!validationResultProcCurr)) {
            error_Log.push({
              Position: sRowPos.toString(),
              Description: "Procurement Cost Currency is invalid",
            });
          }
          if ((aExcelData['Service Cost Currency']) && (!validationResultServCostCur)) {
            error_Log.push({
              Position: sRowPos.toString(),
              Description: "Service Cost Currency is invalid",
            });
          }
          if ((aExcelData['Scrapping Value Currency']) && (!validationResultScrapCostCur)) {
            error_Log.push({
              Position: sRowPos.toString(),
              Description: "Scrapping Value Currency is invalid",
            });
          }
          if((aExcelData[i].Status) && (!validationStatusData.includes(aExcelData[i].Status))){
            error_Log.push({
              Position: sRowPos.toString(),
              Description: "Asset Status is invalid",
            });
          }
          //Code to verify mattype
          if (!aExcelData[i]['Material Type']) {
            error_Log.push({
              Position: sRowPos.toString(),
              Description: "Material type is not found",
            });
          }
          else if (!validationMaterialType.includes(aExcelData[i]['Material Type'].trim())) {
            error_Log.push({
              Position: sRowPos.toString(),
              Description: "Material type is invalid",
            });
          }

          //Owner validation
          if (!aExcelData[i].Owner) {
            error_Log.push({
              Position: sRowPos.toString(),
              Description: "Owner is undefined",
            });
          }
          else if (typeof aExcelData[i].Owner !== 'string' || !validationOwnerData.includes(aExcelData[i].Owner)) {
            error_Log.push({
              Position: sRowPos.toString(),
              Description: "Owner is invalid",
            });
          }
          if (!validationOwnerData.includes(aExcelData[i]['Scrapping Owner'])) {
            error_Log.push({
              Position: sRowPos.toString(),
              Description: "Scrapped Owner is invalid",
            });
          }

          //Boolean Columns validation
          if ((aExcelData[i].Insured == true) || (aExcelData[i].Insured == false)) {
            console.log("Values are valid");
          }
          else {
            error_Log.push({
              Position: sRowPos.toString(),
              Description: "Insured value should be either true or false",
            });
          }

          if ((aExcelData[i].Breakdown == true) || (aExcelData[i].Breakdown == false)) {
            console.log("Values are valid");
          }
          else {
            error_Log.push({
              Position: sRowPos.toString(),
              Description: "Breakdown value should be either true or false",
            });
          }

          if ((aExcelData[i].Lost == true) || (aExcelData[i].Lost == false)) {
            console.log("Values are valid");
          }
          else {
            error_Log.push({
              Position: sRowPos.toString(),
              Description: "Lost value should be either true or false",
            });
          }

          if ((aExcelData[i]['Claims In Current Year'] == true) || (aExcelData[i]['Claims In Current Year'] == false)) {
            console.log("Values are valid");
          }
          else {
            error_Log.push({
              Position: sRowPos.toString(),
              Description: "Claims In Current Year value should be either true or false",
            });
          }

          //Net Value & Procured Cost Validation
          if ((aExcelData[i]['Net Value'] && aExcelData[i]['Procurement Cost']) && (aExcelData[i]['Net Value'] > aExcelData[i]['Procurement Cost'])) {
            error_Log.push({
              Position: sRowPos.toString(),
              Description: "Net Value must be less than or equal to Procured Cost",
            });
          }

          //Scrapped Value Validation
          if ((aExcelData[i]['Net Value'] && aExcelData[i]['Scrapping Value']) && (aExcelData[i]['Scrapping Value'] > aExcelData[i]['Net Value'])) {
            error_Log.push({
              Position: sRowPos.toString(),
              Description: "Scrapped Value must be less than or equal to Net Value",
            });
          }
        }
      },
      handleUploadPress: function (oEvent) { 
        var oMessagePopoverBtn = controller.getView().byId('idP2MessagePopoverBtn');
        var oLocalModel = controller.getView().getModel("newModel");
        var aUploadedExcelData = oLocalModel.getProperty('/UploadedExcelData');
        oLocalModel.setProperty('/ErrorResponses', []);
        var sStatus, aTriggerAjaxCall = [];
        var filteredPayload = [];
        for (let i = 0; i < aUploadedExcelData.length; i++) {
          var payload = {
            ID: aUploadedExcelData[i]['ID'],
            matType: aUploadedExcelData[i]['Material Type'] ? aUploadedExcelData[i]['Material Type'] : null,
            name: aUploadedExcelData[i]['Name'] ? String(aUploadedExcelData[i]['Name']) : null,
            desc1: aUploadedExcelData[i]["Description 1"] ? String(aUploadedExcelData[i]["Description 1"]) : null,
            desc2: aUploadedExcelData[i]["Description 2"] ? String(aUploadedExcelData[i]["Description 2"]) : null,
            desc3: aUploadedExcelData[i]["Description 3"] ? String(aUploadedExcelData[i]["Description 3"]) : null,
            group: aUploadedExcelData[i]["Group"] ? String(aUploadedExcelData[i]["Group"]) : null,
            subGroup: aUploadedExcelData[i]["Sub Group"] ? String(aUploadedExcelData[i]["Sub Group"]) : null,
            barcodeNo: aUploadedExcelData[i]["Barcode No"] ? String(aUploadedExcelData[i]["Barcode No"]) : null,
            serialNo: aUploadedExcelData[i]["Serial No"] ? String(aUploadedExcelData[i]["Serial No"]) : null,
            components: aUploadedExcelData[i]["Components"] ? String(aUploadedExcelData[i]["Components"]) : null,
            status: aUploadedExcelData[i]["Status"] ? String(aUploadedExcelData[i]["Status"]) : null,
            serviceIntervals: aUploadedExcelData[i]["Service Intervals"] ? String(aUploadedExcelData[i]["Service Intervals"]) : null,
            serviceIntervalPeriod_code: null,
            termLife: aUploadedExcelData[i]["Term Life"] ? String(aUploadedExcelData[i]["Term Life"]) : null,
            termLifePeriod_code: null,
            poNumber: aUploadedExcelData[i]["PO Number"] ? String(aUploadedExcelData[i]["PO Number"]) : null,
            procuredDate: null,
            procuredCost: aUploadedExcelData[i]["Procurement Cost"] ? aUploadedExcelData[i]["Procurement Cost"] : null,
            procuredCostCur: aUploadedExcelData[i]["Procurement Cost Currency"] ? String(aUploadedExcelData[i]["Procurement Cost Currency"]) : null,
            assetNetValue: aUploadedExcelData[i]["Net Value"] ? aUploadedExcelData[i]["Net Value"] : null,
            assetCurType: aUploadedExcelData[i]["Net Value Currency"] ? String(aUploadedExcelData[i]["Net Value Currency"]) : null,
            assetVendor: aUploadedExcelData[i]["Vendor"] ? String(aUploadedExcelData[i]["Vendor"]) : null,
            insured: aUploadedExcelData[i]["Insured"] ? Boolean(aUploadedExcelData[i]["Insured"]) : false,
            manufacturedBy: aUploadedExcelData[i]["Manufactured By"] ? String(aUploadedExcelData[i]["Manufactured By"]) : null,
            insurancePartner: aUploadedExcelData[i]["Insurance Partner"] ? String(aUploadedExcelData[i]["Insurance Partner"]) : null,
            insurancePolicyNo: aUploadedExcelData[i]["Insurance Policy No"] ? String(aUploadedExcelData[i]["Insurance Policy No"]) : null,
            previousRenewalDate: null,
            previousRenewalPremium: aUploadedExcelData[i]["Previous Renewal Premium"] ? String(aUploadedExcelData[i]["Previous Renewal Premium"]) : null,
            nextRenewalDate: null,
            claimsInCurrentYear: aUploadedExcelData[i]["Claims In Current Year"] ? Boolean(aUploadedExcelData[i]["Claims In Current Year"]) : false,
            claimDetails: aUploadedExcelData[i]["Claim Details"] ? String(aUploadedExcelData[i]["Claim Details"]) : null,
            ownedTeam: aUploadedExcelData[i]["Owned Team"] ? String(aUploadedExcelData[i]["Owned Team"]) : null,
            Owner: aUploadedExcelData[i]["Owner"] ? String(aUploadedExcelData[i]["Owner"]) : null,
            userTeam: aUploadedExcelData[i]["User Team"] ? String(aUploadedExcelData[i]["User Team"]) : null,
            user: aUploadedExcelData[i]["User"] ? String(aUploadedExcelData[i]["User"]) : null,
            baseLocation: aUploadedExcelData[i]["Base Location"] ? String(aUploadedExcelData[i]["Base Location"]) : null,
            funcLocation: aUploadedExcelData[i]["Functional Location"] ? String(aUploadedExcelData[i]["Functional Location"]) : null,
            handedOverDate: null,
            lost: aUploadedExcelData[i]["Lost"] ? Boolean(aUploadedExcelData[i]["Lost"]) : false,
            breakdown: aUploadedExcelData[i]["Breakdown"] ? Boolean(aUploadedExcelData[i]["Breakdown"]) : false,
            returnDate: null,
            servProvider1: aUploadedExcelData[i]["Service Provider 1"] ? String(aUploadedExcelData[i]["Service Provider 1"]) : null,
            servProvider2: aUploadedExcelData[i]["Service Provider 2"] ? String(aUploadedExcelData[i]["Service Provider 2"]) : null,
            servProvider3: aUploadedExcelData[i]["Service Provider 3"] ? String(aUploadedExcelData[i]["Service Provider 3"]) : null,
            latestServiceDate: null,
            serviceCost: aUploadedExcelData[i]["Service Cost"] ? aUploadedExcelData[i]["Service Cost"] : null,
            serviceCostCur: aUploadedExcelData[i]["Service Cost Currency"] ? aUploadedExcelData[i]["Service Cost Currency"] : null,
            latestServiceVendor: aUploadedExcelData[i]["Latest Service Vendor"] ? aUploadedExcelData[i]["Latest Service Vendor"] : null,
            assetScrappedDate: null,
            assetActScrappedDate: null,
            assetScrappedValue: aUploadedExcelData[i]["Scrapping Value"] ? String(aUploadedExcelData[i]["Scrapping Value"]) : null,
            assetScrappedValueCur: aUploadedExcelData[i]["Scrapping Value Currency"] ? String(aUploadedExcelData[i]["Scrapping Value Currency"]) : null,
            assetScrappedOwner: aUploadedExcelData[i]["Scrapping Owner"] ? String(aUploadedExcelData[i]["Scrapping Owner"]) : null,
            openTextBox1: aUploadedExcelData[i]["Additional Text - Basic"] ? String(aUploadedExcelData[i]["Additional Text - Basic"]) : null,
            openTextBox2: aUploadedExcelData[i]["Additional Text - Procurement"] ? String(aUploadedExcelData[i]["Additional Text - Procurement"]) : null,
            openTextBox3: aUploadedExcelData[i]["Additional Text - Owners"] ? String(aUploadedExcelData[i]["Additional Text - Owners"]) : null,
            openTextBox4: aUploadedExcelData[i]["Additional Text - Maintenance"] ? String(aUploadedExcelData[i]["Additional Text - Maintenance"]) : null,
            openTextBox5: aUploadedExcelData[i]["Additional Text - Scrapping"] ? String(aUploadedExcelData[i]["Additional Text - Scrapping"]) : null,
          }
          if (aUploadedExcelData[i]['ID']) {
            Object.keys(payload).forEach((k) => payload[k] == null && delete payload[k]);
          }
          this._handleDateColsOfExcel(payload, "Procurement Date", "procuredDate", aUploadedExcelData[i]);
          this._handleDateColsOfExcel(payload, "Handed Over Date", "handedOverDate", aUploadedExcelData[i]);
          this._handleDateColsOfExcel(payload, "Return Date", "returnDate", aUploadedExcelData[i]);
          this._handleDateColsOfExcel(payload, "Latest Service Date", "latestServiceDate", aUploadedExcelData[i]);
          this._handleDateColsOfExcel(payload, "Planned Scrapping Date", "assetScrappedDate", aUploadedExcelData[i]);
          this._handleDateColsOfExcel(payload, "Actual Scrapping Date", "assetActScrappedDate", aUploadedExcelData[i]);
          this._handleDateColsOfExcel(payload, "Next Renewal Date", "nextRenewalDate", aUploadedExcelData[i]);
          this._handleDateColsOfExcel(payload, "Previous Renewal Date", "previousRenewalDate", aUploadedExcelData[i]);

          filteredPayload.push(payload);

          // aTriggerAjaxCall.push(this._makeAJAXCall(payload));
        }

        var that = this;
        var oLocalModel = that.getView().getModel("newModel");
        var aErrors;
        let oMainModelUrl = this.getView().getModel().getServiceUrl() || oMainModelUrls;

        $.ajax({
          url: oMainModelUrl + `postMultipleData`,
          method: "POST",
          data: JSON.stringify({ records: filteredPayload }),
          contentType: "application/json",
          success: function () {
            MessageBox.success('Asset(s) have been created successfully', {
              actions: [MessageBox.Action.OK],
              emphasizedAction: MessageBox.Action.OK,
              onClose: function () {
                controller.byId("fileUploader").setValue("");
                controller.routing.navigateToRoute("AssetMasterList");
              }.bind(this)
            });
          },
          error: function (error) {
            aErrors = oLocalModel.getProperty('/ErrorResponses');
            if (error && error.responseJSON && error.responseJSON.error && error.responseJSON.error.message) {
              aErrors.push({
                type: "Error",
                title: "Upload failed",
                description: error.responseJSON.error.message
              });
              oLocalModel.setProperty('/ErrorResponses', $.extend(true, [], aErrors));
              oLocalModel.updateBindings(true);
            } 
          }
        })
        // this.getView().setBusy(true);
        // Promise.all(aTriggerAjaxCall).then(function(values){
        //   controller.getView().setBusy(false);
        //   MessageBox.success('Asset(s) have been created successfully', {
        //     actions: [MessageBox.Action.OK],
        //     emphasizedAction: MessageBox.Action.OK,
        //     onClose: function () {
        //       controller.byId("fileUploader").setValue("");
        //       controller.routing.navigateToRoute("AssetMasterList");
        //     }.bind(this)
        //   });
        // }.bind(this)).catch(function (error) {
        //   controller.getView().setBusy(false);
        //   if (oLocalModel.getProperty('/ErrorResponses').length > 0) {
        //     oMessagePopoverBtn.firePress();
        //   }
        // }.bind(this));
      },
      _handleDateColsOfExcel: function (payload, sCol, sProp, oObj) {
        if (oObj[sCol]) {
          if (typeof oObj[sCol] === 'number') {
            payload[sProp] = oObj[sCol].toString();
          } else if (typeof oObj[sCol] === 'object') {
            payload[sProp] = oObj[sCol].toISOString().slice(0, 10);
          } else {
            payload[sProp] = oObj[sCol];
          }
        }
      },
      _makeAJAXCall: function (payload) { 
        var that = this;
        var oLocalModel = that.getView().getModel("newModel");
        var aErrors;
        let oMainModelUrl = this.getView().getModel().getServiceUrl() || oMainModelUrls;
        return new Promise(function (resolve, reject) {
          $.ajax({
            url: oMainModelUrl + `AssetMaster(ID=${payload.ID},IsActiveEntity=true)`,
            method: "PATCH",
            data: JSON.stringify(payload),
            contentType: "application/json",
            success: function () {
              resolve();
            },
            error: function (error) {
              aErrors = oLocalModel.getProperty('/ErrorResponses');
              if (error && error.responseJSON && error.responseJSON.error && error.responseJSON.error.message) {
                aErrors.push({
                  type: "Error",
                  title: "Upload failed",
                  description: error.responseJSON.error.message
                });
                oLocalModel.setProperty('/ErrorResponses', $.extend(true, [], aErrors));
              }
              reject();
            }
          });
        });
      },
      handleUploadCancelPress: function (oEvent) {
        MessageBox.warning("Unsaved data might be deleted! Are you sure you want to go back?", {
          actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
          emphasizedAction: MessageBox.Action.OK,
          onClose: function (sAction) {
            if (sAction === "OK") {
              controller.byId("fileUploader").setValue("");
              controller.routing.navigateToRoute("AssetMasterList");
              controller.getView().getModel("newModel").setProperty("/ErrorResponses", []);
              controller.byId("errorLogTable").setVisible(false);
              controller.byId("errorlogform").setVisible(false);
            }
          }
        });
      },
      handleLinkPress: function () { 
        var oSettings, oSheet;
        var aCols = [];
        aCols.push({
          label: 'ID',
          type: EdmType.Number,
          property: 'ID',
          scale: 0
        });

        aCols.push({
          label: 'Material Type',
          type: EdmType.String,
          property: 'matType'
        });

        aCols.push({
          label: 'Name',
          property: 'name',
          type: EdmType.String
        });

        aCols.push({
          label: 'Group',
          property: 'group',
          type: EdmType.String
        });

        aCols.push({
          label: 'Sub Group',
          property: 'subGroup',
          type: EdmType.String
        });

        aCols.push({
          label: 'Components',
          property: 'components',
          type: EdmType.String
        });

        aCols.push({
          label: 'Description 1',
          property: 'desc1',
          type: EdmType.String
        });

        aCols.push({
          label: 'Description 2',
          property: 'desc2',
          type: EdmType.String
        });

        aCols.push({
          label: 'Description 3',
          property: 'desc3',
          type: EdmType.String
        });

        aCols.push({
          label: 'Barcode No',
          property: 'barcodeNo',
          type: EdmType.String
        });

        aCols.push({
          label: 'Serial No',
          property: 'serialNo',
          type: EdmType.String
        });

        aCols.push({
          label: 'Status',
          property: 'status',
          type: EdmType.String
        });

        aCols.push({
          label: 'Additional Text - Basic',
          property: 'openTextBox1',
          type: EdmType.String
        });

        aCols.push({
          label: 'PO Number',
          property: 'poNumber',
          type: EdmType.String
        });

        aCols.push({
          label: 'Procurement Date',
          property: 'procuredDate',
          type: EdmType.Date
        });

        aCols.push({
          label: 'Procurement Cost',
          property: 'procuredCost',
          type: EdmType.Double
        });

        aCols.push({
          label: 'Procurement Cost Currency',
          property: 'procuredCostCur',
          type: EdmType.Double
        });

        aCols.push({
          label: 'Net Value',
          property: 'assetNetValue',
          type: EdmType.Double
        });

        aCols.push({
          label: 'Net Value Currency',
          property: 'assetNetValueCur',
          type: EdmType.Double
        });

        aCols.push({
          label: 'Vendor',
          property: 'assetVendor',
          type: EdmType.String
        });

        aCols.push({
          label: 'Manufactured By',
          property: 'manufacturedBy',
          type: EdmType.String
        });

        aCols.push({
          label: 'Insured',
          property: 'insured',
          type: EdmType.Boolean
        });

        aCols.push({
          label: 'Additional Text - Procurement',
          property: 'openTextBox2',
          type: EdmType.String
        });

        aCols.push({
          label: 'Insurance Partner',
          property: 'insurancePartner',
          type: EdmType.String
        });

        aCols.push({
          label: 'Insurance Policy No',
          property: 'insurancePolicyNo',
          type: EdmType.Double
        });

        aCols.push({
          label: 'Previous Renewal Date',
          property: 'previousRenewalDate',
          type: EdmType.Date
        });

        aCols.push({
          label: 'Previous Renewal Premium',
          property: 'previousRenewalPremium',
          type: EdmType.String
        });

        aCols.push({
          label: 'Next Renewal Date',
          property: 'nextRenewalDate',
          type: EdmType.Date
        });

        aCols.push({
          label: 'Claims In Current Year',
          property: 'claimsInCurrentYear',
          type: EdmType.String
        });

        aCols.push({
          label: 'Claim Details',
          property: 'claimDetails',
          type: EdmType.String
        });

        aCols.push({
          label: 'Owned Team',
          property: 'ownedTeam',
          type: EdmType.String
        });

        aCols.push({
          label: 'Owner',
          property: 'Owner',
          type: EdmType.String
        });

        aCols.push({
          label: 'User Team',
          property: 'userTeam',
          type: EdmType.String
        });

        aCols.push({
          label: 'User',
          property: 'user',
          type: EdmType.String
        });

        aCols.push({
          label: 'Base Location',
          property: 'baseLocation',
          type: EdmType.String
        });

        aCols.push({
          label: 'Functional Location',
          property: 'funcLocation',
          type: EdmType.String
        });

        aCols.push({
          label: 'Handed Over Date',
          property: 'handedOverDate',
          type: EdmType.Date
        });

        aCols.push({
          label: 'Return Date',
          property: 'returnDate',
          type: EdmType.Date
        });

        aCols.push({
          label: 'Lost',
          property: 'lost',
          type: EdmType.String
        });

        aCols.push({
          label: 'Additional Text - Owners',
          property: 'openTextBox3',
          type: EdmType.String
        });

        aCols.push({
          label: 'Service Provider 1',
          property: 'servProvider1',
          type: EdmType.String
        });

        aCols.push({
          label: 'Service Provider 2',
          property: 'servProvider2',
          type: EdmType.String
        });

        aCols.push({
          label: 'Service Provider 3',
          property: 'servProvider3',
          type: EdmType.String
        });

        aCols.push({
          label: 'Latest Service Date',
          property: 'latestServiceDate',
          type: EdmType.Date
        });

        aCols.push({
          label: 'Service Cost',
          property: 'serviceCost',
          type: EdmType.Double
        });

        aCols.push({
          label: 'Service Cost Currency',
          property: 'serviceCostCur',
          type: EdmType.Double
        });

        aCols.push({
          label: 'Latest Service Vendor',
          property: 'latestServiceVendor',
          type: EdmType.String
        });

        aCols.push({
          label: 'Service Intervals',
          property: 'serviceIntervals',
          type: EdmType.String
        });

        aCols.push({
          label: 'Term Life',
          property: 'termLife',
          type: EdmType.String
        });

        aCols.push({
          label: 'Breakdown',
          property: 'breakdown',
          type: EdmType.String
        });

        aCols.push({
          label: 'Additional Text - Maintenance',
          property: 'openTextBox4',
          type: EdmType.String
        });

        aCols.push({
          label: 'Planned Scrapping Date',
          property: 'assetScrappedDate',
          type: EdmType.Date
        });

        aCols.push({
          label: 'Actual Scrapping Date',
          property: 'assetActScrappedDate',
          type: EdmType.Date
        });

        aCols.push({
          label: 'Scrapping Value',
          property: 'assetScrappedValue',
          type: EdmType.String
        });

        aCols.push({
          label: 'Scrapping Value Currency',
          property: 'assetScrappedValueCur',
          type: EdmType.String
        });

        aCols.push({
          label: 'Scrapping Owner',
          property: 'assetScrappedOwner',
          type: EdmType.String
        });

        aCols.push({
          label: 'Additional Text - Scrapping',
          property: 'openTextBox5',
          type: EdmType.String
        });

        var aExcelData = [];
        var iRowCount = 1;

        for (var i = 0; i < iRowCount; i++) {
          var oRow = {};
          aCols.forEach(function (oColumn) {
            oRow[oColumn.property] = ""; // Empty value for each column
          });
          aExcelData.push(oRow);
        }

        oSettings = {
          workbook: {
            columns: aCols,
            context: {
              sheetName: "Asset Wise"
            }
          },
          dataSource: aExcelData,
          fileName: 'AssetWise_Template.xlsx',
          worker: false // We need to disable worker because we are using a MockServer as OData Service
        };

        oSheet = new Spreadsheet(oSettings);
        oSheet.build().finally(function () {
          oSheet.destroy();
        });
      },
      /**
       * Called when page footer popover button pressed
       * Method to show errors in Message Popover
       * @param {sap.ui.base.Event} oEvent - event from the button
       */
      handleMessagePopoverPress: function (oEvent) {
        if (!this.oMessagePopover) {
          this.oMessagePopover = sap.ui.xmlfragment("com.mindset.ui.assetwisepg.ext.fragment.Errors", this);
          this.getView().addDependent(this.oMessagePopover);
        }
        this.oMessagePopover.toggle(oEvent.getSource());
      },
    });
  });
