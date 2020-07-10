#! /usr/bin/env node
const
  build_module_buff = require('../compiler').build_module_buff;

main();

async function main() {
  const wasm_buff = await build_module_buff();
  const memory = new WebAssembly.Memory({ initial: 1 });

  const log_i32 = (...args) => console.log(...args);

  const wasm_module = await WebAssembly.compile(wasm_buff);
  const wasm_instance = new WebAssembly.Instance(wasm_module, {
    env: {
      memory,
      log_i32
    }
  });

  const {
    set_create,
    set_add,
    set_has,
    set_delete,
    set_free,
    set_size,
    seq_id_init
  } = wasm_instance.exports;

  function set_extract(id) {
    const [ len ] = new Uint32Array(memory.buffer, id, 1);
    const values = new Uint32Array(memory.buffer, id + 4, len);
    console.log("EXTRACT:", id, len, [...values], set_size(id));
  }

  seq_id_init();

  function make() {
    const id = set_create();
    console.log("SET CREATE", id);

    set_add(id, 10);
    set_add(id, 15);
    set_add(id, 10);
    set_add(id, 0);
    set_add(id, 2);
    set_extract(id);

    console.log("HAS:", 10, set_has(id, 10));
    console.log("HAS:", 15, set_has(id, 15));
    console.log("HAS:", 0, set_has(id, 0));
    console.log("HAS:", 2, set_has(id, 2));
    console.log("HAS:", 5, set_has(id, 5));

    console.log("DELETE:", 10, set_delete(id, 10));
    set_extract(id);
    console.log("DELETE:", 2, set_delete(id, 2));
    set_extract(id);
    console.log("DELETE:", 15, set_delete(id, 15));
    set_extract(id);
    console.log("DELETE:", 5, set_delete(id, 5));
    set_extract(id);
    console.log("DELETE:", 0, set_delete(id, 0));
    set_extract(id);

    set_extract(id);
    set_free(id);
  }

  make();
  console.log("---");
  make();
  console.log("---");
  make();
}
