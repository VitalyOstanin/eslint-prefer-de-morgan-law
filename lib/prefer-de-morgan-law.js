/**
 * ESLint rule for applying De Morgan's law
 * Transforms !a || !b into !(a && b) for better readability
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer !(a && b) over !a || !b for better readability',
      category: 'Stylistic Issues',
      recommended: false,
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferDeMorgan: 'Use !({{left}} && {{right}}) instead of {{original}} for better readability (De Morgan\'s law)',
    },
  },

  create(context) {
    const sourceCode = context.getSourceCode();

    /**
     * Checks if node is a negation expression (! operator or !== comparison)
     */
    function isNegationExpression(node) {
      if (!node) return false;

      // Direct negation: !expr
      if (node.type === 'UnaryExpression' && node.operator === '!') {
        return true;
      }

      // Comparison negation: expr !== value
      if (node.type === 'BinaryExpression' && node.operator === '!==') {
        return true;
      }

      return false;
    }

    /**
     * Checks if parentheses are needed around operand
     */
    function needsParentheses(node) {
      if (!node) return false;

      // Conditions requiring parentheses
      const complexTypes = [
        'LogicalExpression',
        'ConditionalExpression',
        'AssignmentExpression',
        'BinaryExpression',
        'CallExpression',
        'MemberExpression'
      ];
      return complexTypes.includes(node.type);
    }

    /**
     * Formats operand considering parentheses necessity
     */
    function formatOperand(node) {
      // If node is not present, return empty string
      if (!node) return '';

      // Use sourceCode.getText for most cases to preserve exact representation
      let operandText = sourceCode.getText(node);

      // Handle direct negation
      if (node.type === 'UnaryExpression' && node.operator === '!') {
        const operand = node.argument;
        // Don't add extra parentheses if already negated or very simple
        if (needsParentheses(operand) && operand.type !== 'UnaryExpression') {
          operandText = `(${operandText.slice(1)})`;
        }
      }

      // Handle comparison transform
      if (node.type === 'BinaryExpression' && node.operator === '!==') {
        operandText = `${sourceCode.getText(node.left)} === ${sourceCode.getText(node.right)}`;
      }

      return operandText;
    }

    /**
     * Flattens nested OR conditions into a single list of operands
     */
    function flattenOrOperands(node) {
      const operands = [];

      const flatten = (subNode) => {
        if (subNode.type === 'LogicalExpression' && subNode.operator === '||') {
          flatten(subNode.left);
          flatten(subNode.right);
        } else {
          operands.push(subNode);
        }
      };

      flatten(node);
      return operands;
    }

    /**
     * Checks if all operands in an OR expression are negated
     */
    function areAllOperandsNegated(node) {
      const operands = flattenOrOperands(node);
      return operands.every(op => isNegationExpression(op));
    }

    return {
      LogicalExpression(node) {
        // Check pattern: !a || !b or !a || !b || !c
        if (node.operator === '||' &&
            areAllOperandsNegated(node) &&
            // Ensure this is the top-level OR condition
            node.parent.type !== 'LogicalExpression') {
          const operands = flattenOrOperands(node);

          // Get the text of each operand by stripping the negation
          const positiveOperands = operands.map(op =>
            formatOperand(op.type === 'UnaryExpression' ? op.argument : op)
          );

          context.report({
            node,
            messageId: 'preferDeMorgan',
            data: {
              left: sourceCode.getText(node.left),
              right: sourceCode.getText(node.right),
              original: sourceCode.getText(node),
            },
            fix(fixer) {
              // Prefer handling full nested OR expression or single level
              const replacement = `!(${positiveOperands.join(' && ')})`;
              return fixer.replaceText(node, replacement);
            },
          });
        }
      },
    };
  },
};