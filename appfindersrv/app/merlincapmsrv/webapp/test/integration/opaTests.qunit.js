sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/mindset/accelerator/list/merlincapmsrv/test/integration/FirstJourney',
		'com/mindset/accelerator/list/merlincapmsrv/test/integration/pages/ShareInfoSetList',
		'com/mindset/accelerator/list/merlincapmsrv/test/integration/pages/ShareInfoSetObjectPage'
    ],
    function(JourneyRunner, opaJourney, ShareInfoSetList, ShareInfoSetObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/mindset/accelerator/list/merlincapmsrv') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheShareInfoSetList: ShareInfoSetList,
					onTheShareInfoSetObjectPage: ShareInfoSetObjectPage
                }
            },
            opaJourney.run
        );
    }
);