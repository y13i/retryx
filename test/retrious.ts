import test from "ava";
import retryx from "../lib/retryx";

test("`retryx` is a function", t => {
  t.is(typeof retryx, "function");
});
