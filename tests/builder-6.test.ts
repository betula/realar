import { _value, _selector, _transaction, cycle, _signal } from '../src';

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

test('should work _value with to, to.once', () => {
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
  let t, s;
  const v = _value(5);
  const k = _value(0);

  (t = v.select); s = t((_v) => Math.abs(_v - k.val)).sync(spy);

  expect(s.val).toBe(5);
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
  expect(s.get()).toBe(6);
});

test('should work _value with view', () => {
  const spy = jest.fn();
  let t;
  const v = _value(5);
  const w = ((t = v.view), t((_v) => _v + _v));
  expect(w.val).toBe(10);
  w.val = 16;
  expect(w.val).toBe(32);
  w.val = 5;
  expect(w.val).toBe(10);
  expect(v.val).toBe(5);

  (t = w.sync); t(spy);
  expect(spy).toHaveBeenCalledWith(10, void 0); spy.mockReset();
  expect(w.dirty.val).toBe(false);
  expect(v.dirty.val).toBe(false);
  w(10);
  expect(w.val).toBe(20);

  expect(spy).toHaveBeenCalledWith(20, 10); spy.mockReset();
  expect(w.dirty.val).toBe(true);
  expect(v.dirty.val).toBe(true);
  v(5);
  expect(w.val).toBe(10);

  expect(spy).toHaveBeenCalledWith(10, 20); spy.mockReset();
  expect(w.dirty.val).toBe(false);
  expect(v.dirty.val).toBe(false);
});

test('should work _value with nested view', () => {
  let t;
  const v = _value(5);
  const w = ((t = v.view), t((_v) => _v + _v));
  const k = w.view((_v) => _v + _v);

  expect(k.val).toBe(20);
  k(1);
  expect(k.val).toBe(4);
  expect(w.val).toBe(2);
  expect(v.val).toBe(1);
});

test('should work _value with pre', () => {
  let t;
  const v = _value(5);
  const w = ((t = v.pre), t((_v) => _v + _v));
  const k = w.pre((_v) => _v + 100);

  expect(w.val).toBe(5);
  w(5);
  expect(w.val).toBe(10);
  expect(v.val).toBe(10);
  expect(k.val).toBe(10);
  k.val = 1;
  expect(v.val).toBe(202);
  expect(k.val).toBe(202);
});

test('should work _value with pre.filter, pre.filter.not', () => {
  let t;
  const v = _value(5);
  const f = _value(0);

  const w = v.pre.filter((_v) => _v !== 10);
  const k = ((t = w.pre.filter), (t = t.not), t(f));
  const m = k.pre.filter();
  const n = ((t = k.pre), (t = t.filter.not), t());

  expect(w.val).toBe(5);
  expect(k.val).toBe(5);
  expect(m.val).toBe(5);
  expect(n.val).toBe(5);

  w(10);
  expect(v.val).toBe(5);

  n(0);
  expect(v.val).toBe(0);
  n.val = 1;
  expect(v.val).toBe(0);
  expect(m.dirty.val).toBe(true);
  m(10);
  expect(v.val).toBe(0);
  m(11);
  expect(v.val).toBe(11);
  expect(n.val).toBe(11);
  m(10);
  expect(k.val).toBe(11);
  m(0);
  expect(m.val).toBe(11);
  f(1);
  k(20);
  m(30);
  n(0);
  expect(m.val).toBe(11);
  f(0);
  n(0);
  expect(v.val).toBe(0);
});

test('should work _value with flow', () => {
  let t;
  const v = _value(5);
  const x = _value(1);
  const w = ((t = v.flow), t((_v) => _v + _v));
  const k = w.flow((_v) => _v + 100);
  const p = k.flow((_v, _v_prev) => _v * 100 + (_v_prev || 0) * 10 + x.val);

  expect(w.val).toBe(10);
  expect(k.val).toBe(110);
  expect(p.val).toBe(11001);

  p.val = 6;
  expect(w.val).toBe(12);
  expect(k.val).toBe(112);
  expect(p.val).toBe(112 * 100 + 110 * 10 + 1);
  x(2);
  expect(p.val).toBe(112 * 100 + 112 * 10 + 2);
});


test('should work _value with .filter, .filter.not', () => {
  let t;
  const v = _value(5);
  const f = _value(0);

  const w = v.filter((_v) => _v !== 10);
  const k = ((t = w.filter), (t = t.not), (t = t(f)));
  const m = k.filter();
  const n = ((t = t.filter.not), t());

  expect(n.dirty).toBeUndefined();
  expect(m.reset).toBeUndefined();
  expect(k.reinit).toBeUndefined();

  expect(w.val).toBe(5);
  expect(k.val).toBe(5);
  expect(m.val).toBe(5);
  expect(n.val).toBe(void 0);

  m(0);
  expect(w.val).toBe(0);
  expect(k.val).toBe(0);
  expect(m.val).toBe(5);
  expect(n.val).toBe(0);

  f(1);
  w(8);
  expect(v.val).toBe(8);
  expect(w.val).toBe(8);
  expect(k.val).toBe(0);
  expect(m.val).toBe(5);

  f();
  expect(k.val).toBe(8);
  expect(m.val).toBe(8);

  n(10);
  expect(v.val).toBe(10);
  expect(w.val).toBe(8);

  v(11);
  expect(w.val).toBe(11);
});

test('should work _value with readable flow', () => {
  const v = _value("Hi");
  const f = v.select((_v) => _v[1]).flow((v) => v + v);

  expect(typeof f).toBe("object");
  expect(f.set).toBeUndefined();
  expect(f.update).toBeUndefined();
  expect(f.reset).toBeUndefined();
  expect(f.reinit).toBeUndefined();
  expect(f.dirty).toBeUndefined();
  expect(f.get()).toBe('ii');
  expect(f.val).toBe('ii');
  v("/+");
  expect(f.val).toBe('++');
});

test('should work _value with promise for value, select, view, pre, flow, readable flow', async () => {
  const v = _value(0);
  const s = v.select(t => t + 1);
  const w = v.view(t => t + 2);
  const p = v.pre(t => t - 1);
  const f = v.flow(t => t + 5);
  const r = s.flow(t => t + 3);

  expect(v.promise).toBe(v.promise);
  expect(v.promise).not.toBe(s.promise);
  expect(s.promise).toBe(s.promise);
  expect(v.promise).not.toBe(w.promise);
  expect(w.promise).toBe(w.promise);
  expect(v.promise).not.toBe(p.promise);
  expect(p.promise).toBe(p.promise);
  expect(v.promise).not.toBe(f.promise);
  expect(f.promise).toBe(f.promise);
  expect(v.promise).not.toBe(r.promise);
  expect(r.promise).toBe(r.promise);

  const v_p = v.promise;

  setTimeout(() => v.update((k) => k + 10), 3);
  const a1 = await Promise.all([
    v.promise,
    s.promise,
    w.promise,
    p.promise,
    f.promise,
    r.promise
  ]);
  expect(a1).toStrictEqual([
    10,
    11,
    12,
    10,
    15,
    14
  ]);

  expect(v_p).not.toBe(v.promise);
  expect(v.promise).toBe(v.promise);

  setTimeout(() => v.update((k) => k + 10), 3);
  const a2 = await Promise.all([
    v.promise,
    s.promise,
    w.promise,
    p.promise,
    f.promise,
    r.promise
  ]);
  expect(a2).toStrictEqual([
    20,
    21,
    22,
    20,
    25,
    24
  ]);
});

test('should work _value.trigger common support and promise', async () => {
  let t;
  const v = _value.trigger(0);

  let promise = v.promise;
  expect(v.promise).toBe(promise);

  setTimeout(v.bind(0, 1));
  expect(await v.promise).toBe(1);
  expect(v.promise).toBe(promise);
  expect(v.val).toBe(1);

  v.val = 2;
  expect(v.promise).toBe(promise);
  expect(v.val).toBe(1);

  v.reset();
  expect(v.promise).not.toBe(promise);
  promise = v.promise;
  expect(v.val).toBe(0);
  setTimeout(v.bind(0, 5));
  expect(await v.promise).toBe(5);
  expect(v.val).toBe(5);

  v(7);
  expect(v.promise).toBe(promise);
  expect(v.val).toBe(5);

  v.reinit(10);
  expect(v.get()).toBe(10);
  expect(v.promise).not.toBe(promise);
  promise = v.promise;
  v.update(v => v + 5);
  expect(((t = v.get), t())).toBe(15);
  expect(v.promise).toBe(promise);
});

test('should work _value.trigger with select, update.by, flow, pre, view', () => {
  const p = _value('');
  const v = _value.trigger('e');
  const t = v.pre((k) => 'h' + k).view((k) => k + 'lo').update.by(p);
  const s = t.select((v) => v.slice(0, 3));
  const f = t.flow((v) => v.slice(-3) + p.val);

  expect(s.val).toBe('elo');
  expect(f.val).toBe('elo');
  p.update(() => 'el');
  expect(t.val).toBe('hello');
  expect(s.val).toBe('hel');
  expect(f.val).toBe('lloel');
  p('x');
  expect(t.val).toBe('hello');
  expect(s.val).toBe('hel');
  expect(f.val).toBe('llox');

  t.reset();
  expect(s.val).toBe('elo');
  expect(f.val).toBe('elox');
});

test('should work _value.trigger.flag and .trigger.flag.invert', () => {
  const f = _value.trigger.flag();
  const i = _value.trigger.flag.invert();

  expect(f.val).toBe(false);
  expect(i.val).toBe(true);
  f(); i();
  expect(f.val).toBe(true);
  expect(i.val).toBe(false);
  f(); i();
  expect(f.val).toBe(true);
  expect(i.val).toBe(false);
  f.reset(); i.reset();
  expect(f.val).toBe(false);
  expect(i.val).toBe(true);
  f(); i();
  expect(f.val).toBe(true);
  expect(i.val).toBe(false);
});

test('should work _selector basic support', () => {
  let t;
  const spy = jest.fn();
  const a = _value(0);
  const b = _value(1);
  const s = _selector(() => a.val * 100 + b.val);

  expect(typeof s).toBe('object');
  expect(s.to).not.toBeUndefined();
  expect(s.to.once).not.toBeUndefined();
  expect(s.flow).not.toBeUndefined();
  expect(s.filter).not.toBeUndefined();
  expect(s.filter.not).not.toBeUndefined();
  expect(s.view).not.toBeUndefined();
  expect(s.promise).not.toBeUndefined();

  expect(s.set).toBeUndefined();
  expect(s.update).toBeUndefined();
  expect(s.pre).toBeUndefined();
  expect(s.reset).toBeUndefined();
  expect(s.reinit).toBeUndefined();
  expect(s.dirty).toBeUndefined();

  expect(s.get()).toBe(s.val);
  expect(s.val).toBe(1);

  (t = s.sync), t(spy);
  expect(spy).toBeCalledWith(1, void 0); spy.mockReset();

  a.val = 1;
  expect(spy).toBeCalledWith(101, 1); spy.mockReset();
  b.val = 2;
  expect(spy).toBeCalledWith(102, 101); spy.mockReset();

  _transaction(() => {
    a.val = 0;
    b.val = 102;
  });
  expect(spy).toBeCalledTimes(0);
  expect(a.val).toBe(0);
  expect(b.val).toBe(102);
});

test('should work _selector with to, filter, view', () => {
  let t;
  const spy = jest.fn();
  const b = _value(1);
  const v = _value(0);
  const s = _selector(() => v.val + 1);
  const f = s.filter.not(b);
  const w = s.view((v) => v + 5);

  (t = s.to), t(spy);
  expect(spy).toBeCalledTimes(0);

  v(1);
  expect(spy).toBeCalledWith(2, 1); spy.mockReset();
  expect(s.val).toBe(2);
  expect(f.val).toBe(void 0);
  expect(w.val).toBe(7);
  v(2);
  expect(spy).toBeCalledWith(3, 2); spy.mockReset();
  expect(s.val).toBe(3);
  expect(f.val).toBe(void 0);
  expect(w.val).toBe(8);
  b(0);
  expect(f.val).toBe(3);
});

test('should work _value.from with one argument', () => {
  let t;
  const spy = jest.fn();
  const a = _value(0);
  const v = _value.from(() => a.val + 1);
  expect(v.val).toBe(1);
  (t = v.to), t(spy);

  a.val = 1;
  expect(v.val).toBe(2);
  expect(spy).toBeCalledWith(2, 1);

  expect(typeof v).toBe('object');
  expect(v.to.once).not.toBeUndefined();
  expect(v.flow).not.toBeUndefined();
  expect(v.filter).not.toBeUndefined();
  expect(v.filter.not).not.toBeUndefined();
  expect(v.view).not.toBeUndefined();
  expect(v.promise).not.toBeUndefined();

  expect(v.set).toBeUndefined();
  expect(v.update).toBeUndefined();
  expect(v.pre).toBeUndefined();
  expect(v.reset).toBeUndefined();
  expect(v.reinit).toBeUndefined();
  expect(v.dirty).toBeUndefined();
});

test('should work _value.from with two arguments', () => {
  let t;
  const spy = jest.fn();
  const u = _value(0);
  const a = _value(0);
  const v = _value.from(() => a.val + 1, (v) => a(v + v));
  expect(v.val).toBe(1);
  (t = v.to), (t = t(spy));
  (t = t.update), (t = t.by), t(() => u.val);

  a.val = 1;
  expect(v.val).toBe(2);
  expect(spy).toBeCalledWith(2, 1); spy.mockReset();

  expect(typeof v).toBe('function');
  expect(v.sync).not.toBeUndefined();
  expect(v.to.once).not.toBeUndefined();
  expect(v.flow).not.toBeUndefined();
  expect(v.filter).not.toBeUndefined();
  expect(v.filter.not).not.toBeUndefined();
  expect(v.view).not.toBeUndefined();
  expect(v.set).not.toBeUndefined();
  expect(v.update).not.toBeUndefined();
  expect(v.update.by).not.toBeUndefined();
  expect(v.pre).not.toBeUndefined();
  expect(v.pre.filter).not.toBeUndefined();
  expect(v.pre.filter.not).not.toBeUndefined();
  expect(v.promise).not.toBeUndefined();

  expect(v.reset).toBeUndefined();
  expect(v.reinit).toBeUndefined();
  expect(v.dirty).toBeUndefined();

  u(1);
  expect(v.val).toBe(3);
  expect(spy).toBeCalledWith(3, 2); spy.mockReset();
});

test('should work _value.select.multiple', () => {
  let t;
  const k = _value(0);
  const v = _value(1);
  (t = v.select.multiple), t = t({
    a: (_v) => _v + 1,
    b: (_v) => _v + k.val,
  });
  const { a, b } = t;
  const [ a1, b1 ] = v.select.multiple([
    (_v) => _v + 1,
    (_v) => _v + k.val
  ]);

  expect(a.val).toBe(2);
  expect(b.val).toBe(1);
  expect(a1.val).toBe(2);
  expect(b1.val).toBe(1);
  v(2);
  expect(a.val).toBe(3);
  expect(b.val).toBe(2);
  expect(a1.val).toBe(3);
  expect(b1.val).toBe(2);
  k(2);
  expect(a.val).toBe(3);
  expect(b.val).toBe(4);
  expect(a1.val).toBe(3);
  expect(b1.val).toBe(4);

  [a,b,a1,b1].forEach((v) => {
    expect(typeof v).toBe('object');
    expect(v.sync).not.toBeUndefined();
    expect(v.to).not.toBeUndefined();
    expect(v.to.once).not.toBeUndefined();
    expect(v.flow).not.toBeUndefined();
    expect(v.filter).not.toBeUndefined();
    expect(v.filter.not).not.toBeUndefined();
    expect(v.view).not.toBeUndefined();
    expect(v.promise).not.toBeUndefined();

    expect(v.set).toBeUndefined();
    expect(v.update).toBeUndefined();
    expect(v.pre).toBeUndefined();
    expect(v.reset).toBeUndefined();
    expect(v.reinit).toBeUndefined();
    expect(v.dirty).toBeUndefined();
  });
});

test('should work track-untrack for _value with select', () => {
  const a = _value(0);

  const v = _value(0);
  const p = v.select((_v) => _v + a.val);
  const t = v.select.track((_v) => _v + a.val);
  const u = v.select.untrack((_v) => _v + a.val)

  expect(p.val).toBe(0);
  expect(t.val).toBe(0);
  expect(u.val).toBe(0);
  v(1);
  expect(p.val).toBe(1);
  expect(t.val).toBe(1);
  expect(u.val).toBe(1);
  a(1);
  expect(p.val).toBe(2);
  expect(t.val).toBe(2);
  expect(u.val).toBe(1);
});

test('should work track-untrack for _value with select.multiple', () => {
  const a = _value(0);

  const v = _value(0);
  const p = v.select.multiple({ p: (_v) => _v + a.val }).p;
  const t = v.select.multiple.track({t: (_v) => _v + a.val }).t;
  const u = v.select.multiple.untrack({u: (_v) => _v + a.val }).u;

  expect(p.val).toBe(0);
  expect(t.val).toBe(0);
  expect(u.val).toBe(0);
  v(1);
  expect(p.val).toBe(1);
  expect(t.val).toBe(1);
  expect(u.val).toBe(1);
  a(1);
  expect(p.val).toBe(2);
  expect(t.val).toBe(2);
  expect(u.val).toBe(1);
});

test('should work track-untrack for _value with flow', () => {
  const a = _value(0);

  const v = _value(0);
  const p = v.flow((_v) => _v + a.val);
  const t = v.flow.track((_v) => _v + a.val);
  const u = v.flow.untrack((_v) => _v + a.val)

  expect(p.val).toBe(0);
  expect(t.val).toBe(0);
  expect(u.val).toBe(0);
  v(1);
  expect(p.val).toBe(1);
  expect(t.val).toBe(1);
  expect(u.val).toBe(1);
  a(1);
  expect(p.val).toBe(2);
  expect(t.val).toBe(2);
  expect(u.val).toBe(1);
});

test('should work track-untrack for _value with filter', () => {
  const a = _value(1);

  const v = _value(0);
  const p = v.filter(a);
  const t = v.filter.track(a);
  const u = v.filter.untrack(a);

  expect(p.val).toBe(0);
  expect(t.val).toBe(0);
  expect(u.val).toBe(0);
  a(0);
  v(1);
  expect(p.val).toBe(0);
  expect(t.val).toBe(0);
  expect(u.val).toBe(0);
  a(1);
  expect(p.val).toBe(1);
  expect(t.val).toBe(1);
  expect(u.val).toBe(0);
  v(2);
  expect(p.val).toBe(2);
  expect(t.val).toBe(2);
  expect(u.val).toBe(2);
});

test('should work track-untrack for _value with filter.not', () => {
  const a = _value(0);

  const v = _value(0);
  const p = v.filter.not(a);
  const t = v.filter.not.track(a);
  const u = v.filter.not.untrack(a);

  expect(p.val).toBe(0);
  expect(t.val).toBe(0);
  expect(u.val).toBe(0);
  a(1);
  v(1);
  expect(p.val).toBe(0);
  expect(t.val).toBe(0);
  expect(u.val).toBe(0);
  a(0);
  expect(p.val).toBe(1);
  expect(t.val).toBe(1);
  expect(u.val).toBe(0);
  v(2);
  expect(p.val).toBe(2);
  expect(t.val).toBe(2);
  expect(u.val).toBe(2);
});

test('should work track-untrack for _value with view', () => {
  let t;
  const f = _value(0);
  const v = _value(0);

  const a = v.view((_v) => _v + f.val);
  const b = ((t = v.view.track), t((_v) => _v + f.val));
  const c = ((t = v.view.untrack), t((_v) => _v + f.val));

  const spy_a = jest.fn();
  const spy_b = jest.fn();
  const spy_c = jest.fn();

  cycle(() => spy_a(a.val));
  cycle(() => spy_b(b.val));
  cycle(() => spy_c(c.val));

  expect(spy_a).toBeCalledTimes(1);
  expect(spy_b).toBeCalledTimes(1);
  expect(spy_c).toBeCalledTimes(1);

  f.val = 1;
  expect(spy_a).toBeCalledTimes(2);
  expect(spy_b).toBeCalledTimes(2);
  expect(spy_c).toBeCalledTimes(1);

  v(1);
  expect(spy_a).toBeCalledTimes(3);
  expect(spy_b).toBeCalledTimes(3);
  expect(spy_c).toBeCalledTimes(2);
});

test('should work track-untrack for _value with pre', () => {
  let t;
  const f = _value(0);
  const v = _value(0);

  const a = v.pre((_v) => _v + f.val);
  const b = ((t = v.pre.track), t((_v) => _v + f.val));
  const c = ((t = v.pre.untrack), t((_v) => _v + f.val));

  const spy_a = jest.fn();
  const spy_b = jest.fn();
  const spy_c = jest.fn();

  cycle(() => spy_a(a(1)));
  cycle(() => spy_b(b(1)));
  cycle(() => spy_c(c(1)));

  expect(spy_a).toBeCalledTimes(1);
  expect(spy_b).toBeCalledTimes(1);
  expect(spy_c).toBeCalledTimes(1);

  f.val = 1;
  expect(spy_a).toBeCalledTimes(2);
  expect(spy_b).toBeCalledTimes(2);
  expect(spy_c).toBeCalledTimes(1);

  v(1);
  expect(spy_a).toBeCalledTimes(2);
  expect(spy_b).toBeCalledTimes(2);
  expect(spy_c).toBeCalledTimes(1);
});

test('should work track-untrack for _value with pre.filter', () => {
  let t;
  const f = _value(0);
  const v = _value(0);

  const a = v.pre.filter(f);
  const b = ((t = v.pre.filter.track), t(f));
  const c = ((t = v.pre.filter.untrack), t(f));

  const spy_a = jest.fn();
  const spy_b = jest.fn();
  const spy_c = jest.fn();

  cycle(() => spy_a(a(1)));
  cycle(() => spy_b(b(1)));
  cycle(() => spy_c(c(1)));

  expect(spy_a).toBeCalledTimes(1);
  expect(spy_b).toBeCalledTimes(1);
  expect(spy_c).toBeCalledTimes(1);

  f.val = 1;
  expect(spy_a).toBeCalledTimes(2);
  expect(spy_b).toBeCalledTimes(2);
  expect(spy_c).toBeCalledTimes(1);
});

test('should work track-untrack for _value with pre.filter.not', () => {
  let t;
  const f = _value(0);
  const v = _value(0);

  const a = v.pre.filter.not(f);
  const b = ((t = v.pre.filter.not.track), t(f));
  const c = ((t = v.pre.filter.not.untrack), t(f));

  const spy_a = jest.fn();
  const spy_b = jest.fn();
  const spy_c = jest.fn();

  cycle(() => spy_a(a(1)));
  cycle(() => spy_b(b(1)));
  cycle(() => spy_c(c(1)));

  expect(spy_a).toBeCalledTimes(1);
  expect(spy_b).toBeCalledTimes(1);
  expect(spy_c).toBeCalledTimes(1);

  f.val = 1;
  expect(spy_a).toBeCalledTimes(2);
  expect(spy_b).toBeCalledTimes(2);
  expect(spy_c).toBeCalledTimes(1);
});

test('should work track-untrack for _value with update', () => {
  let t;
  const f = _value(0);

  const a = _value(0);
  const b = _value(0);
  const c = _value(0);

  const spy_a = jest.fn();
  const spy_b = jest.fn();
  const spy_c = jest.fn();

  cycle(() => spy_a(((t = a.update), t(v => v + f.val))));
  cycle(() => spy_b(((t = b.update.track), t(v => v + f.val))));
  cycle(() => spy_c(((t = c.update.untrack), t(v => v + f.val))));

  expect(spy_a).toBeCalledTimes(1);
  expect(spy_b).toBeCalledTimes(1);
  expect(spy_c).toBeCalledTimes(1);

  f.val = 1;
  expect(spy_a).toBeCalledTimes(1);
  expect(spy_b).toBeCalledTimes(2);
  expect(spy_c).toBeCalledTimes(1);
});

test('should work _signal basic support', () => {
  let t, z;
  const spy = jest.fn();
  const v = _signal(0);

  (t = v.sync), (t = t(spy));
  expect(spy).toBeCalledWith(0, void 0); spy.mockReset();

  (z = t.update), z(_v => _v);
  expect(spy).toBeCalledWith(0, 0); spy.mockReset();
  (z = t.set), z(0);
  expect(spy).toBeCalledWith(0, 0); spy.mockReset();
  expect(t.val).toBe(0);
  (z = t.get);
  expect(z()).toBe(0);
  (z = t.dirty), (z = z.get);
  expect(z()).toBe(false);

  const u = ((z = _signal().view), (z = z(_u => _u + 1).pre), (z = z(_u => _u * 10).flow), (z = z(_u => _u * 2)));
  (t = t.update), (t = t.by), (t = t(u));
  u(1);
  expect(t.val).toBe(22);
  expect(t.get()).toBe(22);
  expect(spy).toBeCalledWith(22, 0); spy.mockReset();
  u(1);
  expect(spy).toBeCalledWith(22, 22); spy.mockReset();

  expect(v.dirty.val).toBe(true);
  (z = t.reset), z();
  expect(v.val).toBe(0);
  expect(v.dirty.val).toBe(false);
  expect(spy).toBeCalledWith(0, 22); spy.mockReset();

  v.reset();
  expect(spy).toBeCalledWith(0, 0); spy.mockReset();
  (z = t.reinit), z(5);
  expect(spy).toBeCalledWith(5, 0); spy.mockReset();
  expect(v.dirty.val).toBe(false);

  u(0);
  expect(spy).toBeCalledWith(2, 5); spy.mockReset();
  expect(v.dirty.val).toBe(true);
});

test('should work track-untrack for _signal with flow', () => {
  const spy_p = jest.fn();
  const spy_t = jest.fn();
  const spy_u = jest.fn();
  const a = _signal(0);

  const v = _signal(0);
  v.flow((_v) => _v + a.val).to(spy_p);
  v.flow.track((_v) => _v + a.val).to(spy_t);
  v.flow.untrack((_v) => _v + a.val).to(spy_u);

  v(0);
  expect(spy_p).toBeCalledWith(0, 0); spy_p.mockReset();
  expect(spy_t).toBeCalledWith(0, 0); spy_t.mockReset();
  expect(spy_u).toBeCalledWith(0, 0); spy_u.mockReset();
  a(0);
  expect(spy_p).toBeCalledTimes(0);
  expect(spy_t).toBeCalledWith(0, 0); spy_t.mockReset();
  expect(spy_u).toBeCalledTimes(0);
});

test('should work track-untrack for _signal with filter', () => {
  const spy_p = jest.fn();
  const spy_t = jest.fn();
  const spy_u = jest.fn();
  const a = _signal(1);

  const v = _signal(0);
  v.filter(a).to(spy_p);
  v.filter.track(a).to(spy_t);
  v.filter.untrack(a).to(spy_u);

  v(0);
  expect(spy_p).toBeCalledWith(0, 0); spy_p.mockReset();
  expect(spy_t).toBeCalledWith(0, 0); spy_t.mockReset();
  expect(spy_u).toBeCalledWith(0, 0); spy_u.mockReset();
  a(1);
  expect(spy_p).toBeCalledTimes(0);
  expect(spy_t).toBeCalledWith(0, 0); spy_t.mockReset();
  expect(spy_u).toBeCalledTimes(0);
});

test('should work track-untrack for _signal with filter.not', () => {
  const spy_p = jest.fn();
  const spy_t = jest.fn();
  const spy_u = jest.fn();
  const a = _signal(0);

  const v = _signal(0);
  v.filter.not(a).to(spy_p);
  v.filter.not.track(a).to(spy_t);
  v.filter.not.untrack(a).to(spy_u);

  v(0);
  expect(spy_p).toBeCalledWith(0, 0); spy_p.mockReset();
  expect(spy_t).toBeCalledWith(0, 0); spy_t.mockReset();
  expect(spy_u).toBeCalledWith(0, 0); spy_u.mockReset();
  a(0);
  expect(spy_p).toBeCalledTimes(0);
  expect(spy_t).toBeCalledWith(0, 0); spy_t.mockReset();
  expect(spy_u).toBeCalledTimes(0);
});

test('should work _signal.from with one argument', () => {
  let t;
  const spy = jest.fn();
  const a = _signal(0);
  const v = _signal.from(() => a.val + 1);
  expect(v.val).toBe(1);
  (t = v.to), t(spy);

  a.val = 0;
  expect(v.val).toBe(1);
  expect(spy).toBeCalledWith(1, 1);

  expect(typeof v).toBe('object');
  expect(v.to.once).not.toBeUndefined();
  expect(v.flow).not.toBeUndefined();
  expect(v.filter).not.toBeUndefined();
  expect(v.filter.not).not.toBeUndefined();
  expect(v.view).not.toBeUndefined();
  expect(v.promise).not.toBeUndefined();

  expect(v.set).toBeUndefined();
  expect(v.update).toBeUndefined();
  expect(v.pre).toBeUndefined();
  expect(v.reset).toBeUndefined();
  expect(v.reinit).toBeUndefined();
  expect(v.dirty).toBeUndefined();
});

test('should work _signal.from with two arguments', () => {
  let t;
  const spy = jest.fn();
  const u = _signal(0);
  const a = _signal(0);
  const v = _signal.from(() => a.val + 1, (v) => a(v + v));
  expect(v.val).toBe(1);
  (t = v.to), (t = t(spy));
  (t = t.update), (t = t.by), t(() => u.val);

  a.val = 0;
  expect(v.val).toBe(1);
  expect(spy).toBeCalledWith(1, 1); spy.mockReset();

  expect(typeof v).toBe('function');
  expect(v.sync).not.toBeUndefined();
  expect(v.to.once).not.toBeUndefined();
  expect(v.flow).not.toBeUndefined();
  expect(v.filter).not.toBeUndefined();
  expect(v.filter.not).not.toBeUndefined();
  expect(v.view).not.toBeUndefined();
  expect(v.set).not.toBeUndefined();
  expect(v.update).not.toBeUndefined();
  expect(v.update.by).not.toBeUndefined();
  expect(v.pre).not.toBeUndefined();
  expect(v.pre.filter).not.toBeUndefined();
  expect(v.pre.filter.not).not.toBeUndefined();
  expect(v.promise).not.toBeUndefined();

  expect(v.reset).toBeUndefined();
  expect(v.reinit).toBeUndefined();
  expect(v.dirty).toBeUndefined();

  u(0);
  expect(v.val).toBe(1);
  expect(spy).toBeCalledWith(1, 1); spy.mockReset();
});

test('should work _signal.trigger', () => {
  const spy_t = jest.fn();
  const spy_f = jest.fn();
  const spy_u = jest.fn();

  const t = _signal.trigger();
  const f = _signal.trigger.flag();
  const u = _signal.trigger.flag.invert();

  t.flow().flow().sync(spy_t)();
  f.flow().flow().sync(spy_f)();
  u.flow().flow().sync(spy_u)();

  expect(spy_t).toHaveBeenNthCalledWith(1, void 0, void 0);
  expect(spy_t).toHaveBeenNthCalledWith(2, void 0, void 0);
  expect(spy_f).toHaveBeenNthCalledWith(1, false, void 0);
  expect(spy_f).toHaveBeenNthCalledWith(2, true, false);
  expect(spy_u).toHaveBeenNthCalledWith(1, true, void 0);
  expect(spy_u).toHaveBeenNthCalledWith(2, false, true);

  t(); f(); u();
  expect(spy_t).toBeCalledTimes(2); spy_t.mockReset();
  expect(spy_f).toBeCalledTimes(2); spy_f.mockReset();
  expect(spy_u).toBeCalledTimes(2); spy_u.mockReset();

  expect(t.dirty.val).toBe(false);
  expect(f.dirty.val).toBe(true);
  expect(u.dirty.val).toBe(true);

  t.reset(); t();
  f.reset(); f();
  u.reset(); u();
  expect(spy_t).toHaveBeenNthCalledWith(1, void 0, void 0);
  expect(spy_t).toHaveBeenNthCalledWith(2, void 0, void 0);
  expect(spy_f).toHaveBeenNthCalledWith(1, false, true);
  expect(spy_f).toHaveBeenNthCalledWith(2, true, false);
  expect(spy_u).toHaveBeenNthCalledWith(1, true, false);
  expect(spy_u).toHaveBeenNthCalledWith(2, false, true);
});

test('should work value.combine', () => {
  const spy_v = jest.fn();
  const spy_w = jest.fn();
  const a = _signal(0);

  _value.combine({
    a: a,
    b: a.flow(_a => _a + 1),
    c: () => a.val
  }).sync(spy_v);
  _value.combine([
    a,
    a.flow(_a => _a + 1),
    () => a.val
  ]).sync(spy_w);

  expect(spy_v).toBeCalledWith({ a: 0, b: 1, c: 0 }, void 0); spy_v.mockReset();
  expect(spy_w).toBeCalledWith([ 0, 1, 0 ], void 0); spy_w.mockReset();
  a(0);
  expect(spy_v).toBeCalledTimes(0);
  expect(spy_w).toBeCalledTimes(0);
  a(1);
  expect(spy_v).toBeCalledWith({ a: 1, b: 2, c: 1 }, { a: 0, b: 1, c: 0 });
  expect(spy_w).toBeCalledWith([ 1, 2, 1 ], [ 0, 1, 0 ]);
});

test('should work _signal.combine', () => {
  const spy_v = jest.fn();
  const spy_w = jest.fn();
  const a = _signal(0);

  _signal.combine({
    a: a,
    b: a.flow(_a => _a + 1),
    c: () => a.val
  }).sync(spy_v);
  _signal.combine([
    a,
    a.flow(_a => _a + 1),
    () => a.val
  ]).sync(spy_w);

  expect(spy_v).toBeCalledWith({ a: 0, b: 1, c: 0 }, void 0); spy_v.mockReset();
  expect(spy_w).toBeCalledWith([ 0, 1, 0 ], void 0); spy_w.mockReset();
  a(0);
  expect(spy_v).toBeCalledWith({ a: 0, b: 1, c: 0 }, { a: 0, b: 1, c: 0 });
  expect(spy_w).toBeCalledWith([ 0, 1, 0 ], [ 0, 1, 0 ]);
  a(1);
  expect(spy_v).toBeCalledWith({ a: 1, b: 2, c: 1 }, { a: 0, b: 1, c: 0 });
  expect(spy_w).toBeCalledWith([ 1, 2, 1 ], [ 0, 1, 0 ]);
});

test('should work value.join', () => {
  const spy = jest.fn();
  const a = _signal(0);
  const z = _value(0);

  z.join([
    a,
    a.flow(_a => _a + 1),
    () => a.val
  ]).sync(spy);

  expect(spy).toBeCalledWith([ 0, 0, 1, 0 ], void 0); spy.mockReset();
  a(0);
  expect(spy).toBeCalledTimes(0);
  a(1);
  expect(spy).toBeCalledWith([ 0, 1, 2, 1 ], [ 0, 0, 1, 0 ]); spy.mockReset();
  z(0);
  expect(spy).toBeCalledTimes(0);
  z(1);
  expect(spy).toBeCalledWith([ 1, 1, 2, 1 ], [ 0, 1, 2, 1 ]);
});

test('should work signal.join', () => {
  const spy = jest.fn();
  const a = _signal(0);
  const z = _signal(0);

  z.join([
    a,
    a.flow(_a => _a + 1),
    () => a.val
  ]).sync(spy);

  expect(spy).toBeCalledWith([ 0, 0, 1, 0 ], void 0); spy.mockReset();
  a(0);
  expect(spy).toBeCalledWith([ 0, 0, 1, 0 ], [ 0, 0, 1, 0 ]); spy.mockReset();
  a(1);
  expect(spy).toBeCalledWith([ 0, 1, 2, 1 ], [ 0, 0, 1, 0 ]); spy.mockReset();
  z(0);
  expect(spy).toBeCalledWith([ 0, 1, 2, 1 ], [ 0, 1, 2, 1 ]); spy.mockReset();
  z(1);
  expect(spy).toBeCalledWith([ 1, 1, 2, 1 ], [ 0, 1, 2, 1 ]);
});

test('should work track-untrack for _value with join', () => {
  const spy_p = jest.fn();
  const spy_t = jest.fn();
  const spy_u = jest.fn();
  const a = _signal(0);

  const v = _value(0);
  v.join([a]).sync(spy_p);
  v.join.track([a]).sync(spy_t);
  v.join.untrack([a]).sync(spy_u);

  expect(spy_p).toBeCalledWith([0,0], void 0); spy_p.mockReset();
  expect(spy_t).toBeCalledWith([0,0], void 0); spy_t.mockReset();
  expect(spy_u).toBeCalledWith([0,0], void 0); spy_u.mockReset();
  v(1);
  expect(spy_p).toBeCalledWith([1,0], [0,0]); spy_p.mockReset();
  expect(spy_t).toBeCalledWith([1,0], [0,0]); spy_t.mockReset();
  expect(spy_u).toBeCalledWith([1,0], [0,0]); spy_u.mockReset();
  a(0);
  expect(spy_p).toBeCalledTimes(0);
  expect(spy_t).toBeCalledTimes(0);
  expect(spy_u).toBeCalledTimes(0);
  a(1);
  expect(spy_p).toBeCalledWith([1,1], [1,0]); spy_p.mockReset();
  expect(spy_t).toBeCalledWith([1,1], [1,0]); spy_t.mockReset();
  expect(spy_u).toBeCalledTimes(0);
});

test('should work track-untrack for _signal with join', () => {
  const spy_p = jest.fn();
  const spy_t = jest.fn();
  const spy_u = jest.fn();
  const a = _signal(0);

  const v = _signal(0);
  v.join([a]).sync(spy_p);
  v.join.track([a]).sync(spy_t);
  v.join.untrack([a]).sync(spy_u);

  expect(spy_p).toBeCalledWith([0,0], void 0); spy_p.mockReset();
  expect(spy_t).toBeCalledWith([0,0], void 0); spy_t.mockReset();
  expect(spy_u).toBeCalledWith([0,0], void 0); spy_u.mockReset();
  v(0);
  expect(spy_p).toBeCalledWith([0,0], [0,0]); spy_p.mockReset();
  expect(spy_t).toBeCalledWith([0,0], [0,0]); spy_t.mockReset();
  expect(spy_u).toBeCalledWith([0,0], [0,0]); spy_u.mockReset();
  a(0);
  expect(spy_p).toBeCalledWith([0,0], [0,0]); spy_p.mockReset();
  expect(spy_t).toBeCalledWith([0,0], [0,0]); spy_t.mockReset();
  expect(spy_u).toBeCalledTimes(0);
});

test('should work _signal with as.value', () => {
  const spy_s = jest.fn();
  const spy_v = jest.fn();

  const s = _signal(0).sync(spy_s).op(s => {
    s.as.value().sync(spy_v);
  });

  expect(spy_s).toBeCalledWith(0, void 0); spy_s.mockReset();
  expect(spy_v).toBeCalledWith(0, void 0); spy_v.mockReset();
  s(1);
  expect(spy_s).toBeCalledWith(1, 0); spy_s.mockReset();
  expect(spy_v).toBeCalledWith(1, 0); spy_v.mockReset();
  s(1);
  expect(spy_s).toBeCalledWith(1, 1); spy_s.mockReset();
  expect(spy_v).toBeCalledTimes(0);
});