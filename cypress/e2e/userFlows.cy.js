describe('DEFRAG User Flows', () => {
  beforeEach(() => {
    cy.window().then(win => {
      win.localStorage.removeItem('defrag_auth_token');
      win.localStorage.removeItem('defrag_user_email');
      win.localStorage.removeItem('defrag_user_data');
      win.localStorage.removeItem('defrag_onboarding_complete');
    });
  });
  it('Onboarding: new user can create profile and access dashboard', () => {
    cy.visit('/onboarding');
    cy.get('body').then($body => cy.log('ONBOARDING HTML: ' + $body.html()));
    cy.contains('Begin Mapping').click();
    cy.get('input[type="date"]').clear().type('1990-01-01');
    cy.get('input[type="time"]').clear().type('12:00');
    cy.get('input[placeholder="City, Country"]').clear().type('NYC');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.get('body').then($body => cy.log('DASHBOARD HTML: ' + $body.html()));
    cy.contains('Your Blueprint').should('be.visible');
  });

  it('Login/logout: user can log in, use features, log out, and restore session', () => {
    // Simulate user with onboarding complete and user data
    cy.window().then(win => {
      win.localStorage.setItem('defrag_user_data', JSON.stringify({ type: 'Generator', strategy: 'Respond', authority: 'Sacral', profile: '5/1', centers: { a: true }, relationalDynamics: {} }));
      win.localStorage.setItem('defrag_onboarding_complete', 'true');
    });
    cy.visit('/login');
    cy.get('body').then($body => cy.log('LOGIN HTML: ' + $body.html()));
    cy.get('input[type="email"]').type('testuser@defrag.app');
    cy.get('input[type="password"]').type('testpassword');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.get('body').then($body => cy.log('DASHBOARD HTML: ' + $body.html()));
    cy.contains('Exit').click();
    cy.url().should('include', '/');
    cy.visit('/login');
    cy.get('body').then($body => cy.log('LOGIN HTML: ' + $body.html()));
    cy.get('input[type="email"]').type('testuser@defrag.app');
    cy.get('input[type="password"]').type('testpassword');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.get('body').then($body => cy.log('DASHBOARD HTML: ' + $body.html()));
  });

  it('Session persistence: user data is restored after browser reload', () => {
    cy.window().then(win => {
      win.localStorage.setItem('defrag_user_data', JSON.stringify({ type: 'Generator', strategy: 'Respond', authority: 'Sacral', profile: '5/1', centers: { a: true }, relationalDynamics: {} }));
      win.localStorage.setItem('defrag_birth_data', JSON.stringify({ date: '1990-01-01', time: '12:00' }));
      win.localStorage.setItem('defrag_onboarding_complete', 'true');
      win.localStorage.setItem('defrag_auth_token', 'session_active');
    });
    cy.visit('/dashboard');
    cy.get('body').then($body => cy.log('DASHBOARD HTML: ' + $body.html()));
    cy.contains('Your Blueprint').should('be.visible');
    cy.reload();
    cy.get('body').then($body => cy.log('DASHBOARD HTML (after reload): ' + $body.html()));
    cy.contains('Your Blueprint').should('be.visible');
  });

  it('Checkout: payment buttons redirect to Stripe', () => {
    cy.visit('/dashboard');
    cy.get('body').then($body => cy.log('DASHBOARD HTML: ' + $body.html()));
    cy.contains('Buy Blueprint').click();
    cy.url().should('include', 'stripe.com');
    cy.visit('/dashboard');
    cy.get('body').then($body => cy.log('DASHBOARD HTML: ' + $body.html()));
    cy.contains('Subscribe to Orbit').click();
    cy.url().should('include', 'stripe.com');
  });

  it('Feature gating: protected routes require login', () => {
    cy.visit('/dashboard');
    cy.get('body').then($body => cy.log('DASHBOARD HTML: ' + $body.html()));
    cy.window().then(win => win.localStorage.removeItem('defrag_auth_token'));
    cy.visit('/dashboard');
    cy.get('body').then($body => cy.log('DASHBOARD HTML (after logout): ' + $body.html()));
    cy.url().should('include', '/login');
  });

  it('AI features: chatbot, export, and conflict resolution work for logged-in users', () => {
    cy.visit('/login');
    cy.get('body').then($body => cy.log('LOGIN HTML: ' + $body.html()));
    cy.get('input[type="email"]').type('testuser@defrag.app');
    cy.get('input[type="password"]').type('testpassword');
    cy.get('button[type="submit"]').click();
    cy.url().should('match', /dashboard|onboarding/);
    // Chatbot
    cy.visit('/chatbot');
    cy.get('body').then($body => cy.log('CHATBOT HTML: ' + $body.html()));
    cy.contains('Ask about your design').should('be.visible');
    // Export
    cy.visit('/dashboard');
    cy.get('body').then($body => cy.log('DASHBOARD HTML: ' + $body.html()));
    cy.contains('Download Relationship User Manual').click();
    cy.contains('Download Relationship User Manual').should('be.visible');
    // Conflict Room
    cy.visit('/conflict-room');
    cy.url().then(url => {
      cy.log('Current URL: ' + url);
      if (url.includes('/login')) {
        cy.screenshot('redirected-to-login');
        throw new Error('Redirected to /login after visiting /conflict-room');
      }
    });
    cy.get('body').then($body => {
      cy.log('CONFLICT ROOM HTML: ' + $body.html());
      if ($body.find('textarea').length === 0) {
        cy.screenshot('no-textarea-debug');
        throw new Error('No textarea found on /conflict-room');
      }
    });
    cy.get('textarea').type('We keep arguing about chores');
    cy.get('button[type="submit"]').click();
    cy.contains('Pattern Identified').should('be.visible');
  });
});
