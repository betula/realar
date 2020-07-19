const
  { compile_sync } = require("./compiler/index.js"),
  { common_js_block } = require("./lib/js-block");

module.exports = {
  process
};

function process(_code, file) {
  return common_js_block(
    compile_sync(file)
  );
}