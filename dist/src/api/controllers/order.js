import * as CouponService from "../services/coupon.js";
import * as OrderService from "../services/order.js";
import * as ProductPriceService from "../services/productPrice.js";
import * as MapUtil from "../utils/map.js";
import { calculateDeliveryCharge } from "../utils/misc.js";
import * as PaymentService from "../services/payment.js";
import { getEmailTemplate, listProductTemplate, } from "../utils/emailTemplate.js";
import { sendMail } from "../utils/mail.js";
export async function getOrder(req, res) {
    const orderId = req.params["orderId"];
    const order = await OrderService.getOrderById(orderId);
    res.json(order);
}
export async function createOrder(req, res) {
    const information = req.body["order"];
    const orderDetailsBeMappingPrice = await Promise.all(information.details.map(async (detail) => {
        const productPrice = await ProductPriceService.getProductPrice(detail.productPriceId);
        const price = Number(productPrice?.price) || 0;
        return { ...detail, price };
    }));
    let amountOfDecreaseMoney = 0;
    if (information.couponCode) {
        const coupon = await CouponService.getCoupon(information.couponCode);
        if (coupon) {
            amountOfDecreaseMoney = CouponService.calculateDecreaseMoneyForOrder(coupon, { ...information, details: orderDetailsBeMappingPrice });
        }
    }
    const branchCoordinate = {
        latitude: "21.0049552335956",
        longitude: "105.8455270153421",
    };
    const receivedAddressCoordinate = req.body["receivedAddressCoordinate"];
    const deliveryDistanceByMeter = await MapUtil.getLengthFromOriginToDestinationGoongIo(branchCoordinate, receivedAddressCoordinate);
    if (deliveryDistanceByMeter < 0) {
        res.status(400).json("Error calculate delivery distance");
        return;
    }
    const deliveryCharge = information.receivedType === "delivery"
        ? calculateDeliveryCharge(deliveryDistanceByMeter)
        : 0;
    const { orderId, totalPrice } = await OrderService.createOrder({
        ...information,
        details: orderDetailsBeMappingPrice,
        deliveryCharge,
    }, amountOfDecreaseMoney);
    if (orderId) {
        if (information.paymentType === "1") {
            const vpnUrl = await PaymentService.createPayment(req, res, orderId, totalPrice);
            res.json({ orderId, vpnUrl });
        }
        else {
            res.json(orderId);
        }
    }
    else {
        res.status(400).json("Error when create order");
    }
}
export async function updatePaymentStatus(req, res) {
    const body = await PaymentService.queryDr(req, res);
    const update = await OrderService.updatePaymentStatusById(body.vnp_TxnRef, body.vnp_ResponseCode);
    const order = await OrderService.getOrderById(body.vnp_TxnRef);
    if (!order)
        return;
    const userEmailAddress = order?.email;
    const mailSubject = `Đơn hàng #${order?.id} đã đặt thành công`;
    let details = "";
    order?.details?.forEach((item) => {
        if (item) {
            details += listProductTemplate(item);
        }
    });
    const mailContent = getEmailTemplate(order, details, order.couponDecrease);
    sendMail(userEmailAddress, mailContent, mailSubject);
    if (update)
        res.json(update);
}
export async function cancelOrder(req, res) {
    const orderId = req.params["orderId"];
    const success = await OrderService.cancelOrderById(orderId);
    if (success) {
        res.json(`Cancel order #${orderId} success`);
    }
    else {
        res.status(400).json(`Cancel order #${orderId} success`);
    }
}
