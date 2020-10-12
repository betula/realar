import { unlink_fn } from "./link";

const
  text_effect_func_incorrect = `Only function supported as argument for "effect" function`;

export {
  effect
}

function effect(fn) {
  if (!fn || !(fn instanceof Function)) {
    throw new Error(text_effect_func_incorrect);
  }
  unlink_fn(fn());
}