import { notifyBuyer } from "./marketplace.js";

const buyerPhone = process.env.BUYER_PHONE;
if (!buyerPhone) throw new Error("BUYER_PHONE is required");
const result = await notifyBuyer({ orderId: "order-1042", buyerPhone, sellerName: "North Market", assetName: "Oak desk" });
console.log(`buyer notification sent: ${result.message_id}`);
