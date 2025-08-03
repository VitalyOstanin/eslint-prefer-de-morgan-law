const { RuleTester } = require('eslint');
const rule = require('../lib/prefer-de-morgan-law');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
  },
});

ruleTester.run('prefer-de-morgan-law', rule, {
  valid: [
    '!(isAdmin && isEnabled)', // Already in De Morgan form
    'if (someCondition) { /* no negation */ }', // No negation
    'if (isAdmin || isEnabled) { /* single conditions */ }', // Not negated
    'if (a && b) { /* no negation */ }', // Positive condition
  ],
  invalid: [
    // Simple case
    {
      code: 'if (!isAdmin || !isEnabled) { /* some code */ }',
      output: 'if (!(isAdmin && isEnabled)) { /* some code */ }',
      errors: [{ messageId: 'preferDeMorgan' }],
    },
    // Multiple conditions
    {
      code: 'if (!a || !b || !c) { /* some code */ }',
      output: 'if (!(a && b && c)) { /* some code */ }',
      errors: [{ messageId: 'preferDeMorgan' }],
    },
    // Comparisons
    {
      code: 'if (x !== 0 || y !== 10) { /* some code */ }',
      output: 'if (!(x === 0 && y === 10)) { /* some code */ }',
      errors: [{ messageId: 'preferDeMorgan' }],
    },
    // Complex object conditions
    {
      code: 'if (!user.isLoggedIn || !user.hasPermission(\'edit\')) { /* some code */ }',
      output: 'if (!(user.isLoggedIn && user.hasPermission(\'edit\'))) { /* some code */ }',
      errors: [{ messageId: 'preferDeMorgan' }],
    },
  ],
});