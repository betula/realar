
**box**

The first abstraction of Realar is reactive container - `box`.
The `box` is a place where your store some data as an immutable struct.
When you change box value (rewrite to a new immutable struct) all who depend on It will be updated synchronously.

For create new box we need `box` function from `realar`, and initial value that will store in reactive container.
The call of `box` function returns array of two functions.
- The first is value getter.
- The second one is necessary for save new value to reactive container.

```javascript
const [get, set] = box(0);

set(get() + 1);
console.log(get()); // 1
```

**on**