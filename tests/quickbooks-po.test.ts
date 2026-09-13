import assert from "node:assert/strict";
import test from "node:test";
import {
  assertCurrencyRepresentable,
  assertPurchaseOrderMatchesIntent,
  currencyCapabilityError,
  docNumberForEffect,
  parsePurchaseOrderIntentPayload,
  privateNoteForIntent,
  viewFromPurchaseOrder,
  type PurchaseOrderIntent,
  type QuickBooksPurchaseOrder,
} from "../lib/accounting/quickbooks";

const intent: PurchaseOrderIntent = {
  effectKey: "purchase_order:mission-1:express",
  missionKey: "mission-1",
  vendorId: "express",
  vendorName: "Good Things Studio",
  product: "Custom canvas tote",
  requiredQuantity: 25,
  orderQuantity: 30,
  totalCents: 55500,
  currency: "SGD",
  evidenceVersion: 4,
};

test("docNumberForEffect is stable, short, and collision-resistant enough for retries", () => {
  const first = docNumberForEffect(intent.effectKey);
  const second = docNumberForEffect(intent.effectKey);
  assert.equal(first, second);
  assert.ok(first.length <= 21);
  assert.notEqual(
    docNumberForEffect(intent.effectKey),
    docNumberForEffect("purchase_order:mission-2:express"),
  );
});

test("parsePurchaseOrderIntentPayload requires orderQuantity economics", () => {
  const parsed = parsePurchaseOrderIntentPayload(
    JSON.stringify({
      vendorId: "express",
      requiredQuantity: 25,
      orderQuantity: 30,
      totalCents: 55500,
      currency: "SGD",
      evidenceVersion: 4,
    }),
  );
  assert.equal(parsed.orderQuantity, 30);
  assert.equal(parsed.requiredQuantity, 25);
  assert.throws(() =>
    parsePurchaseOrderIntentPayload(JSON.stringify({ vendorId: "express" })),
  );
});

test("read-back requires actual CurrencyRef SGD, not PrivateNote substitution", () => {
  const matching: QuickBooksPurchaseOrder = {
    Id: "147",
    DocNumber: docNumberForEffect(intent.effectKey),
    PrivateNote: privateNoteForIntent(intent),
    TotalAmt: 555,
    CurrencyRef: { value: "SGD" },
    VendorRef: { value: "33", name: "Good Things Studio" },
    Line: [
      {
        Amount: 555,
        DetailType: "ItemBasedExpenseLineDetail",
        ItemBasedExpenseLineDetail: {
          Qty: 30,
          UnitPrice: 18.5,
        },
      },
    ],
  };
  const view = viewFromPurchaseOrder(matching);
  assert.equal(view.orderQuantity, 30);
  assert.equal(view.totalCents, 55500);
  assert.equal(view.currency, "SGD");
  assert.doesNotThrow(() => assertPurchaseOrderMatchesIntent(matching, intent));

  const usdBooked = {
    ...matching,
    CurrencyRef: { value: "USD" },
  };
  assert.throws(
    () => assertPurchaseOrderMatchesIntent(usdBooked, intent),
    /CurrencyRef USD does not match intended SGD/,
  );
});

test("read-back fails when QuickBooks quantity is the required quantity instead of orderQuantity", () => {
  const po: QuickBooksPurchaseOrder = {
    Id: "148",
    DocNumber: docNumberForEffect(intent.effectKey),
    PrivateNote: privateNoteForIntent(intent),
    TotalAmt: 555,
    CurrencyRef: { value: "SGD" },
    VendorRef: { value: "33", name: "Good Things Studio" },
    Line: [
      {
        Amount: 555,
        DetailType: "ItemBasedExpenseLineDetail",
        ItemBasedExpenseLineDetail: { Qty: 25, UnitPrice: 22.2 },
      },
    ],
  };
  assert.throws(
    () => assertPurchaseOrderMatchesIntent(po, intent),
    /orderQuantity/,
  );
});

test("company without SGD representation fails closed before create", () => {
  assert.throws(
    () =>
      assertCurrencyRepresentable("SGD", {
        multiCurrencyEnabled: false,
        homeCurrency: "USD",
        supportedCurrencies: ["USD"],
      }),
    /cannot represent purchase orders in SGD/,
  );
  assert.doesNotThrow(() =>
    assertCurrencyRepresentable("SGD", {
      multiCurrencyEnabled: true,
      homeCurrency: "USD",
      supportedCurrencies: ["USD", "SGD"],
    }),
  );
  assert.match(
    currencyCapabilityError("SGD", {
      multiCurrencyEnabled: false,
      homeCurrency: "USD",
      supportedCurrencies: ["USD"],
    }),
    /Advanced → Currency/,
  );
});
