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

`main` is a function returns Promise that might be rejected.

`options` is a object contains `maxTries`, `waiter` and other hooks.

`args` will be passed to main function call.

#### `options`

```javascript
{
  maxTries?:       number,       // Attempts main function specified times or until succeeds. default: 5
  waiter?:         HookFunction, // Wait function between each try. default: exponential, 100ms, 400ms, 900ms, 1600ms and so on
  retryCondition?: HookFunction, // Abandon retry if it returns falsy value. default: always true
  beforeTry?:      HookFunction, // Called BEFORE each try.
  afterTry?:       HookFunction, // Called AFTER each try.
  beforeWait?:     HookFunction, // Called BEFORE each wait.
  afterWait?:      HookFunction, // Called AFTER each wait.
  doFinally?:      HookFunction, // Called once whether main function resolved or rejected
}
```

### Examples

TODO: Write some examples

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
