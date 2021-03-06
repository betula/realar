## signal

The `signal` allows you to trigger an event or action and delivers the functionality to subscribe to it anywhere in your application code. Signal has the big part equals with the [value](./api-value.md), but have an important difference - you can call signal with the same state, but value can be updated only to a new state is not equals previous one. _[play on runkit](https://runkit.com/betula/60c467c1cd62c9001b408847)_

```javascript
const add = signal<number>();

const store = value(1)
  .update.by(add, (state, num: number) => state + num)

add(15);
console.log(store.val); // console output: 16

add(15);
console.log(store.val); // console output: 31
```


Most of the signal api such as [value](./api-value.md) api, but exist different methods:

- The stopping signal flow
  - [filter](#filter)
  - [filter.not](#filternot)
- The state flow transformation
  - [map](#map)
  - [map.to](#mapto)
- Casting signal to the value
  - [as.value](#asvalue)
- Static method
  - [signal.from](#signalfrom)

The list of methods similar to the value:

- The state updating
  - [update](#update)
  - [update.by](#updateby)
  - [updater](#updater)
  - [updater.multiple](#updatermultiple)
- The state selectors
  - [select](#select)
  - [select.multiple](#selectmultiple)
- Subscription and syncronization
  - [to](#to)
  - [to.once](#toonce)
  - [sync](#sync)
  - [promise](#promise)
- Actions before updating
  - [pre](#pre)
  - [pre.filter](#prefilter)
  - [pre.filter.not](#prefilternot)
- Shortcut
  - [wrap](#wrap)


### The stopping signal flow

#### filter

The filter function provides the breaking of the signal flow by any reactive expression or reactive container. The filter doesn't collect dependency by reading.

```javascript
const positive = signal<number>()
  .filter(state => state > 0)
  .to(state => console.log(state));

positive(0) // nothing in console because the filter callback returns false
positive(1) // in console: 1
positive(1) // in console: 1
```

```javascript
const enabled = value(false);
const fire = signal()
  .filter(enabled)
  .to(() => console.log('fire'));

fire()        // nothing in console because the filter reactive container has false in the state
enabled(true) // nothing in console because the signal filter doesn't collect dependency by reading
fire()        // in console: fire
```

#### filter.not

Such as [filter](#filter) but with an inverted filter value.

```javascript
const disabled = value(true);
const fire = signal()
  .filter.not(disabled)
  .to(() => console.log('fire'));

fire()          // nothing in console because the filter reactive container has true in the state
disabled(false) // nothing in console because the signal filter doesn't collect dependency by reading
fire()          // in console: fire
```

### The state flow transformation

#### map

The map method making new value with transformed output state signal.

```javascript
const current = signal(0)
const next = current.map(state => state + 1)

next(2)
console.log(next.val) // in console: 3
```

For signals, without an initial state, the map's function will be called only after that state will available

```javascript
const current = signal<number>()
const next = current.map(state => state + 1)

console.log(next.val) // in console: undefined
current(0);
console.log(next.val) // in console: 1
```

The map callback opposite of [value](./api-value.md#map) can't contain a connection to other reactive expressions by reading inside

```javascript
const current = signal(1)
const add = signal(2)

current
  .map(state => state + add.val)
  .to(state => console.log(state))

current(2)  // in console: 4
add(3)      // nothing in console because signal's map no connect to "add" signal value by reading
current(2)  // in console: 5
```

#### map.to

Make the map's transformation to a constant value, have a reason to use only for signals without default state.

```javascript
const inc = signal<number>().map.to(1);

value(0)
  .update.by(inc, (state, num) => state + num)
  .to(state => console.log(state));

inc(); // in console: 1
inc(); // in concole: 2
```

### Casting signal to the value

#### as.value

Represent signal as [value](./api-value.md). The setter will be passed without any transformation, but the signal's getter will be transformed to caching value and reactioning only by the changed state.

```javascript
const v = signal(0);

v.as.value().to(state => console.log(state));

v(0) // nothing in console because the state has no changing
v(1) // in console: 1
```

### The state updating

#### update

Update state of a reactive container using a function with current state passed as the first argument.

```javascript
const v = signal(0)

v.update(state => state + 10)

console.log(v.val) // in console: 10
```

#### update.by

Update state of a reactive container using a signal, or another reactive expression.

```javascript
const add = signal<number>();

const v = signal(0)
  .update.by(add, (state, num) => state + num);

add(10);
console.log(v.val) // in console: 10
```

#### updater

Create a new signal for updating a reactive container.

```javascript
const v = signal(0)

const add = v.updater((state, num: number) => state + num)

add(10);
console.log(v.val) // in console: 10
```

#### updater.multiple

Create multiple new signals for updating a reactive container.

```javascript
const v = signal(0)

const api = v.updater.multiple({
  inc: (state) => state + 1,
  add: (state, num: number) => state + num
});

add(10);
inc();
console.log(v.val) // in console: 11
```

### Selection from state

#### select

Necessary for making high-cost calculations and cache them for many times of accessing without changing source dependencies. And for downgrade (selection from) your hierarchical store. _[play on runkit](https://runkit.com/betula/60c45fefa3dac700199b37d1)_

```javascript
const store = signal({
  city: 'NY'
});

const city = store.select(state => state.city);

// Subscribe to city selector updates
city.to(name => console.log(name));

// We will see reaction on deleveloper console output with new city selector value
store.update(state => ({
  ...state,
  city: 'LA'
}));
```

#### select.multiple

Create multiple selectors from the state of the reactive container.

```javascript
const store = signal({
  city: 'NY',
  user: 'Joe'
});

const { city, user } = store.select.multiple({
  city: state => state.city,
  user: state => state.user
});

// Subscribe to city selector updates
city.to(name => console.log('city', name));
// And to user
user.to(name => console.log('user', name));

// We will see reaction on deleveloper console output with new city and user selector values
store.update(state => ({
  ...state,
  city: 'LA',
  user: 'Mike'
}));
```

### Subscription and syncronization

#### to

Subscribe to change reactive container

```javascript
const v = signal<number>()

v.to((state, prev) => console.log(state, prev));

v(1) // in console: 1 undefined
v(5) // in console: 5 1
v(9) // in console: 9 5
```

#### to.once

Subscribe to change reactive container only once

```javascript
const v = signal(0)

v.to.once((state, prev) => console.log(state, prev));

v(1) // in console: 1 0
v(5) // nothing in console
```

#### sync

Subscribe to change reactive container with initialization call. Useful for "connect" one signal to another. Two directional synchronizations, the same as for the [value sync](./api-value.md#sync), are not possible because the signal must respond to each call the same way for equal values. _[play on runkit](https://runkit.com/betula/60c4608e3f316f0019e8b653)_

```javascript
const a = signal<number>();
const b = signal<number>();

sync(a, b);

a(10);
console.log(b.val) // in console: 10
```

#### promise

The promise for the next state of signal. _[play on runkit](https://runkit.com/betula/60c462fbcd62c9001b4085ee)_

```javascript
const v = signal(0);

v.promise
  .then((state) => console.log(state));

v(10); // in console: 10
```

### Actions before updating

#### pre

You can prepend modification of your reactive container with additional function which will be called before the state modification.

```javascript
const v = signal(0);

const fromstr = v.pre((str: string) => +str);

fromstr('10');
console.log(fromstr.val === 10) // in console: true
```

The most often case for its functionality is the prepending for input events. You can write event object to the reactive container, but store and read the value from element passed through `event.target.value`.

```javascript
const input = signal('Joe')
  .pre((ev: React.ChangeEvent<HTMLInputElement>) => ev.target.value);

const Input = observe(() => (
  <input value={input.val} onChange={input} />
))
```

#### pre.filter

You can check the value before the reactive container modification. If checker returns false state not be updated, if true - passing and update.

```javascript
const enabled = signal(false)

const name = signal('Joe').pre.filter(enabled)
// possible to pass not only the reactive container, but any expression too
// .pre.filter(() => barrier.val)

name('Do') // nothing changing because the "enabled" state is false
console.log(name.val) // in concole: Joe

enabled(true)
name('Mike')
console.log(name.val) // in console: Mike
```

#### pre.filter.not

Such as [pre.filter](#prefilter) but with an inverted filter value.

```javascript
const disabled = signal(false)

const name = signal('Joe')
  .pre.filter.not(disabled)
  .to(state => console.log(state));

name('Do') // in console: Do

disabled(true)
name('Mike') // nothing changing because the "disabled" state is true
```

### Shortcut

#### wrap

This is the shortcut for [pre](#pre) and [map](#map) applied to a signal.

```javascript
const v = signal('');

const v.pre(ev => ev.target.value).map(val => +val || 0)

// And the shortcutted version
const v.wrap(ev => ev.target.value, val => +val || 0)
```

### Static method

#### signal.from

Create new readonly or usual reactive container from one or two reactive expressions

```javascript
const v = signal(1);

signal.from(() => v.val + 1).to(state => console.log(state))
signal.from(v)     // readonly "v"
signal.from(v, v)  // give the same signal as "v"

const p = signal.from(() => v.val, state => (v.val += state));
console.log(p.val)  // in console: 1

p(10)               // in console: 12
console.log(p.val)  // in console: 11
```
