module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 150],
    'subject-full-stop': [0, 'never'],
    'subject-case': [
      2,
      'never',
      [
        'upper-case', // UPPERCASE
      ],
    ],
  },
};
