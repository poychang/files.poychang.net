const browserGlobals = {
    AbortController: 'readonly',
    Blob: 'readonly',
    CustomEvent: 'readonly',
    File: 'readonly',
    FileReader: 'readonly',
    FormData: 'readonly',
    HTMLElement: 'readonly',
    URL: 'readonly',
    atob: 'readonly',
    btoa: 'readonly',
    bootstrap: 'readonly',
    console: 'readonly',
    document: 'readonly',
    fetch: 'readonly',
    localStorage: 'readonly',
    navigator: 'readonly',
    sessionStorage: 'readonly',
    setTimeout: 'readonly',
    clearTimeout: 'readonly',
    window: 'readonly',
};

const nodeGlobals = {
    __dirname: 'readonly',
    __filename: 'readonly',
    Buffer: 'readonly',
    console: 'readonly',
    process: 'readonly',
};

export default [
    {
        ignores: ['node_modules/**', 'storage/**'],
    },
    {
        files: ['js/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: browserGlobals,
        },
        rules: {
            'no-constant-condition': ['error', { checkLoops: false }],
            'no-duplicate-imports': 'error',
            'no-redeclare': 'error',
            'no-undef': 'error',
            'no-unreachable': 'error',
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        },
    },
    {
        files: ['tests/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...nodeGlobals,
            },
        },
        rules: {
            'no-duplicate-imports': 'error',
            'no-undef': 'error',
            'no-unreachable': 'error',
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        },
    },
];
