# Getting Started

Welcome to your new project.

It contains these folders and files, following our recommended project layout:

File or Folder | Purpose
---------|----------
`app/` | content for UI frontends goes here
`db/` | your domain models and data go here
`srv/` | your service models and code go here
`package.json` | project metadata and configuration
`readme.md` | this getting started guide


## Next Steps

- Open a new terminal and run `cds watch` 
- (in VS Code simply choose _**Terminal** > Run Task > cds watch_)
- Start adding content, for example, a [db/schema.cds](db/schema.cds).


## Learn More

Learn more at https://cap.cloud.sap/docs/get-started/.


## Updated "Getting Started"

This service uses a local SQLite database via the sqlite3 npm module.

/db now contains .csv files needed to load for development on employee portal apps

- run __npm run-script deploy-local__ from the terminal

You can get more details at https://cap.cloud.sap/docs/guides/databases#deploy-to-sqlite

* Note if you are using windows you will need to instlall sqlite
