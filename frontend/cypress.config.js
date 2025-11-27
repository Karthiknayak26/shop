const { defineConfig } = require("cypress");

module.exports = defineConfig({
    e2e: {
        // baseUrl: "https://shop-frontend-ns7z.onrender.com",
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
        viewportWidth: 1280,
        viewportHeight: 720,
    },
});
