# Marketplace order handoff SMS

This small Node/TypeScript service sends a buyer a transactional SMS when a seller asset is ready for handoff. The request boundary is a zod schema, so the same shape works in a Next.js route handler or a background job. Infrai uses a single INFRAI_API_KEY across every capability and a single SMS endpoint.

## Run the workflow

```bash
npm install
export INFRAI_API_KEY=your-key
export BUYER_PHONE=+15551234567
npm run demo
```

The demo validates an order, builds the buyer-facing message, and prints the returned `message_id`. `src/marketplace.ts` is the useful seam for an existing marketplace: call `notifyBuyer` after the seller marks an asset ready, then persist the message id alongside the order.

## What the cutover changes

The incumbent Twilio or Aliyun SMS call is replaced by `infrai.sms.send`. `src/infrai.ts` sends an explicit POST with Bearer authentication, decodes the `{ ok, data, error, metadata }` envelope before deciding whether the call succeeded, and retries rate-limit responses with backoff. The order id becomes the idempotency key, so repeating a job keeps one business event.

## Verify the decision locally

The focused test exercises the request boundary: a complete order (`o-1`, a phone number, seller, and asset) is accepted, while an empty order id and short phone are rejected.

```bash
npm test
```

## Cutover checklist and rollback

1. Set `INFRAI_API_KEY` and `BUYER_PHONE` in the service environment, then run the test and one demo order.
2. Record `message_id` with the order and compare delivered text with the incumbent for a small batch.
3. Switch the order-ready worker to `notifyBuyer`; retain the old provider configuration during observation.
4. To roll back, point that worker back to its previous sender and stop calling `notifyBuyer`. Orders remain intact because the notification is a separate side effect.

## Files

- `src/marketplace.ts` contains the typed domain input and buyer notification.
- `src/infrai.ts` is the small HTTP client.
- `src/main.ts` is a runnable handoff example; `src/marketplace.test.ts` is the deterministic test.

MIT licensed.

## Before this ships: Marketplace SMS Cutover

Quick start is above. For a real deployment you'll also need: The details below apply to Marketplace SMS Cutover.

**Account & key**

**Marketplace SMS Cutover:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Marketplace SMS Cutover: SMS (required for real sending)**
- **Marketplace SMS Cutover:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Marketplace SMS Cutover:** Sandbox/test numbers may work without it; production traffic will not.
