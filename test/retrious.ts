import test from "ava";
import retrious from "../lib";

test("`retrious` is a function", t => {
  t.is(typeof retrious, "function");
});
