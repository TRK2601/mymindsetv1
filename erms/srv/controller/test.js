

// // controller.js
// onFileUploadChange: function (oEvent) {
//     var oFileUploader = oEvent.getSource();
//     var aFiles = oEvent.getParameters().files;
//     if (aFiles && aFiles.length > 0) {
//       var oFile = aFiles[0];
//       var oFormData = new FormData();
//       oFormData.append("file", oFile, oFile.name);
//       $.ajax({
//         url: "/uploadHandler",
//         type: "POST",
//         data: oFormData,
//         processData: false,
//         contentType: false,
//         success: function (response) {
//           // Handle success
//         },
//         error: function (error) {
//           // Handle error
//         }
//       });
//     }
//   }


// Example code to send a file upload request to the CAP service

// Assuming 'data' contains the file information (fileName, fileSize, fileType, fileContent)
// const data = {
//     fileName: 'example.txt',
//     fileSize: 1024, // Example file size in bytes
//     fileType: 'text/plain',
//     fileContent: 'SGVsbG8gV29ybGQhCg==', // Base64 encoded file content
//   };
  
//   // Make an HTTP POST request to the CAP service endpoint
//   fetch('/CatalogService/uploadFile', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({ data: data })
//   })
//   .then(response => response.json())
//   .then(result => {
//     console.log('File upload successful:', result);
//   })
//   .catch(error => {
//     console.error('Error uploading file:', error);
//   });
  



// srv.on('POST','Files', async (req) => {
    // const { data } = req.data;
    // const { fileName, fileType, fileSize } = data;
    // const fileContent = await file.toBuffer();
    // await CatalogService.Files.create({
    //   fileName: fileName,
    //   fileSize: fileSize,
    //   fileType: fileType,
    //   fileContent: fileContent
    // });
    // return { success: true };
//   });