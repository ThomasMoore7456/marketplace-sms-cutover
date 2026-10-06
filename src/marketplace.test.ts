import test from "node:test";
import assert from "node:assert/strict";
import { handoffSchema } from "./marketplace.js";

test("handoff requests require an order, buyer phone, seller, and asset", () => {
  const parsed = handoffSchema.safeParse({ orderId: "o-1", buyerPhone: "+15551234567", sellerName: "Mina", assetName: "Bike" });
  assert.equal(parsed.success, true);
  assert.equal(handoffSchema.safeParse({ orderId: "", buyerPhone: "123", sellerName: "Mina", assetName: "Bike" }).success, false);
});
