import { z } from "zod";
import { infrai } from "./infrai.js";

export const handoffSchema = z.object({ orderId: z.string().min(1), buyerPhone: z.string().min(7), sellerName: z.string().min(1), assetName: z.string().min(1) });
export type Handoff = z.infer<typeof handoffSchema>;

export async function notifyBuyer(input: Handoff) {
  const order = handoffSchema.parse(input);
  const message = `Order ${order.orderId} is ready for handoff from ${order.sellerName}: ${order.assetName}.`;
  return infrai.sms.send({ to: order.buyerPhone, body: message }, `order-handoff-${order.orderId}`);
}
