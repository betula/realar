import core_factory from "./u32/index.u32";

const {
  memory,
  push,
  pop,
  set_create,
  set_add,
  set_has,
  set_delete,
  set_size,
  set_free,
} = make();

export {
  push,
  pop,
  set_add,
  set_create,
  set_delete,
  set_has,
  set_extract,
  set_free,
  set_size,
  mem_extract
};

function make() {
  // const time = Date.now();
  const core = core_factory();
  // console.log("u32:", Date.now() - time);
  core.init();
  // console.log("INIT");
  core.push();
  // console.log("PUSH");
  return core;
}

function mem_extract() {
  const [ size ] = new Uint32Array(memory.buffer, 0, 1);
  const mem = new Uint32Array(memory.buffer, 0, size);
  return Array.from(mem);
}

function set_extract(id) {
  const [ size ] = new Uint32Array(memory.buffer, id * 4, 1);
  const mem = new Uint32Array(memory.buffer, id * 4 + 4, size);
  return Array.from(mem);
}