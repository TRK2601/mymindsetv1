using MyService as service from '../../srv/service';
annotate service.AssetMasterInformation with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'serialNumber',
                Value : serialNumber,
            },
            {
                $Type : 'UI.DataField',
                Label : 'assetName',
                Value : assetName,
            },
            {
                $Type : 'UI.DataField',
                Label : 'manufacturer',
                Value : manufacturer,
            },
            {
                $Type : 'UI.DataField',
                Label : 'barcode',
                Value : barcode,
            },
            {
                $Type : 'UI.DataField',
                Label : 'baseLocation',
                Value : baseLocation,
            },
            {
                $Type : 'UI.DataField',
                Label : 'functionalLocation',
                Value : functionalLocation,
            },
            {
                $Type : 'UI.DataField',
                Label : 'owner',
                Value : owner,
            },
            {
                $Type : 'UI.DataField',
                Label : 'user',
                Value : user,
            },
            {
                $Type : 'UI.DataField',
                Label : 'serviceTenure',
                Value : serviceTenure,
            },
            {
                $Type : 'UI.DataField',
                Label : 'calibrationTenure',
                Value : calibrationTenure,
            },
            {
                $Type : 'UI.DataField',
                Label : 'latestCalibrationDate',
                Value : latestCalibrationDate,
            },
            {
                $Type : 'UI.DataField',
                Label : 'latestCalibrationVendor',
                Value : latestCalibrationVendor,
            },
            {
                $Type : 'UI.DataField',
                Label : 'latestCalibrationCertificateNumber',
                Value : latestCalibrationCertificateNumber,
            },
            {
                $Type : 'UI.DataField',
                Label : 'latestCalibrationCost',
                Value : latestCalibrationCost,
            },
            {
                $Type : 'UI.DataField',
                Label : 'futureCalibrationDate',
                Value : futureCalibrationDate,
            },
            {
                $Type : 'UI.DataField',
                Label : 'calibrationVendor1',
                Value : calibrationVendor1,
            },
            {
                $Type : 'UI.DataField',
                Label : 'calibrationVendor2',
                Value : calibrationVendor2,
            },
            {
                $Type : 'UI.DataField',
                Label : 'calibrationVendor3',
                Value : calibrationVendor3,
            },
            {
                $Type : 'UI.DataField',
                Label : 'uom',
                Value : uom,
            },
            {
                $Type : 'UI.DataField',
                Label : 'minFahrenheit',
                Value : minFahrenheit,
            },
            {
                $Type : 'UI.DataField',
                Label : 'maxFahrenheit',
                Value : maxFahrenheit,
            },
            {
                $Type : 'UI.DataField',
                Label : 'inputValue',
                Value : inputValue,
            },
            {
                $Type : 'UI.DataField',
                Label : 'outputValue',
                Value : outputValue,
            },
            {
                $Type : 'UI.DataField',
                Label : 'conversionUnits',
                Value : conversionUnits,
            },
            {
                $Type : 'UI.DataField',
                Label : 'toleranceLimit',
                Value : toleranceLimit,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Asset Name',
            Value : assetName,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Serial Number',
            Value : serialNumber,
        },        
        {
            $Type : 'UI.DataField',
            Label : 'manufacturer',
            Value : manufacturer,
            @UI.Hidden: true,
        },
        {
            $Type : 'UI.DataField',
            Label : 'barcode',
            Value : barcode,
            @UI.Hidden: false,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Base Location',
            Value : baseLocation,
        },
    ],
);

