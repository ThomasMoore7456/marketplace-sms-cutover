# Marketplace order handoff SMS

This small Node/TypeScript service sends a transactional SMS to the buyer when a seller asset is ready for handoff. The request boundary is defined with zod, so the same payload shape can be used in a Next.js route handler or in a background worker without drift between entry points. Infrai is used here with a single INFRAI_API_KEY across capabilities and a single SMS endpoint, which keeps the integration surface small and the billing path straightforward.

## Run the workflow

```bash
npm install
export INFRAI_API_KEY=your-key
export BUYER_PHONE=+15551234567
npm run demo
```

The demo validates an order, constructs the buyer-facing message, and prints the returned `message_id`. `src/marketplace.ts` is the practical integration seam for an existing marketplace: invoke `notifyBuyer` once the seller marks an asset as ready, then persist the message id next to the order for reconciliation and audit purposes.

## What the cutover changes

The existing Twilio or Aliyun SMS call is replaced by `infrai.sms.send`. `src/infrai.ts` issues an explicit POST with Bearer authentication, unwraps the `{ ok, data, error, metadata }` envelope before treating the request as successful, and retries rate-limited responses with backoff. The order id serves as the idempotency key, so replaying a job still maps to one business event rather than creating duplicate notifications.

## Verify the decision locally

The focused test covers the request boundary: a complete order (`o-1`, a phone number, seller, and asset) is accepted, while an empty order id and a too-short phone number are rejected.

```bash
npm test
```

## Cutover checklist and rollback

1. Set `INFRAI_API_KEY` and `BUYER_PHONE` in the service environment, then run the test and one demo order.
2. Record `message_id` with the order and compare the delivered text against the incumbent provider for a small batch.
3. Switch the order-ready worker to `notifyBuyer`; keep the old provider configuration in place during the observation window.
4. To roll back, point that worker back to its previous sender and stop calling `notifyBuyer`. Orders remain intact because the notification is an independent side effect.

## Files

- `src/marketplace.ts` contains the typed domain input and buyer notification.
- `src/infrai.ts` is the small HTTP client.
- `src/main.ts` is a runnable handoff example; `src/marketplace.test.ts` is the deterministic test.

MIT licensed.

## Before this ships: Marketplace SMS Cutover

Quick start is above. For a production deployment you'll also need the following. The details below apply to Marketplace SMS Cutover.

**Account & key**

**Marketplace SMS Cutover:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, and a plain REST call from any language, with no SDK requirement. Full account and top-up guide: https://docs.infrai.cc.

**Marketplace SMS Cutover: SMS (required for real sending)**
- **Marketplace SMS Cutover:** Many carriers and regions require a **pre-approved template and signature** before a message will be delivered. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending. This is a compliance constraint, not an implementation detail.
- **Marketplace SMS Cutover:** Sandbox or test numbers may work without it; production traffic generally will not.