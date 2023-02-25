# cypress-api-tests

Demonstration of using Cypress to run API tests against a basic, locally-running REST API. This project uses `JSON Server` and `JSON Server Auth` to set up a simple API with authorization.

## Getting Started

### Installing

-   Install git
-   Clone the repo: `git clone https://github.com/MattBlakeQA/cypress-api-tests.git`
-   Install Node 18+
-   Install NPM
-   Install Chrome
-   Install dependencies: `npm install`

### Running tests

-   Run all API tests: `npm run cypress`. This will automatically start up the server, run the tests, and then shutdown the server. The "database" is restored each run so there is nothing to set up/maintain.

### Report

An html report is generated automatically in `/cypress/reports`
