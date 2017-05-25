import test from "ava";
import wait from "../lib/wait";

test("wait 100 ms", async t => {
  const startTime = Date.now();

  await wait(100);

  const endTime = Date.now();

  t.true(endTime - startTime > 50);
  t.true(endTime - startTime < 150);
});
