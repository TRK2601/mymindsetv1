using ZMINDSET_S4_APP_FINDER_SRV as service from '../../srv/service';

annotate service.ShareInfoSet with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : createdBy,
        },    
        {  
            $Type : 'UI.DataField',
            Value : lastAccessDate,
        },      
        {
            $Type : 'UI.DataField',
            Value : passKey,
        },
        {
            $Type : 'UI.DataField',
            Value : customerName,
        }, 
        {
            $Type : 'UI.DataField',
            Label : 'Created Date',
            Value : createdAt,
        }, 
        {
            $Type : 'UI.DataField',
            Label : 'Last Updated',
            Value : modifiedAt,
        }, 
        {
            $Type : 'UI.DataField',
            Value : count,
        },
        {
            $Type : 'UI.DataField',
            Value : selectedVersion,
        },
        {
            $Type : 'UI.DataField',
            Value : STO3NRepost,
            @UI.Hidden: true,
        },
        {
            $Type : 'UI.DataField',
            Value : id,
            @UI.Hidden: true,
        },
        {
            $Type : 'UI.DataField',
            Value : modifiedBy,
            @UI.Hidden: true,
        },
        {
            $Type : 'UI.DataField',
            Value : svariant,
            @UI.Hidden: true,
        },
        {
            $Type : 'UI.DataField',
            Value : svariant_id,
            @UI.Hidden: true,
        }
    ]
);

annotate service.ShareInfoSet with @(
    UI.FieldGroup #GeneratedGroup1 : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : createdBy,
            },
            {
                $Type : 'UI.DataField',
                Value : lastAccessDate,
            },
            {
                $Type : 'UI.DataField',
                Value : passKey,
            },
            {
                $Type : 'UI.DataField',
                Value : customerName,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Created Date',
                Value : createdAt,
            }, 
            {
                $Type : 'UI.DataField',
                Label : 'Last Updated Date',
                Value : modifiedAt,
            }, 
            {
                $Type : 'UI.DataField',
                Value : count,
            },
            {
                $Type : 'UI.DataField',
                Value : selectedVersion,
            },
            {
                $Type : 'UI.DataField',
                Value : id,
            },
            {
                $Type : 'UI.DataField',
                Value : STO3NRepost,
            },
            {
                $Type : 'UI.DataField',
                Value : svariant,
            },
            {
                $Type : 'UI.DataField',
                Value : svariant_id,
            }          
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup1'
        },
    ]
);

annotate service.ShareInfoSet with @(
    UI : {
        DeleteHidden : false
    }
);

annotate service.ShareInfoSet with @(
  UI.HeaderInfo : {
    TypeName : 'App Finder External Links',
    TypeNamePlural : 'AppFinder External Links',
    Title : {
        $Type : 'UI.DataField',
        Value : customerName
    }
  }
);

annotate service.ShareInfoSet with @(
    UI.SelectionPresentationVariant #table : {
        $Type : 'UI.SelectionPresentationVariantType',
        PresentationVariant : {
            $Type : 'UI.PresentationVariantType',
            Visualizations : [
                '@UI.LineItem',
            ],
            SortOrder : [
                {
                    $Type : 'Common.SortOrderType',
                    Property : createdAt,
                    Descending : true,
                },
            ],
        },
        SelectionVariant : {
            $Type : 'UI.SelectionVariantType',
            SelectOptions : [
            ],
        },
    }
);
