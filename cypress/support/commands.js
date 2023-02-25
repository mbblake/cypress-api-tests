// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Restore the posts data in the database file (db.json) to its original state
Cypress.Commands.add("restorePostData", { prevSubject: false }, () => {
    cy.request("GET", "/posts")
        .its("body")
        .each((post) => {
            cy.request("DELETE", `/posts/${post.id}`);
        });
    cy.fixture("defaultData")
        .its("posts")
        .each((post) => {
            cy.request("POST", "/posts", post);
        });
});

// Remove all test users from the database
Cypress.Commands.add("removeUserData", { prevSubject: false }, () => {
    cy.request("GET", "/users")
        .its("body")
        .each((user) => {
            cy.request("DELETE", `/users/${user.id}`);
        });
});

// Register a test user in order to generate an access token to use the API
Cypress.Commands.add(
    "register",
    { prevSubject: false },
    ({ email, password }) => {
        cy.request("POST", "/register", { email, password }).then((res) => {
            Cypress.env("accessToken", res.body.accessToken);
        });
    }
);

// Overwrite cy.request() to include authorization header by default
// https://github.com/cypress-io/cypress/issues/726#issuecomment-758923325
Cypress.Commands.overwrite("request", (originalFn, ...args) => {
    const defaults = {
        headers: {
            authorization: `Bearer ${Cypress.env("accessToken")}`,
        },
    };

    let options = {};
    if (typeof args[0] === "object" && args[0] !== null) {
        options = args[0];
    } else if (args.length === 1) {
        [options.url] = args;
    } else if (args.length === 2) {
        [options.method, options.url] = args;
    } else if (args.length === 3) {
        [options.method, options.url, options.body] = args;
    }

    return originalFn({
        ...defaults,
        ...options,
        ...{ headers: { ...defaults.headers, ...options.headers } },
    });
});
