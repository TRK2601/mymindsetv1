sap.ui.define(['sap/ui/core/mvc/ControllerExtension',"sap/ui/core/routing/History", "com/mindset/ui/assetwise/ext/controller/Attachments"], function (ControllerExtension,History, Attachments) {
	'use strict';
	var assetId,localModel,controller, mainModel;
	let getAttachmentsState = true;
	return ControllerExtension.extend('com.mindset.ui.assetwise.ext.controller.ObjectPageExt', {
		// this section allows to extend lifecycle hooks or hooks provided by Fiori elements
		override: {
			editFlow: {
				onAfterSave: async function (mParameters) {
					getAttachmentsState = false;
					await Attachments.removeMarkedItems().then( async() => {
						await Attachments.process().then(() => {
						});
					});
					localModel.setProperty('/uploadButtonVisible',false);
				},
				onBeforeCreate: function (mParameters) {
				},
				onBeforeDelete: function (mParameters) {
				},
				
				onAfterEdit: function (mParameters) {
					getAttachmentsState = false;
					localModel.setProperty('/uploadButtonVisible',true);
				},
				onAfterDiscard: function (mParameters) {
					getAttachmentsState = false;
					Attachments.discardChanges();
					localModel.setProperty('/uploadButtonVisible',false);
				},
				onAfterCreate: async function (mParameters) {
					getAttachmentsState = false;
					await Attachments.removeMarkedItems().then( async() => {
						await Attachments.process().then(() => {
						});
					});
					localModel.setProperty('/uploadButtonVisible',false);
				}
			},
			routing: {
				onAfterBinding: function (oBindingContext, mParameters) {
					var sPath=oBindingContext.getPath();
					var oBindingObj = oBindingContext.getObject();
					localModel=this.getInterface().getView().oViewData.appComponent.getModel("localModel");
					mainModel=this.getInterface().getView().oViewData.appComponent.getModel();
					if(sPath) Attachments.onInit(localModel, mainModel, sPath, oBindingObj);
					if(sPath && getAttachmentsState) Attachments.bindData();
					getAttachmentsState = true;
					localModel.setProperty("/isVisible",false);
					this.serviceUrl=this.getView().getModel().sServiceUrl;
					var dataUrl = this.serviceUrl + sPath + "?$expand=versions";

					//Unable or disable asset image upload button based on IsActiveEntity
					var idFacet = this.getView().byId("com.mindset.ui.assetwise::AssetMasterObjectPage--fe::FormContainer::GeneratedFacet1::FormElement::DataField::ID");
					var qrcodeBtn = this.getView().byId("com.mindset.ui.assetwise::AssetMasterObjectPage--fe::CustomAction::QRCodeAction").setIcon('sap-icon://qr-code');
					var uploadAssetImgBtn = this.getView().byId("com.mindset.ui.assetwise::AssetMasterObjectPage--fe::CustomAction::UploadAssetImgID");

					sPath.indexOf("IsActiveEntity=true") !== -1 ? uploadAssetImgBtn.setEnabled(false) : uploadAssetImgBtn.setEnabled(true);
					sPath.indexOf("IsActiveEntity=true") !== -1 ? idFacet.setVisible(true) : idFacet.setVisible(false);
					sPath.indexOf("IsActiveEntity=true") !== -1 ? qrcodeBtn.setVisible(true) : qrcodeBtn.setVisible(false);

					if(oBindingObj && !oBindingObj.IsActiveEntity){
						return;
					}
					$.ajax({
						url: dataUrl,
						method: "GET",
						contentType: "application/json",
						success: function (data) {
							console.log(data);
							for(var i=0;i<data.versions.length;i++){
								data.versions[i].createdAt=new Date(data.versions[i].createdAt);
								data.versions[i].createdBy = data.versions[i].createdBy.split("@")[0];
							}
							localModel.setProperty('/historyItems', data.versions);
							// myJson.bindList("/historyItems", historyData);
							console.log("Local Model updated");
						}.bind(this), // Ensure correct 'this' context
						error: function (err) {
							console.log(err);
						}
					});
				}
			},
			onBeforeNavigation: function (mNavigationParameters) {
				
			},
			/**
             * Called when a controller is instantiated and its View controls (if available) are already created.
             * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
             * @memberOf com.mindset.ui.assetwise.ext.controller.ObjectPage
             */
			onInit: function () {
				// you can access the Fiori elements extensionAPI via this.base.getExtensionAPI
				var oModel = this.base.getExtensionAPI().getModel();
				var aFieldData = {
					Basic: [],
					Procurement: []
				};
			},
			onBeforeRendering: function(){
				this.getView().byId("com.mindset.ui.assetwise::AssetMasterObjectPage--fe::CustomAction::QRCodeAction").setIcon('sap-icon://qr-code')
				this.getView().byId("com.mindset.ui.assetwise::AssetMasterObjectPage--fe::CustomAction::QRCodeAction").setIcon('sap-icon://qr-code').setType('Emphasized');
				this.getView().byId("com.mindset.ui.assetwise::AssetMasterObjectPage--fe::CustomAction::UploadAssetImgID").setIcon('sap-icon://attachment');
			},
		},
		// _clearItemSelection: function(){
		// 	var oLocalModel = this.getView().getModel('localModel');
		// 	var aItems = oLocalModel.getProperty('/historyItems') || [];
		// 	for(var i=0; i<aItems.length; i++){
		// 		oLocalModel.setProperty('/historyItems/'+i+'/IsItemSelected', false);
		// 	}
		// },
		listItemPressed: function(oEvent) {
			var aChangedFields=[];
			var oSrc = oEvent.getSource();
			var oBindingContext = oSrc.getBindingContext("localModel");
			var currObj = oBindingContext.getObject();
			var currVersion = currObj.version;
			var prevObj = oSrc.getModel("localModel").getData().historyItems[currVersion - 1];
			var sSelOp = currVersion == 0 ? 'C' : 'U';
			//this._clearItemSelection();
			localModel.setProperty("/isVisible",true);
			localModel.setProperty("/basicData", []);
			localModel.setProperty("/basicDataCount", 0);
			localModel.setProperty("/procurementData", []);
			localModel.setProperty("/procurementDataCount", 0);
			localModel.setProperty("/ownerData", []);
			localModel.setProperty("/ownerDataCount", 0);
			localModel.setProperty("/maintData", []);
			localModel.setProperty("/maintDataCount", 0);
			localModel.setProperty("/scrapData", []);
			localModel.setProperty("/scrapDataCount", 0);
			//localModel.getData().historyItems[0].IsItemSelected = true;
			for(var currkey in currObj){
				var currField = currObj[currkey];
				if(sSelOp === 'C'){
					this.formatValues(sSelOp,currkey,null,currField);
				} else {
					for(var prevKey in prevObj){
						if(prevKey === currkey && currField != prevObj[prevKey]){
							var prevField = prevObj[prevKey];
							this.formatValues(sSelOp,currkey,prevField, currField);
						}
					}
				}
			}
			localModel.refresh();
		},

		formatValues: function(selOp,currkey,prevField,currField) {	
			var sFieldDesc = this.currkeyFormatter(currkey);
			if(currkey == "matType" || currkey == "name" || currkey == "desc1" || currkey == "desc2" || currkey == "desc3" || currkey == "group" || currkey == "subGroup" || currkey == "barcodeNo" || currkey == "serialNo" || currkey == "components" || currkey == "openTextBox1"){
				if(selOp === 'C' && currField){
					localModel.getData().basicData.push({
						fieldValue: sFieldDesc,
						oldValue: '',
						newValue: currField
					})
				} else if (selOp === 'U') {
					localModel.getData().basicData.push({
						fieldValue: sFieldDesc,
						oldValue: prevField,
						newValue: currField
					})
				}
			} else if(currkey == "poNumber" || currkey == "procuredDate" || currkey == "procuredCost" || currkey == "procuredCostCur_code" || currkey == "assetNetValue"  || currkey == "assetCurType_code" || currkey == "assetVendor" || currkey == "openTextBox2"){
				if(selOp === 'C' && currField){
					localModel.getData().procurementData.push({
						fieldValue: sFieldDesc,
						oldValue: '',
						newValue: currField
					})
				} else if (selOp === 'U') {
					localModel.getData().procurementData.push({
						fieldValue: sFieldDesc,
						oldValue: prevField,
						newValue: currField
					})
				}
			}
			else if(currkey == "ownedTeam" || currkey == "Owner" ||currkey == "userTeam" || currkey == "user" || currkey == "baseLocation" || currkey == "funcLocation" || currkey == "handedOverDate" || currkey == "returnDate" || currkey == "openTextBox3"){
				if(selOp === 'C' && currField){
					localModel.getData().ownerData.push({
						fieldValue: sFieldDesc,
						oldValue: '',
						newValue: currField
					})
				} else if (selOp === 'U') {
					localModel.getData().ownerData.push({
						fieldValue: sFieldDesc,
						oldValue: prevField,
						newValue: currField
					})
				}
			}
			else if(currkey == "servProvider1" || currkey == "servProvider2" || currkey == "servProvider3" || currkey == "latestServiceDate" || currkey == "serviceCost" || currkey == "serviceCostCur_code" || currkey == "latestServiceVendor" || currkey == "serviceIntervals" || currkey == "serviceIntervalPeriod_code" || currkey == "termLife" || currkey == "termLifePeriod_code" || currkey == "breakdown" || currkey == "openTextBox4"){
				if(selOp === 'C' && currField){
					localModel.getData().maintData.push({
						fieldValue: sFieldDesc,
						oldValue: '',
						newValue: currField
					})
				} else if (selOp === 'U') {
					localModel.getData().maintData.push({
						fieldValue: sFieldDesc,
						oldValue: prevField,
						newValue: currField
					})
				}
			}
			else if(currkey == "assetScrappedDate" || currkey == "assetScrappedValue" || currkey == "assetScrappedValueCur_code" || currkey == "assetScrappedOwner" || currkey == "openTextBox5"){
				if(selOp === 'C' && currField){
					localModel.getData().scrapData.push({
						fieldValue: sFieldDesc,
						oldValue: '',
						newValue: currField
					})
				} else if (selOp === 'U') {
					localModel.getData().scrapData.push({
						fieldValue: sFieldDesc,
						oldValue: prevField,
						newValue: currField
					})
				}
			}
			localModel.getData().basicDataCount = localModel.getData().basicData.length || 0;
			localModel.getData().procurementDataCount = localModel.getData().procurementData.length || 0;
			localModel.getData().ownerDataCount = localModel.getData().ownerData.length || 0;
			localModel.getData().maintDataCount = localModel.getData().maintData.length || 0;
			localModel.getData().scrapDataCount = localModel.getData().scrapData.length || 0;
		},
		currkeyFormatter: function (fieldName) {
			switch (fieldName) {
				case "matType":
					return "Material Type";
					break;
				case "name":
					return "Name";
					break;
				case "desc1":
					return "Description 1";
					break;
				case "desc2":
					return "Description 2";
					break;
				case "desc3":
					return "Description 3";
					break;
				case "group":
					return "Group";
					break;
				case "subGroup":
					return "Sub Group";
					break;
				case "barcodeNo":
					return "Barcode No";
					break;
				case "serialNo":
					return "Serial No";
					break;
				case "components":
					return "Components";
					break;
				case "openTextBox1":
					return "Additional Text";
					break;
				case "poNumber":
					return "PO Number";
					break;
				case "procuredDate":
					return "Procurement Date";
					break;
				case "procuredCost":
					return "Procurement Cost";
					break;
				case "procuredCostCur_code":
					return "Procurement Cost Currency";
					break;
				case "assetNetValue":
					return "Net Value";
					break;
				case "assetCurType_code":
					return "Net Value Currency";
					break;
				case "assetVendor":
					return "Vendor";
					break;
				case "openTextBox2":
					return "Additional Text"; 
					break;
				case "ownedTeam":
					return "Owned Team";
					break;
				case "Owner":
					return "Owner";
					break;
				case "userTeam":
					return "User Team";
					break;
				case "user":
					return "User";
					break;
				case "baseLocation":
					return "Base Location";
					break;
				case "funcLocation":
					return "Functional Location";
					break;
				case "handedOverDate":
					return "Handed Over Date";
					break;
				case "returnDate":
					return "Return Date";
					break;
				case "openTextBox3":
					return "Additional Text";
					break;
				case "servProvider1":
					return "Service Provider 1";
					break;
				case "servProvider2":
					return "Service Provider 2";
					break;
				case "servProvider3":
					return "Service Provider 3";
					break;
				case "latestServiceDate":
					return "Latest Service Date";
					break;
				case "serviceCost":
					return "Service Cost";
					break;
				case "serviceCostCur_code":
					return "Service Cost Currency";
					break;
				case "latestServiceVendor":
					return "Latest Service Vendor";
					break;
				case "serviceIntervals":
					return "Service Intervals";
					break;
				case "serviceIntervalPeriod_code":
					return "Service Interval Period";
					break;
				case "termLife":
					return "Term Life";
					break;
				case "termLifePeriod_code":
					return "Term Life Period";
					break;
				case "breakdown":
					return "Breakdown";
					break;
				case "openTextBox4":
					return "Additional Text";
					break;
				case "assetScrappedDate":
					return "Scrapped Date";
					break;
				case "assetScrappedValue":
					return "Scrapped Value";
					break;
				case "assetScrappedValueCur_code":
					return "Scrapped Value Currency";
					break;
				case "assetScrappedOwner":
					return "Scrapped Owner";
					break;
				case "openTextBox5":
					return "Additional Text";
					break;
				default:
					return fieldName;

			}
		}
	});
});
