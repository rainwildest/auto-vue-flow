module.exports = {
  // 当前配置为根配置，将不再从上级文件夹查找配置
  root: true,
  /* 指定如何解析语法。可以为空，但若不为空，只能配该值，原因见下文。*/
  parser: "vue-eslint-parser",
  /* 优先级低于parse的语法解析配置 */
  parserOptions: {
    parser: "@typescript-eslint/parser"
  },
  env: {
    browser: true,
    amd: true,
    node: true,
    "vue/setup-compiler-macros": true
  },
  // https://eslint.bootcss.com/docs/user-guide/configuring#specifying-globals
  globals: {
    Nullable: true
  },
  extends: [
    // 扩展使用 vue3 检查规则和eslint推荐规则
    "plugin:vue/vue3-recommended",
    "eslint:recommended",
    // typescript-eslint推荐规则,
    "plugin:@typescript-eslint/recommended",
    // prettier推荐规则,
    "prettier",
    "plugin:prettier/recommended"
  ],
  rules: {
    "no-undef": "off",
    // 优先使用 interface 而不是 type
    "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
    // 禁止any类型,报错关闭
    "@typescript-eslint/no-explicit-any": "off",
    // 需要导出函数和类的公共类方法的显式返回和参数类型,报错关闭
    "@typescript-eslint/explicit-module-boundary-types": "off",
    // 禁止某些类型如String、Number,报错关闭
    "@typescript-eslint/ban-types": "off",
    // 禁止未使用的变量,报错关闭
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-empty-function": "off",
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-var": "warn",
    "prefer-const": "warn", //首选const
    "new-parens": "warn", //new时必须加小括号
    "no-cond-assign": "error", //禁止在条件表达式中使用赋值语句  Bad: if(x = 0) 正确if(x == 0)
    "no-floating-decimal": "error", //禁止省略浮点数中的0 .5 3.
    "init-declarations": "off", //声明时必须赋初值
    "@typescript-eslint/no-var-requires": "off",
    "no-empty": "off",
    eqeqeq: ["error", "always"],
    // 编辑器里会给prettier错误进行报错
    "prettier/prettier": "error",
    "vue/multi-word-component-names": "off"
  }
};
