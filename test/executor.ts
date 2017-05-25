import test from "ava";
import {spy} from "sinon";
import Executor from "../lib/executor";
import wait from "../lib/wait";

test("Executor is a class", t => {
  const executor = new Executor(() => Promise.resolve());
  t.true(executor instanceof Executor);
});

test("returns promise", async t => {
  const executor1 = new Executor(() => Promise.resolve("abc"));
  const executor2 = new Executor(() => "def");

  const promise1 = executor1.execute();
  const promise2 = executor2.execute();

  t.true(promise1 instanceof Promise);
  t.is(await promise1, "abc");
  t.true(promise2 instanceof Promise);
  t.is(await promise2, "def");
});

test("retries until succeeds", async t => {
  let i = 0;
  const theSpy = spy();

  const executor = new Executor(() => {
    return new Promise((resolve, reject) => {
      theSpy();
      i++;

      if (i > 3) { // succeeds at 4th trial
        resolve("success");
      } else {
        reject("fail");
      }
    });
  });

  t.is(await executor.execute(), "success");
  t.is(theSpy.callCount, 4);
});

test("accept maxTries value via options", async t => {
  let i = 0;
  const theSpy = spy();

  const executor = new Executor(async () => {
    theSpy();
    i++;

    if (i > 3) {
      return "success";
    } else {
      throw "fail";
    }
  }, {
    maxTries: 2,
  });

  const result = await t.throws(executor.execute());

  t.is(result, "fail");
  t.is(theSpy.callCount, 2);
});

test("tries 5 times by default", async t => {
  const counter = spy();

  const executor = new Executor(() => {
    counter();
    return Promise.reject("impossible");
  });

  await t.throws(executor.execute());

  t.is(counter.callCount, 5);
});

test("accept custom waiter via options", async t => {
  const startAt = Date.now();

  let i = 0;

  const executor = new Executor(() => {
    return new Promise((resolve, reject) => {
      i++;

      if (i > 2) { // succeeds when 3rd trial
        resolve("success");
      } else {
        reject("fail");
      }
    });
  }, {
    waiter: () => wait(1000), // wait 1000 ms per retry.
  });

  await executor.execute();

  const endAt = Date.now();

  t.true(endAt - startAt > 1000);
  t.true(endAt - startAt < 3000);
});

test("accept retryCondition value via options", async t => {
  let i = 0;
  const theSpy = spy();

  const executor = new Executor(async () => {
    theSpy();
    i++;

    if (i > 3) {
      return "success";
    } else if (i === 2) {
      throw "fatal";
    } else {
      throw "fail";
    }
  }, {
    // stop retrying if "fatal"
    retryCondition: (_tries: number, reason: any) => reason !== "fatal",
  });

  const result = await t.throws(executor.execute());

  t.is(result, "fatal");
  t.is(theSpy.callCount, 2);
});

test("accept before/after try/wait hooks via options", async t => {
  const byBeforeTry  = spy();
  const byAfterTry   = spy();
  const byBeforeWait = spy();
  const byAfterWait  = spy();

  let i = 0;

  const executor = new Executor(async () => {
    i++;

    if (i > 2) { // succeeds when 3rd trial
      return "success";
    } else {
      throw "fail";
    }
  }, {
    beforeTry:  () => byBeforeTry(),
    afterTry:   async () => byAfterTry(),
    beforeWait: async () => byBeforeWait(),
    afterWait:  () => byAfterWait(),
  });

  await executor.execute();

  t.is(byBeforeTry.callCount, 3);
  t.is(byAfterTry.callCount, 3);
  t.is(byBeforeWait.callCount, 2);
  t.is(byAfterWait.callCount, 2);
});

test("accept doFinally hook via options", async t => {
  const spy1 = spy();
  const spy2 = spy();
  const executor1 = new Executor(() => Promise.resolve(1), {doFinally: () => spy1()});
  const executor2 = new Executor(() => Promise.reject(2), {doFinally: () => spy2()});
  t.is(await executor1.execute(), 1);
  t.is(await t.throws(executor2.execute()), 2);
  t.true(spy1.calledOnce);
  t.true(spy2.calledOnce);
});

test("accept args to main function", async t => {
  const executor1 = new Executor(arg => Promise.resolve(arg));
  t.is(await executor1.execute("test!"), "test!");
  const executor2 = new Executor((...args: any[]) => Promise.resolve([...args]));
  t.deepEqual(await executor2.execute("TEST", 123), ["TEST", 123]);
});