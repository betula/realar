import { sync, value } from '../../src';

test('should work basic operations with value.from', () => {
  const spy_1 = jest.fn();
  const spy_2 = jest.fn();
  const a = value(7);
  const s = value.from(() => (spy_1(a.val), a.val));

  const {get} = s;

  sync(s, v => spy_2(v));

  expect(spy_1).toHaveBeenNthCalledWith(1, 7);
  expect(spy_2).toHaveBeenNthCalledWith(1, 7);

  expect(get()).toBe(7);
  expect(s.val).toBe(7);
  expect(a.get()).toBe(7);

  a.val++;
  expect(spy_1).toHaveBeenNthCalledWith(2, 8);
  expect(spy_2).toHaveBeenNthCalledWith(2, 8);
});
