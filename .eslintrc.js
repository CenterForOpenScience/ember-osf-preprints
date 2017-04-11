module.exports = {
    root: true,
    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module'
    },
    extends: 'eslint:recommended',
    env: {
        browser: true,
        es6: true
    },
    globals: {
        MathJax: true
    },
    rules: {}
};
