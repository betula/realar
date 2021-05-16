import { _value } from '../src';

test('should work _value with call, get, set, update, sync', () => {
  const spy = jest.fn();
  let t, r, k;
  const v = _value(0);
  const get = v.get;

  expect(get()).toBe(0);
  t = v.sync; k = t(spy);

  expect(spy).toHaveBeenCalledWith(0, void 0);
  spy.mockReset();

  t = k.update; r = t(v => v + 1);
  expect(get()).toBe(1);
  expect(spy).toHaveBeenCalledWith(1, 0);
  spy.mockReset();
  expect(r).toBeUndefined();

  t = v.set; t(10);
  expect(get()).toBe(10);
  expect(spy).toHaveBeenCalledWith(10, 1);
  spy.mockReset();

  r = v(11);
  expect(r).toBeUndefined();
  expect(get()).toBe(11);
  expect(spy).toHaveBeenNthCalledWith(1, 11, 10);
  v.call(null, 12);
  expect(get()).toBe(12);
  expect(spy).toHaveBeenNthCalledWith(2, 12, 11);
  v.apply(null, [7]);
  expect(get()).toBe(7);
  expect(spy).toHaveBeenNthCalledWith(3, 7, 12);
  spy.mockReset();
});

test('should work _value with reset', () => {
  const spy_value = jest.fn();
  const v = _value(0);
  const k = _value(0);
  const m = _value(0);
  let t;

  v.sync(spy_value);
  expect(spy_value).toHaveBeenCalledWith(0, void 0); spy_value.mockReset();

  (t = v.reset); t();
  expect(spy_value).toBeCalledTimes(0);

  v(5);
  expect(spy_value).toHaveBeenCalledWith(5, 0); spy_value.mockReset();
  expect(v.dirty.val).toBe(true);

  t();
  expect(v.dirty.val).toBe(false);
  expect(spy_value).toHaveBeenCalledWith(0, 5);
  v(10);
  spy_value.mockReset();

  (t = v.reset); (t = t.by); t(k).reset.by(() => m.val);
  k(1);
  expect(spy_value).toHaveBeenCalledWith(0, 10); v(10); spy_value.mockReset();
  m(1);
  expect(spy_value).toHaveBeenCalledWith(0, 10); v(10); spy_value.mockReset();
});

test('should work _value with reinit', () => {
  const spy_value = jest.fn();
  const v = _value(0);
  const k = _value(0);
  const m = _value(0);
  let t;

  v.sync(spy_value);
  expect(spy_value).toHaveBeenCalledWith(0, void 0); spy_value.mockReset();

  (t = v.reinit); t(10);
  expect(spy_value).toHaveBeenCalledWith(10, 0); spy_value.mockReset();
  expect(v.dirty.val).toBe(false);
  expect(v.val).toBe(10);

  v(0);
  expect(spy_value).toHaveBeenCalledWith(0, 10); spy_value.mockReset();
  expect(v.dirty.val).toBe(true);

  (t = v.reset); t();
  expect(v.dirty.val).toBe(false);
  expect(spy_value).toHaveBeenCalledWith(10, 0); spy_value.mockReset();

  (t = v.reinit); (t = t.by); t(k).reinit.by(() => m.val);
  k(1);
  expect(spy_value).toHaveBeenCalledWith(1, 10); spy_value.mockReset();
  expect(v.dirty.val).toBe(false);

  m(5);
  expect(spy_value).toHaveBeenCalledWith(5, 1); spy_value.mockReset();
  expect(v.dirty.val).toBe(false);
});

test('should work _value with dirty', () => {
  const spy = jest.fn();
  const v = _value(0);
  const dirty = v.dirty;

  expect(typeof dirty).toBe('object');
  expect(dirty.update).toBeUndefined();
  expect(dirty.set).toBeUndefined();
  expect(dirty.dirty).toBeUndefined();
  expect(dirty.get).not.toBeUndefined();

  const dirty_sync = dirty.sync;
  dirty_sync(spy);

  expect(spy).toHaveBeenCalledWith(false, void 0); spy.mockReset();
  v(5);
  v(6);
  v(5);
  expect(spy).toHaveBeenCalledWith(true, false);
  expect(spy).toHaveBeenCalledTimes(1); spy.mockReset();
  v(0);
  expect(spy).toHaveBeenCalledWith(false, true); spy.mockReset();
  v(10);
  expect(spy).toHaveBeenCalledWith(true, false); spy.mockReset();
  v.reset();
  expect(spy).toHaveBeenCalledWith(false, true); spy.mockReset();
  v(0);
  v.reset();
  expect(spy).toHaveBeenCalledTimes(0);

  v(10);
  expect(dirty.val).toBe(true);
  v.reinit(10);
  expect(dirty.val).toBe(false);
});

test('should work _value with update.by', () => {
  const v = _value(1);
  const k = _value(0);
  const m = _value(0);
  const p = _value(0);

  v
    .update.by(k, (_v, _k, _k_prev) => _v * 100 + _k * 10 + _k_prev)
    .update.by(() => m.get() + 1, (_v, _m, _m_prev) => _v * 1000 + _m * 10 + _m_prev)
    .update.by(p);
  expect(v.get()).toBe(1);
  k(1);
  expect(v.get()).toBe(110);
  k(2);
  expect(v.get()).toBe(11021);
  m(5);
  expect(v.get()).toBe(11021061);
  p(10);
  expect(v.get()).toBe(10);
});

test('should work _value with val', () => {
  const v = _value(1);
  expect(v.val).toBe(1);
  v.val += 1;
  expect(v.val).toBe(2);
  expect(v.dirty.val).toBe(true);

  expect(() => {
    v.dirty.val = true;
  }).toThrow('Cannot set property val of [object Object] which has only a getter');

  v.reset();
  expect(v.val).toBe(1);
  expect(v.dirty.val).toBe(false);
});

test('should work _value with to', () => {
  const spy_to = jest.fn();
  const spy_to_once = jest.fn();
  const v = _value(0);
  let t;
  (t = v.to); t(spy_to);
  (t = t.once); t(spy_to_once);

  expect(spy_to).toHaveBeenCalledTimes(0);
  expect(spy_to_once).toHaveBeenCalledTimes(0);

  v(0);
  expect(spy_to).toHaveBeenCalledTimes(0);
  expect(spy_to_once).toHaveBeenCalledTimes(0);

  v(1);
  expect(spy_to).toHaveBeenCalledWith(1, 0); spy_to.mockReset();
  expect(spy_to_once).toHaveBeenCalledWith(1, 0); spy_to_once.mockReset();

  v(2);
  expect(spy_to).toHaveBeenCalledWith(2, 1); spy_to.mockReset();
  expect(spy_to_once).toHaveBeenCalledTimes(0);
});

test('should work _value with select', () => {
  const spy = jest.fn();
  let t;
  const v = _value(5);
  const k = _value(0);

  (t = v.select); t((_v) => Math.abs(_v - k.val)).sync(spy);

  expect(spy).toHaveBeenCalledWith(5, void 0);
  expect(spy).toHaveBeenCalledTimes(1); spy.mockReset();
  k(10);
  expect(spy).toHaveBeenCalledTimes(0);
  v(15);
  expect(spy).toHaveBeenCalledTimes(0);
  k(11);
  expect(spy).toHaveBeenCalledWith(4, 5);
  expect(spy).toHaveBeenCalledTimes(1); spy.mockReset();
  v(5);
  expect(spy).toHaveBeenCalledWith(6, 4);
  expect(spy).toHaveBeenCalledTimes(1); spy.mockReset();
});











