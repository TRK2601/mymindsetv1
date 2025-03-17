using assetwise as service from '../../srv/service';
using from '../../db/data-model';

annotate service.AssetMaster with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : '{i18n>Name}',
            Value : name,
        },
        {
            $Type : 'UI.DataField',
            Label : '{i18n>MaterialType}',
            Value : matType,
        },
        {
            $Type : 'UI.DataField',
            Label : '{i18n>Description1}',
            Value : desc1,
        },
         {
            $Type : 'UI.DataField',
            Label : '{i18n>Group}',
            Value : group,
        },
    ],
    UI.HeaderInfo : {
        $Type : 'UI.HeaderInfoType',
        TypeName : '{i18n>AssetInformation}',
        TypeNamePlural : '{i18n>Assets}',
        Title : {
            Value : name,
        },
        Description : {
            Value : desc1,
        },
        ImageUrl : ImageUrl
    },
    UI.SelectionFields : [
        name,matType
    ]
);
annotate service.AssetMaster with @(
    UI.FieldGroup #GeneratedGroup1 : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Id}',
                Value : ID,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>MaterialType}',
                Value : matType,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Name}',
                Value : name,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Group}',
                Value : group,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>SubGroup}',
                Value : subGroup,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Components}',
                Value : components,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Description1}',
                Value : desc1,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Description2}',
                Value : desc2,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Description3}',
                Value : desc3,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>BarcodeNo}',
                Value : barcodeNo,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>SerialNo}',
                Value : serialNo,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Status}',
                Value : status,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>AdditionalText}',
                Value : openTextBox1,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
        ],
    },
    UI.FieldGroup #GeneratedGroup2 : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : '{i18n>PoNumber}',
                Value : poNumber,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>ProcuredDate}',
                Value : procuredDate,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>ProcuredCost}',
                Value : procuredCost,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
             {
                $Type : 'UI.DataField',
                Label : '{i18n>ProcuredCostCur}',
                Value : procuredCostCur,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
             {
                $Type : 'UI.DataField',
                Label : '{i18n>NetValue}',
                Value : assetNetValue,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
             {
                $Type : 'UI.DataField',
                Label : '{i18n>NetValueCur}',
                Value : assetCurType,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Vendor}',
                Value : assetVendor,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>ManufacturedBy}',
                Value : manufacturedBy,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Insured}',
                Value : insured,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>AdditionalText}',
                Value : openTextBox2,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
        ],
    },
    UI.FieldGroup #GeneratedGroup3 : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : '{i18n>insurancePartner}',
                Value : insurancePartner,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>insurancePolicyNo}',
                Value : insurancePolicyNo,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>previousRenewalDate}',
                Value : previousRenewalDate,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>previousRenewalPremium}',
                Value : previousRenewalPremium,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>nextRenewalDate}',
                Value : nextRenewalDate,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>claimsInCurrentYear}',
                Value: claimsInCurrentYear,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>claimDetails}',
                Value : claimDetails,
                @UI.Hidden : {$edmJson: {$Ne: [{$Path: 'claimsInCurrentYear'}, true]}},
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
        ],
    },
    UI.FieldGroup #GeneratedGroup4 : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : '{i18n>OwnedTeam}',
                Value : ownedTeam,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Owner}',
                Value : Owner,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>UserTeam}',
                Value : userTeam,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>User}',
                Value : user,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>baseLoc}',
                Value : baseLocation,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>funcLoc}',
                Value : funcLocation,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>HandedOverDate}',
                Value : handedOverDate,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>ReturnDate}',
                Value : returnDate,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Lost}',
                Value : lost,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>AdditionalText}',
                Value : openTextBox3,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
        ],
    },
     UI.FieldGroup #GeneratedGroup5 : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : '{i18n>ServiceProvider1}',
                Value : servProvider1,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>ServiceProvider2}',
                Value : servProvider2,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>ServiceProvider3}',
                Value : servProvider3,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>LatestServiceDate}',
                Value : latestServiceDate,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>ServiceCost}',
                Value : serviceCost,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
             {
                $Type : 'UI.DataField',
                Label : '{i18n>ServiceCostCur}',
                Value : serviceCostCur,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>LatestServiceVendor}',
                Value : latestServiceVendor,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>ServiceIntervals}',
                Value : serviceIntervals,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
             {
                $Type : 'UI.DataField',
                Label : '{i18n>ServiceIntervalPeriod}',
                Value : serviceIntervalPeriod_code,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>TermLife}',
                Value : termLife,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
             {
                $Type : 'UI.DataField',
                Label : '{i18n>TermLifePeriod}',
                Value : termLifePeriod_code,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Breakdown}',
                Value : breakdown,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq :[ { $Path : 'lost'}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>AdditionalText}',
                Value : openTextBox4,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
        ],
    },
    UI.FieldGroup #GeneratedGroup6 : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : '{i18n>ScrappedDate}',
                Value : assetScrappedDate,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>ScrappedValue}',
                Value : assetScrappedValue,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
             {
                $Type : 'UI.DataField',
                Label : '{i18n>ScrappedValueCur}',
                Value : assetScrappedValueCur,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>ScrappedOwner}',
                Value: assetScrappedOwner,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>AdditionalText}',
                Value : openTextBox5,
                ![@Common.FieldControl]: { $edmJson : {$If : [ { $Eq : [{$Or:[ { $Path : 'breakdown'},{ $Path : 'lost'}]}, false ]}, 3, 1 ]}},
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : '{i18n>BasicData}',
            Target : '@UI.FieldGroup#GeneratedGroup1',
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet2',
            Label : '{i18n>Procurement}',
            Target : '@UI.FieldGroup#GeneratedGroup2',
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet3',
            Label : 'Insurance',
            Target : '@UI.FieldGroup#GeneratedGroup3',
            @UI.Hidden : {$edmJson: {$Ne: [{$Path: 'insured'}, true]}},
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet4',
            Label : 'Owners',
            Target : '@UI.FieldGroup#GeneratedGroup4',
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet5',
            Label : 'Maintenance',
            Target : '@UI.FieldGroup#GeneratedGroup5',
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet6',
            Label : '{i18n>Scrapping}',
            Target : '@UI.FieldGroup#GeneratedGroup6',
        },
    ]
);

annotate service.AssetMaster with {
    user @Common.ValueList : {
        $Type : 'Common.ValueListType',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                ValueListProperty : 'name',
                LocalDataProperty : user,
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'code',
            },
        ],
        CollectionPath : 'Employee',
        SearchSupported : true,
        Label : 'UserSearch',
    }
}; 

annotate service.AssetMaster with {
    matType @Common.ValueList : {
        $Type : 'Common.ValueListType',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                ValueListProperty : 'name',
                LocalDataProperty : matType,
            },
        ],
        CollectionPath : 'MaterialType',
        SearchSupported : true,
        Label : 'MaterialTypeSearch',
    }
};
annotate service.Employee with {
    name @Common.Label : '{i18n>Name}'
};
annotate service.MaterialType with {
    name @Common.Label : '{i18n>Name}'
};
annotate service.MaterialType with {
   name @UI.HiddenFilter : true
};

annotate service.AssetMaster with {
    matType @Common.ValueListWithFixedValues : false;
    matType @Common.Label : '{i18n>MaterialType}';
    openTextBox1 @UI.MultiLineText : true;
    openTextBox2 @UI.MultiLineText : true;
    openTextBox3 @UI.MultiLineText : true;
    openTextBox4 @UI.MultiLineText : true;
    openTextBox5 @UI.MultiLineText : true;
    matType @mandatory : true;
    barcodeNo @mandatory : true;
    serialNo @mandatory : true;
    group @Common.ValueListWithFixedValues : true;
    funcLocation @Common.ValueListWithFixedValues : true;
    baseLocation @Common.ValueListWithFixedValues : true;
    claimDetails @UI.MultiLineText : true;
};
annotate service.AssetMaster with {
    Owner @Common.ValueList : {
        $Type : 'Common.ValueListType',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                ValueListProperty : 'name',
                LocalDataProperty : Owner,
            },
            {
                $Type: 'Common.ValueListParameterConstant',
                Constant: 'true',
                ValueListProperty : 'isOwner',
            },
            {
                $Type: 'Common.ValueListParameterFilterOnly',
                ValueListProperty : 'code',
            },
        ],
        CollectionPath : 'Employee',
        SearchSupported : true,
        Label : '{@i18n>owner}',
    }
};

annotate service.Employee with {
   ID @UI.HiddenFilter : true;
   managerName @UI.HiddenFilter : true;
   managerCode @UI.HiddenFilter : true;
   managerEmail @UI.HiddenFilter : true;
   isOwner @UI.HiddenFilter : true;
   isManager @UI.HiddenFilter : true;
   isUser @UI.HiddenFilter : true;
   hasCreatable @UI.HiddenFilter : true;
   hasUpdatble @UI.HiddenFilter : true;
};

annotate service.AssetMaster with {
    assetScrappedOwner @Common.ValueList : {
        $Type : 'Common.ValueListType',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                ValueListProperty : 'name',
                LocalDataProperty : assetScrappedOwner,
            },
            {
                $Type: 'Common.ValueListParameterConstant',
                Constant: 'true',
                ValueListProperty : 'isOwner',
            },
            {
                $Type: 'Common.ValueListParameterFilterOnly',
                ValueListProperty : 'code',
            },
        ],
        CollectionPath : 'Employee',
        SearchSupported : true,
        Label : '{@i18n>owner}',
    }
};

annotate service.AssetMaster with {
    serviceIntervalPeriod @(Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'formatType',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : serviceIntervalPeriod_code,
                    ValueListProperty : 'code',
                },
            ],
            Label : 'Service Interval Period',
        },
        Common.ValueListWithFixedValues : true
)};


annotate service.formatType with {
    code @Common.Label : 'Code'
};
annotate service.formatType with {
    name @Common.Label : '{i18n>Name}'
};

annotate service.AssetMaster with {
    termLifePeriod @(Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'formatType',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : termLifePeriod_code,
                    ValueListProperty : 'code',
                },
            ],
            Label : 'Term Life Period',
        },
        Common.ValueListWithFixedValues : true
)};
annotate service.AssetMaster with {
    assetCurType @(Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'MaterialTypeCurrency',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterIn',
                    LocalDataProperty : matType,
                    ValueListProperty : 'materialType_name',
                },
                {
                    $Type : 'Common.ValueListParameterOut',
                    LocalDataProperty : assetCurType,
                    ValueListProperty : 'currency_code',
                }
            ]
        },
        Common.ValueListWithFixedValues : true
)};
annotate service.AssetMaster with {
    procuredCostCur @(Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'MaterialTypeCurrency',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterIn',
                    LocalDataProperty : matType,
                    ValueListProperty : 'materialType_name',
                },
                {
                    $Type : 'Common.ValueListParameterOut',
                    LocalDataProperty : procuredCostCur,
                    ValueListProperty : 'currency_code',
                }
            ]
        },
        Common.ValueListWithFixedValues : true
)};
annotate service.Currency with {
    code @Common.Text : {
        $value : symbol,
        ![@UI.TextArrangement] : #TextLast,
    }
};

annotate service.formatType with {
    name @Common.Text : {
        $value : code,
        ![@UI.TextArrangement] : #TextLast,
    }
};
annotate service.AssetMaster with {
    assetScrappedValueCur @(Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'MaterialTypeCurrency',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterIn',
                    LocalDataProperty : matType,
                    ValueListProperty : 'materialType_name',
                },
                {
                    $Type : 'Common.ValueListParameterOut',
                    LocalDataProperty : assetScrappedValueCur,
                    ValueListProperty : 'currency_code',
                }
            ],
            Label : 'Scrapped Value Currency',
        },
        Common.ValueListWithFixedValues : true
)};

annotate service.AssetMaster with {
    serviceCostCur @(Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'MaterialTypeCurrency',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterIn',
                    LocalDataProperty : matType,
                    ValueListProperty : 'materialType_name',
                },
                {
                    $Type : 'Common.ValueListParameterOut',
                    LocalDataProperty : serviceCostCur,
                    ValueListProperty : 'currency_code',
                }
            ],
            Label : 'Service Cost Currency',
        },
        Common.ValueListWithFixedValues : true
)};
annotate service.AssetMaster with {
    baseLocation @Common.ValueList : {
        $Type : 'Common.ValueListType',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterOut',
                ValueListProperty : 'baseLocation_code',
                LocalDataProperty : baseLocation,
            },
             {
                $Type : 'Common.ValueListParameterIn',
                ValueListProperty : 'materialType_name',
                LocalDataProperty : matType,
            },
        ],
        CollectionPath : 'MaterialTypeBaseLocation',
        SearchSupported : true,
    }
};

annotate service.AssetMaster with {
    funcLocation @Common.ValueList : {
        $Type : 'Common.ValueListType',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterIn',
                ValueListProperty : 'materialType_name',
                LocalDataProperty : matType,
            },
            {
                $Type : 'Common.ValueListParameterIn',
                ValueListProperty : 'baseLocation_code',
                LocalDataProperty : baseLocation,
            },
            {
                $Type : 'Common.ValueListParameterOut',
                ValueListProperty : 'functionalLocation_code',
                LocalDataProperty : funcLocation,
            },
        ],
        CollectionPath : 'MaterialTypeFunctionalLocation',
        SearchSupported : true,
    }
};

annotate service.AssetMaster with {
    group @Common.ValueList : {
        $Type : 'Common.ValueListType',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterIn',
                ValueListProperty : 'materialType_name',
                LocalDataProperty : matType,
            },
            {
                $Type : 'Common.ValueListParameterOut',
                ValueListProperty : 'group_name',
                LocalDataProperty : group,
            },
        ],
        CollectionPath : 'MaterialTypeGroup',
        SearchSupported : true
    }
};

annotate service.AssetMaster with {
    subGroup @(Common.ValueList : {
        $Type : 'Common.ValueListType',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterIn',
                ValueListProperty : 'materialType_name',
                LocalDataProperty : matType,
            },
            {
                $Type : 'Common.ValueListParameterIn',
                ValueListProperty : 'group_name',
                LocalDataProperty : group,
            },
            {
                $Type : 'Common.ValueListParameterOut',
                ValueListProperty : 'subGroup_name',
                LocalDataProperty : subGroup,
            },
        ],
        CollectionPath : 'MaterialTypeSubGroup',
        SearchSupported : true,
    },
    Common.ValueListWithFixedValues : true
)};

annotate service.AssetMaster with {
    status @(Common.ValueList : {
        $Type : 'Common.ValueListType',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                ValueListProperty : 'name',
                LocalDataProperty : status,
            },
        ],
        CollectionPath : 'AssetStatus',
        SearchSupported : true,
    },
    Common.ValueListWithFixedValues : true
)};
