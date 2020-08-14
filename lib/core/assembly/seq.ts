let
  seq_current: i32;

export {
  seq_init,
  seq_next
}

@inline
function seq_init(): void {
  seq_current = 0;
}

@inline
function seq_next(): i32 {
  return (seq_current = seq_current + 1);
}
