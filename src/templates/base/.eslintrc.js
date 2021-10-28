module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "airbnb",
  ],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
    JSX: "readonly",
  },
  // TODO enable typechecking on tests
  ignorePatterns: ["src/**/*.test.tsx"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      tsx: true,
    },
    ecmaVersion: 2020,
    sourceType: "module",
  },
  plugins: ["react", "react-hooks"],
  rules: {
    "react/destructuring-assignment": 1,
    "import/no-anonymous-default-export": 0,
    "@typescript-eslint/ban-types": 1, // StyledComponentBase<any, {}> failed every time
    "@typescript-eslint/no-empty-function": 0,
    "@typescript-eslint/no-shadow": 2,
    "no-shadow": 0,
    "no-unused-vars": 1,
    "arrow-body-style": 0,
    "arrow-parens": 0,
    "object-shorthand": 1,
    "comma-dangle": 1,
    "comma-spacing": 1,
    "consistent-return": 0,
    "function-paren-newline": 0,
    "implicit-arrow-linebreak": 0,
    "import/extensions": 1,
    "import/no-extraneous-dependencies": 1,
    "import/no-unresolved": 1,
    "import/prefer-default-export": 1,
    "jsx-a11y/label-has-associated-control": 0,
    "linebreak-style": 0,
    "max-len": 0,
    "no-case-declarations": 0,
    "no-confusing-arrow": 0,
    "no-empty-function": 1,
    "no-multi-spaces": 0,
    "no-plusplus": 0,
    "no-param-reassign": 0,
    "object-curly-newline": 0,
    "operator-linebreak": 0,
    "padded-blocks": 1,
    "react-hooks/exhaustive-deps": 1,
    "react-hooks/rules-of-hooks": 1,
    "react/require-default-props": 1,
    "react/jsx-curly-newline": 0,
    "react/jsx-filename-extension": 0, // didn't like jsx in tsx lol
    "react/jsx-indent": 0,
    "react/jsx-no-bind": 0,
    "react/jsx-one-expression-per-line": 0,
    "react/jsx-props-no-spreading": 0,
    "react/jsx-tag-spacing": 1,
    "react/jsx-wrap-multilines": 0,
    "react/no-array-index-key": 1,
    "react/no-unescaped-entities": 0,
    "react/prop-types": 1,
    "react/jsx-uses-react": 0,
    "react/react-in-jsx-scope": 0,
    "@typescript-eslint/ban-ts-comment": 0,
    indent: 0,
    quotes: 1,
  },
};
