const { defineConfig } = require("cypress");

module.exports = defineConfig({
    e2e: {
        baseUrl: "http://localhost:3000",
        video: false,
        reporter: "cypress-mochawesome-reporter",
        setupNodeEvents(on, config) {
            require("cypress-mochawesome-reporter/plugin")(on);
        },
    },
});
