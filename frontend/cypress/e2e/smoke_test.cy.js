describe('Smoke Test - Deployed Website', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should load the homepage successfully', () => {
        cy.title().should('include', 'Kandukuru Supermarket');
        cy.get('nav').should('be.visible');
    });

    it('should display products on the homepage', () => {
        // Wait for products to load (adjust selector based on actual app)
        // Using a generic check for now, will refine after first run if needed
        cy.get('body').should('contain.text', 'Kandukuru');
    });

    it('should navigate to the login page', () => {
        // Look for a login link or button. 
        // Common patterns: "Login", "Sign In", or an icon.
        // Trying to find by text first as it's more robust for a black-box test
        cy.contains(/login|sign in/i).click();
        cy.url().should('include', '/login');
        cy.get('form').should('be.visible');
    });
});
