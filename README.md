# ESLint Prefer De Morgan's Law Rule

An ESLint plugin that suggests applying De Morgan's law for improved code readability.

## Installation

```bash
npm install --save-dev @vitalyostanin/eslint-prefer-de-morgan-law
```

## Usage

### Flat Config (ESLint 9+)

```javascript
import preferDeMorganLaw from '@vitalyostanin/eslint-prefer-de-morgan-law';

export default [
  {
    plugins: {
      'prefer-de-morgan-law': {
        rules: {
          'prefer-de-morgan-law': preferDeMorganLaw,
        },
      },
    },
    rules: {
      'prefer-de-morgan-law/prefer-de-morgan-law': 'error',
    },
  },
];
```

### Legacy Config

```json
{
  "plugins": ["@vitalyostanin/eslint-prefer-de-morgan-law"],
  "rules": {
    "@vitalyostanin/eslint-prefer-de-morgan-law/prefer-de-morgan-law": "error"
  }
}
```

## Examples

The rule checks for negated logical expressions and suggests De Morgan's law transformations:

```javascript
// Example 1: Simple case
// Before
if (!isAdmin || !isEnabled) { ... }
// After
if (!(isAdmin && isEnabled)) { ... }

// Example 2: More complex conditions
// Before
if (!user.isLoggedIn || !user.hasPermission('edit')) {
  showError();
}
// After
if (!(user.isLoggedIn && user.hasPermission('edit'))) {
  showError();
}

// Example 3: Nested expressions
// Before
if (!a || !b || !c) { ... }
// After
if (!(a && b && c)) { ... }

// Example 4: Comparisons
// Before
if (x !== 0 || y !== 10) { ... }
// After
if (!(x === 0 && y === 10)) { ... }
```

## Rationale

De Morgan's law states that `!(a || b)` is equivalent to `!a && !b`, and vice versa. 
This rule helps improve code readability by:
- Reducing cognitive load
- Making logical conditions more explicit
- Following a consistent logical transformation pattern

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT