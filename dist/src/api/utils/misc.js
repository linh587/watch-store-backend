import { createHash } from "crypto";
const PRICE_BELOW_20_KM = 30000;
const PRICE_ABOVE_20_KM = 40000;
export function calculateDeliveryCharge(distanceByMeter) {
    const kmCount = distanceByMeter / 1000;
    let deliveryCharge = 0;
    if (kmCount < 0) {
        deliveryCharge = 0;
    }
    if (kmCount < 20) {
        deliveryCharge = PRICE_BELOW_20_KM;
    }
    else {
        deliveryCharge = PRICE_ABOVE_20_KM;
    }
    return deliveryCharge;
}
export function createLimitSql(limit) {
    let limitSql = "";
    if (limit) {
        limitSql += `limit ${limit.amount}${limit.offset ? ` offset ${limit.offset}` : ``}`;
    }
    return limitSql;
}
export function detachWordsInSentence(text) {
    const words = text.split(" ");
    const subSentences = [];
    for (let i = words.length; i > 0; i--) {
        for (let j = 0; j <= words.length - i; j++) {
            const subSentence = words
                .filter((word, index) => index >= j && index < j + i)
                .join(" ");
            subSentences.push(subSentence);
        }
    }
    return subSentences;
}
export function hashText(text) {
    const hash = createHash("sha256");
    hash.update(text);
    return hash.digest("base64");
}
