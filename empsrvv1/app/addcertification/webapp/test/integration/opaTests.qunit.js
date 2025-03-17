sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'app/addcertification/test/integration/FirstJourney',
		'app/addcertification/test/integration/pages/CertificationsList',
		'app/addcertification/test/integration/pages/CertificationsObjectPage'
    ],
    function(JourneyRunner, opaJourney, CertificationsList, CertificationsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('app/addcertification') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheCertificationsList: CertificationsList,
					onTheCertificationsObjectPage: CertificationsObjectPage
                }
            },
            opaJourney.run
        );
    }
);