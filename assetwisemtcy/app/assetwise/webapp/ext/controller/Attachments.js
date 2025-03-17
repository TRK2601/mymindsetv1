sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, MessageToast) {
		"use strict";
		var controller, mainModel, uploadSet, localModel, deepAssetId, assetId, fileAllowed;
		return {
			onInit: function (oLocalModel, oMainModel, sPath, oBindingObj) {
				controller = this;
				mainModel = oMainModel;
				localModel = oLocalModel;
				var newID = sPath.substring(sPath.indexOf('ID') + 3, sPath.indexOf('ID') + 39);
				assetId = sPath;
				deepAssetId = newID;
			},
			bindData: async function () {
				if (!assetId) return;
				var index = assetId.indexOf('IsActiveEntity') + 'IsActiveEntity'.length;
				var IsActiveEntity = assetId.substring(index + 1, index + 5);
				localModel.setProperty('/uploadButtonVisible', IsActiveEntity === "true" ? false : true);
				await $.ajax({
					url: mainModel.getServiceUrl() + assetId + "?$expand=attachments",
					method: "GET",
					contentType: "application/json",
					success: function (data) {
						console.log(data);
						localModel.setProperty('/items', data.attachments);
						console.log("Model updated");
					}.bind(this), // Ensure correct 'this' context
					error: function (err) {
						console.log(err);
					}
				});
			},

			formatThumbnailUrl: function (mediaType) {
				var iconUrl;
				switch (mediaType) {
					case "image/png":
						iconUrl = "sap-icon://card";
						break;
					case "text/plain":
						iconUrl = "sap-icon://document-text";
						break;
					case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
						iconUrl = "sap-icon://excel-attachment";
						break;
					case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
						iconUrl = "sap-icon://doc-attachment";
						break;
					case "application/pdf":
						iconUrl = "sap-icon://pdf-attachment";
						break;
					default:
						iconUrl = "sap-icon://attachment";
				}
				return iconUrl;
			},

			handleTypeMissmatch: function (oEvent) {
				fileAllowed = "The media type is not allowed. Try uploading txt, jpg, jpeg, or png."
				return;
			},
			handleFileEmpty: function (oEvent) {
				MessageToast.show("Uploaded file was empty.");
				return;
			},
			handleFileSizeExceed: function (oEvent) {
				MessageToast.show("The file is too large.");
				return;
			},

			onDownloadSelected: function (oEvent) {
				var items = this.byId('myList').getSelectedItems();
				items.forEach(function (oItem) {
					var path = oItem.getBindingContext('localModel').getPath();
					oItem = localModel.getProperty(path);
					var oUrl = mainModel.getServiceUrl() + `Attachments/${oItem.ID}/content`;
					var oFileName = oItem.fileName;
					controller._download(oUrl)
						.then((blob) => {

							//open in the browser
							// var url = window.URL.createObjectURL(blob);
							// window.open(url);

							//create a ObjectURL in order to download the created file
							let url = window.URL.createObjectURL(blob);
							//create a hidden link and set the href and click it
							var a = document.createElement("a");
							a.style = "display: none";
							a.href = url;
							a.download = oFileName;
							a.click();
							window.URL.revokeObjectURL(url);
						})
						.catch((err) => {
							console.log(err);
						});
				});
			},

			handleValueChange: function (oEvent) {
				uploadSet = this;
				var items = localModel.getProperty('/items');
				var item = oEvent.getParameter('files')[0];
				var obj = {
					fileName: item.name,
					mediaType: item.type,
					size: item.size,
					url: null,
					state: "Warning",
					text: "Ready for Upload",
					value: item
				};
				items = [...items, obj];
				localModel.setProperty('/items', items);
				this.byId('fileUploader').clear();
			},

			onSelectionChanged: function (oEvent) {
				// var path = oEvent.getParameter('listItem').getBindingContext('localModel').getPath();
				// localModel.setProperty(path + '/selected', !localModel.getProperty(path + '/selected'));
				var oDownloadBtn = this.byId('idDownloadBtn');
				var aSelectedItems = this.byId('myList').getSelectedItems();
				if (aSelectedItems.length > 0) {
					oDownloadBtn.setEnabled(true);
				} else {
					oDownloadBtn.setEnabled(false);
				}
			},

			_download: function (url) {
				var settings = {
					url: url, //getUrl()
					method: "GET",
					xhrFields: {
						responseType: "blob"
					}
				}

				return new Promise((resolve, reject) => {
					$.ajax(settings)
						.done((result, textStatus, request) => {
							resolve(result);
						})
						.fail((err) => {
							reject(err);
						})
				});
			},

			process: function () {
				return new Promise(async (resolve, reject) => {
					try {
						var items = localModel.getProperty('/items');

						if (items.length !== 0) {
							await Promise.all(items.map(async (item, index, arr) => {
								if (item.state === 'Warning') {
									try {
										await this._createEntity(item, index).then((res) => {
											localModel.setProperty(`/items/${index}/ID`, res.ID);
											localModel.setProperty(`/items/${index}/text`, null);
											localModel.setProperty(`/items/${index}/state`, null);
										}
										);
										// this._uploadContent(item, index, result);
									} catch (err) {
										console.log(err);
									}
								}
							}));
						}
						resolve(); // Resolve the promise when the function completes successfully
					} catch (error) {
						reject(error); // Reject the promise if there's an error
					}
				});
			},

			discardChanges: function () {
				var items = localModel.getProperty('/items');
				for (let i = 0; i < items.length;) {
					if (items[i].state === 'Warning') {
						items.splice(i, 1);
					} else {
						if (items[i].state === 'Error') {
							items[i].state = null;
							items[i].text = null;
						}
						i++;
					}
				}
				localModel.setProperty('/items', items);
			},

			onBeforeItemRemoved: function (oEvent) {
				if (!oEvent.getParameter('listItem')) return;

				var path = oEvent.getParameter('listItem').getBindingContext('localModel').getPath();
				var object = localModel.getObject(path);
				console.log('ID marked for removal ' + object.ID);
				localModel.setProperty(path + '/text', 'marked for removal');
				localModel.setProperty(path + '/state', 'Error');
			},

			removeMarkedItems: function () {
				return new Promise(async (resolve, reject) => {
					try {
						var items = localModel.getProperty('/items');
						for (let i = 0; i < items.length;) {
							if (items[i].state === 'Error') {
								if (items[i].ID) await this._deleteEntity(items[i], items[i].ID);
								items.splice(i, 1);
							} else {
								i++;
							}
						}
						localModel.setProperty('/items', items);
						resolve(); // Resolve the promise when the function completes successfully
					} catch (error) {
						reject(error); // Reject the promise if there's an error
					}
				});
			},

			_deleteEntity: function (oPayload, oId) {
				var url = mainModel.getServiceUrl() + `Attachments/${oId}`;
				var settings = {
					url: url,
					method: "DELETE",
					headers: {
						"Content-type": "application/json"
					},
					data: JSON.stringify(oPayload)
				}

				return new Promise((resolve, reject) => {
					$.ajax(settings)
						.done((results, textStatus, request) => {
							resolve(results);
						})
						.fail((err) => {
							reject(err);
						})
				})
			},

			_createEntity: function (item, index) {
				return new Promise((resolve, reject) => {
					var oFile = item.value;
					var oReader = new FileReader();

					oReader.onload = async (event) => {
						try {
							var oDataBinaryString = btoa(event.target.result);
							var data = {
								asset_ID: deepAssetId,
								mediaType: item.mediaType,
								fileName: item.fileName,
								content: oDataBinaryString
							};

							var settings = {
								url: mainModel.getServiceUrl() + "Attachments",
								method: "POST",
								headers: {
									"Content-type": "application/json"
								},
								data: JSON.stringify(data)
							};

							const result = await $.ajax(settings);
							resolve(result);
						} catch (error) {
							reject(error);
						}
					};

					oReader.onerror = (error) => {
						reject(error);
					};

					oReader.readAsBinaryString(oFile);
				});
			}
		}
	});