import test from "ava";
import {spy} from "sinon";
import create from "../lib/create";

test("creates retryx instance with initial options", async t => {
  const myRetryx = create({
    maxTries: 10,
    waiter:   () => undefined,
  });

  let i = 0;

  const result = await myRetryx(() => {
    i++;

    if (i > 8) {
      return "success";
    } else {
      throw "fail";
    }
  });

  t.is(result, "success");
});

test("retryx instance have same interface as static one", async t => {
  const spy1 = spy();
  const spy2 = spy();

  const myRetryx = create({
    beforeTry: () => spy1(),
    waiter:    () => new Promise(r => setTimeout(r, 10)),
  });

  const result = await myRetryx((arg) => `success: ${arg}`, {
    beforeTry: () => spy2(),
  }, "test");

  t.is(result, "success: test");
  t.true(spy1.notCalled);
  t.true(spy2.calledOnce);
});
