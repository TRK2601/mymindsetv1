sap.ui.define([],

    function () {
        return {
            /**
             * Removing special charactores in Tcode Array
             * @param {*} aArray 
             * @returns 
             */
            onTcodeValidation: function (aArray, oLocalModel) {
                // const specialCharsRegex = /[!@#$^&*()<>\?+\.\{\}\[\]=:\/]/;
                // const sanitizedArray = aArray.filter(obj => {
                //     // Test if the 'obj' property contains any of the specified special characters
                //     return !specialCharsRegex.test(obj);
                //   });

                var aTcodesArray = [], aDeletedTcodes = [];

                aArray.forEach(element => {                        
                    if (element && typeof (element) === "string" && !element.includes(":") && !element.includes(":\\") &&
                         !element.includes("<") && !element.includes(">") && !element.includes("?") && 
                         !element.includes("{") && !element.includes("}") && !element.includes("*") && 
                         !element.includes(".") && !element.includes("$") && !element.includes("#") && 
                         !element.includes("@") && !element.includes("!") && !element.includes("[") && 
                         !element.includes("]") && !element.includes("(") && !element.includes(")") && 
                         !element.includes(")") && !element.includes("+") && !element.includes("=") && 
                         !element.includes("()") &&!element.includes("[]") && !element.includes("{}") && !element.includes("^")) {

                        aTcodesArray.push(element);
                    } else {
                        aDeletedTcodes.push(element);
                    }
                });
                oLocalModel.setProperty("/DeletedTcodes", aDeletedTcodes);

                return aTcodesArray;
            }
        }
    }
)