import { PoolConnection, RowDataPacket } from "mysql2/promise";
import pool from "../db.js";
import { convertUnderscorePropertiesToCamelCase } from "../utils/dataMapping.js";
import { ORDER_STATUS, TemporaryOrderDetail } from "./order.js";
import * as ProductPriceService from "./productPrice.js";

export interface OrderDetail {
  priceAtPurchase: any;
  orderId: string;
  productPriceId: string;
  quality: number;
  price: number;
  productName: string;
  productSizeName: string;
  categoryName: string;
  productCoverImage: string;
  productSizeId: string;
  productId: string;
}

export async function getOrderDetails(
  orderId: string,
  continueWithConnection?: PoolConnection
) {
  const connection = continueWithConnection || pool;
  const getOrderDetailsQuery =
    "select order_id, product_price_id, quality, price_at_purchase, product.name as product_name,\
    product_size.name as product_size_name, product.cover_image as product_cover_image, category.name as category_name,\
    product.id as product_id, product_size.id as product_size_id \
     from order_detail inner join product_price on order_detail.product_price_id = product_price.id\
     inner join product on product_price.product_id = product.id\
     inner join category on product.category_id = category.id\
     inner join product_size on product_price.product_size_id = product_size.id where order_id=?";
  const [orderDetailRowDatas] = (await connection.query(getOrderDetailsQuery, [
    orderId,
  ])) as RowDataPacket[][];
  return orderDetailRowDatas.map(
    convertUnderscorePropertiesToCamelCase
  ) as OrderDetail[];
}

export async function addOrderDetails(
  orderId: string,
  details: TemporaryOrderDetail[],
  connection: PoolConnection
) {
  const addOrderDetailsQuery =
    "insert into order_detail(`order_id`, `product_price_id`, `quality`, `price_at_purchase`) values (?)";

  const updateQuantityQuery =
    "update product_price\
  set quantity = product_price.quantity - ?\
  where product_price.id=?";

  const orderDetailRowDatas = details.map((detail) => [
    orderId,
    detail.productPriceId,
    detail.quality,
    detail.price,
  ]);

  for (const detail of orderDetailRowDatas) {
    await connection.query(addOrderDetailsQuery, [detail]);
    await connection.query(updateQuantityQuery, [detail[2], detail[1]]);
  }
  return true;
  // const [result] = (await connection.query(addOrderDetailsQuery, [
  //   orderDetailRowDatas,
  // ])) as OkPacket[];
  // return result.affectedRows > 0;
}

export async function boughtProduct(userAccountId: string, productId: string) {
  const productPricesOfProduct =
    await ProductPriceService.getProductPricesByProductId(productId);
  const productPriceIdsOfProduct = productPricesOfProduct.flatMap(
    (productPrice) => (productPrice.id ? [String(productPrice.id)] : [])
  );
  if (productPriceIdsOfProduct.length <= 0) return false;
  const countOrderDetailQuery =
    "select count(*) as order_detail_count from order_detail \
        inner join watch_db.order on order_detail.order_id = watch_db.order.id \
        inner join user_account on watch_db.order.user_account_id =  user_account.id \
        where order_detail.product_price_id in ? and user_account.id =? and watch_db.order.status=?";
  const [rowDatas] = (await pool.query(countOrderDetailQuery, [
    [productPriceIdsOfProduct],
    userAccountId,
    ORDER_STATUS.received,
  ])) as RowDataPacket[][];
  return Boolean(rowDatas?.[0]?.["order_detail_count"] > 0);
}
