import test from "ava";
import retryx from "../lib/retryx";

test("is a function", t => {
  t.is(typeof retryx, "function");
});

test("is a wrapper of Executor", async t => {
  let i = 0;

  const result = await retryx(() => {
    i++;

    if (i > 3) {
      return "success";
    } else {
      throw "fail";
    }
  });

  t.is(result, "success");
});

test("accept args to main function", async t => {
  const result = await retryx((...args: any[]) => Promise.resolve([...args]), undefined, "TEST", 123);
  t.deepEqual(result, ["TEST", 123]);
});

test("usable without async/await", t => {
  let i = 0;

  const main = () => new Promise((resolve, reject) => {
    i++;

    setTimeout(() => {
      if (i > 3) {
        resolve("success");
      } else {
        reject("fail");
      }
    }, 10);
  });

  return retryx(main).then(result => {
    t.is(result, "success");
    t.is(i, 4);
  });
});
