# retryx

[![Build Status](https://travis-ci.org/y13i/retryx.svg?branch=master)](https://travis-ci.org/y13i/retryx)
[![Coverage Status](https://coveralls.io/repos/github/y13i/retryx/badge.svg?branch=master)](https://coveralls.io/github/y13i/retryx?branch=master)

## About

`retryx` (__ritrɪ́ks__) is a Promise-based retry workflow library.

## Installation

```
$ npm install --save retryx
```

## Usage

### Flowchart

![retryx flowchart](docs/diagram.png)

### API

#### `retryx`

```javascript
retryx(main, options, ...args)
```

**Required** `main` is a function returns Promise that might be rejected.

**Optional** `options` is a object contains `maxTries`, `waiter` and other hooks.

**Optional** `args` will be passed to main function call.

#### `options`

```javascript
{
  maxTries?:       number,       // Attempts calling main function specified times or until succeeds. default: 5
  waiter?:         HookFunction, // Wait function between each try. default: exponential, 100ms, 400ms, 900ms, 1600ms and so on
  retryCondition?: HookFunction, // Abandon retrying if it returns falsy value. default: always true
  beforeTry?:      HookFunction, // Called BEFORE each try. default: nothing to do
  afterTry?:       HookFunction, // Called AFTER each try. default: nothing to do
  beforeWait?:     HookFunction, // Called BEFORE each wait. default: nothing to do
  afterWait?:      HookFunction, // Called AFTER each wait. default: nothing to do
  doFinally?:      HookFunction, // Called ONCE whether main function resolved or rejected. default: nothing to do
}
```

### Examples

#### With [AWS SDK](https://github.com/aws/aws-sdk-js)

```javascript
const retryx = require("retryx");
const AWS = require("aws-sdk");

const ec2 = new AWS.EC2();

retryx(() => ec2.describeRegions().promise()).then(response => {
  console.log(response);
});
```

#### With [axios](https://github.com/mzabriskie/axios)

```javascript
const retryx = require("retryx");
const axios = require("axios");

retryx(() => axios.get("http://example.com")).then(response => {
  console.log(response.statusText);
});
```

#### With async/await

```javascript
import retryx from "retryx";

(async () => {
  try {
    const result = await retryx(() => {
      const number = Math.round(Math.random() * 100);

      if (number > 95) {
        return number;
      } else {
        throw number;
      }
    });

    console.log("success", result);
  } catch (n) {
    console.log("fail:", n)
  }
})();
```

#### With hooks

```javascript
const retryx = require("retryx");

retryx(() => {
  const number = Math.round(Math.random() * 100);
  return number > 95 ? Promise.resolve(number) : Promise.reject(number);
}, {
  maxTries:   100,
  beforeWait: (tries) => console.log(`try #${tries} failed. wait 100 ms`),
  waiter:     () => new Promise((r) => setTimeout(r, 100)),
}).then(result => {
  console.log(`success: ${result}`);
});
```

#### TypeScript type inference

```typescript
import retryx from "retryx";

(async () => {
  let result = await retryx(() => 123);
  result = "abc"; // ERROR: Type '"abc"' is not assignable to type 'number'.
})();
```

#### TypeScript generics

```typescript
import retryx from "retryx";

(async () => {
  let result = await retryx<string>(() => { // Explicitly specifies type of promised value to return.
    const number = Math.round(Math.random() * 100);

    if (number < 50) {
      throw new Error();
    } else if (number < 80) {
      return "good";
    } else if (number < 90) {
      return "great";
    } else {
      return number; // ERROR: Type 'number' is not assignable to type 'string | Promise<string>'.
    }
  });
})();
```

### See also

- [Test codes](test/)

## Development

```
$ git clone
$ cd retryx
$ yarn
```

Test.

```
$ yarn test
```
