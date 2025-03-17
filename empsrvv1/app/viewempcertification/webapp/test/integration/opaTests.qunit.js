sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'app/viewempcertification/test/integration/FirstJourney',
		'app/viewempcertification/test/integration/pages/EmployeeCertificationsList',
		'app/viewempcertification/test/integration/pages/EmployeeCertificationsObjectPage'
    ],
    function(JourneyRunner, opaJourney, EmployeeCertificationsList, EmployeeCertificationsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('app/viewempcertification') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheEmployeeCertificationsList: EmployeeCertificationsList,
					onTheEmployeeCertificationsObjectPage: EmployeeCertificationsObjectPage
                }
            },
            opaJourney.run
        );
    }
);