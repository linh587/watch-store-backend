import dotenv from "dotenv";
import { escape, OkPacket, RowDataPacket } from "mysql2";
import { LimitOptions } from "../config.js";
import pool from "../db.js";
import { convertUnderscorePropertiesToCamelCase } from "../utils/dataMapping.js";
import { createLimitSql } from "../utils/misc.js";
import { createUid } from "../utils/uid.js";
import * as OrderConfirmService from "./orderConfirm.js";
import * as OrderDetailService from "./orderDetail.js";
import * as ProductPriceService from "./productPrice.js";

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  userAccountId?: string;
  couponCode?: string;
  receivedType: string;
  receivedAddress: string;
  receivedAt?: Date | string;
  deliveryCharge: number;
  subtotalPrice: number;
  totalPrice: number;
  status: string;
  note?: string;
  paymentStatus: string;
  paymentType: string;
  createdAt: Date | string;
  couponDecrease: number;
  details: OrderDetailService.OrderDetail[];
}

export interface TemporaryOrder {
  details: TemporaryOrderDetail[];
}

export interface TemporaryOrderDetail {
  productPriceId: string;
  quality: number;
  price: number;
}

export interface InformationToCreateOrder {
  customerName: string;
  phone: string;
  email?: string;
  userAccountId?: string;
  couponCode?: string;
  note?: string;
  receivedType: string;
  receivedAddress: string;
  paymentType: string;
  paymentStatus: string;
  deliveryCharge: number;
  details: Omit<TemporaryOrderDetail, "price">[];
}

export interface GetOrderOptions {
  limit?: LimitOptions;
  sort?: SortType;
}

export interface OrderFilters {
  status?: string;
  createdFrom?: Date;
  createdTo?: Date;
  searchString?: string; // customer name or phone in order
}

export interface StatisOrderItem {
  completedCount: number;
  totalCount: number;
  cancelledCount: number;
  completedTotalPrice: number;
  totalPrice: number;
  cancelledTotalPrice: number;
  date: string;
}

export type TimeType = (typeof TIME_TYPES)[number];
export type SortType = (typeof SORT_TYPES)[number];

dotenv.config();

export const ORDER_STATUS = {
  waitVerify: "waitVerify",
  verified: "verified",
  waitReceive: "waitReceive",
  received: "received",
  completed: "completed",
  cancelled: "cancelled",
};

export const PAYMENT_STATUS = {
  NOT_PAID: "not-paid",
  PAID: "paid",
  PAY_FAILED: "pay-failed",
};

export const PAYMENT_TYPE = {
  COD: "0",
  CARD: "1",
};

export const VNP_RESPONSE_CODE = {
  SUCCESS: "00",
  TMC_CODE_NOT_FOUND: "02", // Mã định danh không hợp lệ,
  WRONG_PAYLOAD: "03", // Dữ liệu gửi lên không hợp lệ
  NOT_FOUND: "91", // Không tìm thấy giao dịch yêu cầu
  DUPLICATE_REQUEST: "94", // Yêu cầu bị trùng lặp
  NOT_AVAILABLE_CHECK_SUM: "97", // Check sum không hợp lệ
  OTHER_ERROR: "99", // Các lỗi khác
};

export const VNP_TRANSACTION_STATUS = {
  SUCCESS: "00", // Thanh toán thành công
  NOT_COMPLETED: "01", // Chưa hoàn thành
  ERROR: "02", // Bị lỗi
  TRANSACTION: "04", // Giao dịch đảo
  IN_PROGRESS: "05", // Đang xử lý (GD hoàn tiền)
  REFUNED: "06", // Đã hoàn tiền
  REJECT_REFUND: "09", // Từ chối hoàn tiền
};

export const TIME_TYPES = ["day", "month", "year"] as const;
export const SORT_TYPES = ["newest", "oldest"] as const;

const MYSQL_DB = process.env.MYSQL_DB || "watch_db";

export async function getAllOrders(
  options?: GetOrderOptions,
  filters?: OrderFilters
) {
  let getAllOrdersQuery = `select id, customer_name, phone, email, user_account_id, coupon_code, payment_status, received_type, received_address, received_at, delivery_charge, subtotal_price, total_price, status, note, created_at from ${MYSQL_DB}.order`;

  if (filters) {
    const filterSql = createFilterSql(filters);
    if (filterSql) {
      getAllOrdersQuery += ` where ${filterSql}`;
    }
  }

  if (options) {
    if (options.sort) {
      getAllOrdersQuery += " " + createSortSql(options.sort);
    }

    if (options.limit) {
      getAllOrdersQuery += " " + createLimitSql(options.limit);
    }
  }

  const [orderRowDatas] = (await pool.query(
    getAllOrdersQuery
  )) as RowDataPacket[][];
  return orderRowDatas.map(convertUnderscorePropertiesToCamelCase) as Order[];
}

export async function getOrdersByUserAccount(
  userAccountId: string,
  options?: GetOrderOptions,
  filters?: OrderFilters
) {
  let getOrdersByUserAccountQuery = `select id, customer_name, phone, email, user_account_id, coupon_code, received_type, received_address, received_at, delivery_charge, subtotal_price, total_price, status, note, payment_status, payment_type, created_at from ${MYSQL_DB}.order where user_account_id=?`;

  if (filters) {
    const filterSql = createFilterSql(filters);
    if (filterSql) {
      getOrdersByUserAccountQuery += ` and ${filterSql}`;
    }
  }

  if (options) {
    if (options.sort) {
      getOrdersByUserAccountQuery += " " + createSortSql(options.sort);
    }

    if (options.limit) {
      getOrdersByUserAccountQuery += " " + createLimitSql(options.limit);
    }
  }

  const [orderRowDatas] = (await pool.query(getOrdersByUserAccountQuery, [
    userAccountId,
  ])) as RowDataPacket[][];
  return orderRowDatas.map(convertUnderscorePropertiesToCamelCase) as Order[];
}

export async function getOrderById(orderId: string) {
  const getOrderQuery = `select id, customer_name, phone, email, user_account_id, coupon_code as couponCode, (select decrease from coupon where coupon_code = couponCode) as coupon_decrease,\
  received_type, received_address, received_at, delivery_charge, subtotal_price, total_price, status, note, payment_type, payment_status, created_at\
  from ${MYSQL_DB}.order where id=?`;
  const [orderRowDatas] = (await pool.query(getOrderQuery, [
    orderId,
  ])) as RowDataPacket[][];
  if (orderRowDatas.length <= 0) {
    return null;
  }

  const details = await OrderDetailService.getOrderDetails(orderId);

  return convertUnderscorePropertiesToCamelCase({
    ...orderRowDatas[0],
    details,
  }) as Order;
}

export async function createOrder(
  information: InformationToCreateOrder,
  amountOfDecreaseMoney: number,
  userAccountId?: string
) {
  const orderId = createUid(20);
  const {
    customerName,
    phone,
    email,
    couponCode,
    note,
    receivedType,
    receivedAddress,
    deliveryCharge,
    paymentType,
    paymentStatus,
    details,
  } = information;
  if (details.length <= 0) {
    return "";
  }
  const temporaryOrderDetails = (
    await Promise.all(
      details.map(async (detail) => {
        const productPrice = await ProductPriceService.getProductPrice(
          detail.productPriceId
        );
        if (!productPrice) {
          return null;
        }
        const { price } = productPrice;
        return { ...detail, price };
      })
    )
  ).flatMap((detail) => (detail ? [detail] : []));

  const subtotalPrice = calculateTemporaryTotalPrice(temporaryOrderDetails);
  const totalPrice =
    subtotalPrice +
    Number(deliveryCharge || 0) -
    Number(amountOfDecreaseMoney || 0);
  const createOrderQuery =
    "insert into " +
    MYSQL_DB +
    ".order(`id`, `customer_name`, `phone`, `email`, `user_account_id`, `note`, `coupon_code`, `received_type`, `received_address`, `delivery_charge`, `subtotal_price`, `total_price`, `status`, `payment_type`, `payment_status`, `created_at`) values (?)";
  const poolConnection = await pool.getConnection();
  try {
    await poolConnection.beginTransaction();
    await poolConnection.query(createOrderQuery, [
      [
        orderId,
        customerName,
        phone,
        email,
        userAccountId,
        note,
        couponCode,
        receivedType,
        receivedAddress,
        deliveryCharge,
        subtotalPrice,
        totalPrice,
        ORDER_STATUS.waitVerify,
        paymentType,
        paymentStatus,
        new Date(),
      ],
    ]);
    await OrderDetailService.addOrderDetails(
      orderId,
      temporaryOrderDetails,
      poolConnection
    );
    await poolConnection.commit();
    return { orderId, totalPrice } as any;
  } catch (error) {
    await poolConnection.rollback();
    console.log(error);
    return "";
  } finally {
    poolConnection.release();
  }
}

export async function cancelOrderByUser(
  userAccountId: string,
  orderId: string
) {
  const cancelOrderQuery = `update ${MYSQL_DB}.order set status=? where user_account_id=? and id=? and status in ?`;
  const [result] = (await pool.query(cancelOrderQuery, [
    ORDER_STATUS.cancelled,
    userAccountId,
    orderId,
    [[ORDER_STATUS.waitVerify, ORDER_STATUS.verified]],
  ])) as OkPacket[];
  return result.affectedRows > 0;
}

export async function cancelOrderById(orderId: string) {
  const cancelOrderQuery = `update ${MYSQL_DB}.order set status=? where id=? and status in ?`;
  const [result] = (await pool.query(cancelOrderQuery, [
    ORDER_STATUS.cancelled,
    orderId,
    [[ORDER_STATUS.waitVerify, ORDER_STATUS.verified]],
  ])) as OkPacket[];
  return result.affectedRows > 0;
}

export async function updatePaymentStatusById(
  orderId: string,
  responseCode: string
) {
  let paymentStatus;

  if (responseCode === VNP_RESPONSE_CODE.SUCCESS) {
    paymentStatus = PAYMENT_STATUS.PAID;
  } else {
    paymentStatus = PAYMENT_STATUS.NOT_PAID;
  }

  const updatePaymentQuery = `update ${MYSQL_DB}.order set payment_status=? where id=?`;

  const [result] = (await pool.query(updatePaymentQuery, [
    paymentStatus,
    orderId,
  ])) as OkPacket[];
  return result.affectedRows > 0;
}

export async function verifyOrder(
  orderId: string,
  staffAccountId?: string,
  id?: string
) {
  const verifyOrderQuery = `update ${MYSQL_DB}.order set status=? where id=? and status in ?`;
  const poolConnection = await pool.getConnection();

  try {
    await poolConnection.beginTransaction();
    const [statusUpdateResult] = (await poolConnection.query(verifyOrderQuery, [
      ORDER_STATUS.verified,
      orderId,
      [[ORDER_STATUS.waitVerify]],
    ])) as OkPacket[];
    if (statusUpdateResult.affectedRows <= 0) {
      throw new Error(`Don't verify order #${orderId}`);
    }
    await OrderConfirmService.confirmOrder(
      { accountId: staffAccountId || id, orderId, action: "verify" },
      poolConnection
    );
    await poolConnection.commit();
    return true;
  } catch (error) {
    console.log(error);
    await poolConnection.rollback();
    return false;
  } finally {
    poolConnection.release();
  }
}

export async function deliveryOrder(
  orderId: string,
  staffAccountId?: string,
  id?: string
) {
  const deliveryOrderQuery = `update ${MYSQL_DB}.order set status=? where id=? and status in ?`;
  const poolConnection = await pool.getConnection();

  try {
    await poolConnection.beginTransaction();
    const [statusUpdateResult] = (await poolConnection.query(
      deliveryOrderQuery,
      [ORDER_STATUS.waitReceive, orderId, [[ORDER_STATUS.verified]]]
    )) as OkPacket[];
    if (statusUpdateResult.affectedRows <= 0) {
      throw new Error(`Don't delivery order #${orderId}`);
    }

    await OrderConfirmService.confirmOrder(
      { accountId: staffAccountId || id, orderId, action: "delivery" },
      poolConnection
    );
    await poolConnection.commit();
    return true;
  } catch (error) {
    console.log(error);
    await poolConnection.rollback();
    return false;
  } finally {
    poolConnection.release();
  }
}

export async function verifyReceivedOrder(
  orderId: string,
  staffAccountId?: string,
  id?: string
) {
  const verifyReceivedOrderQuery = `update ${MYSQL_DB}.order set status=?, payment_status=?, received_at=? where id=? and status in ?`;
  const poolConnection = await pool.getConnection();

  try {
    await poolConnection.beginTransaction();
    const [statusUpdateResult] = (await poolConnection.query(
      verifyReceivedOrderQuery,
      [
        ORDER_STATUS.received,
        PAYMENT_STATUS.PAID,
        new Date(),
        orderId,
        [[ORDER_STATUS.waitReceive]],
      ]
    )) as OkPacket[];
    if (statusUpdateResult.affectedRows <= 0) {
      throw new Error(`Don't verify received order #${orderId}`);
    }

    await OrderConfirmService.confirmOrder(
      { accountId: staffAccountId || id, orderId, action: "verifyReceived" },
      poolConnection
    );
    await poolConnection.commit();
    return true;
  } catch (error) {
    console.log(error);
    await poolConnection.rollback();
    return false;
  } finally {
    poolConnection.release();
  }
}

export async function completedOrder(
  orderId: string,
  staffAccountId?: string,
  id?: string
) {
  const verifyReceivedOrderQuery = `update ${MYSQL_DB}.order set status=? where id=? and status not in ?`;
  const poolConnection = await pool.getConnection();

  try {
    await poolConnection.beginTransaction();
    const [statusUpdateResult] = (await poolConnection.query(
      verifyReceivedOrderQuery,
      [ORDER_STATUS.completed, orderId, [[ORDER_STATUS.cancelled]]]
    )) as OkPacket[];
    if (statusUpdateResult.affectedRows <= 0) {
      throw new Error(`Don't verify completed order #${orderId}`);
    }

    await OrderConfirmService.confirmOrder(
      { accountId: staffAccountId || id, orderId, action: "completed" },
      poolConnection
    );

    await poolConnection.commit();
    return true;
  } catch (error) {
    console.log(error);
    await poolConnection.rollback();
    return false;
  } finally {
    poolConnection.release();
  }
}

export async function cancelOrderByStaff(
  orderId: string,
  reason: string,
  staffAccountId?: string,
  id?: string
) {
  if (!(await canCancelOrder(orderId))) {
    return false;
  }

  const cancelOrderQuery = `update ${MYSQL_DB}.order set status=?, note=? where id=? and status in ?`;
  const poolConnection = await pool.getConnection();

  try {
    await poolConnection.beginTransaction();
    const [statusUpdateResult] = (await poolConnection.query(cancelOrderQuery, [
      ORDER_STATUS.cancelled,
      reason,
      orderId,
      [[ORDER_STATUS.waitVerify, ORDER_STATUS.waitReceive]],
    ])) as OkPacket[];
    if (statusUpdateResult.affectedRows <= 0) {
      throw new Error(`Don't cancel order #${orderId}`);
    }

    await OrderConfirmService.confirmOrder(
      { accountId: staffAccountId || id, orderId, action: "cancel" },
      poolConnection
    );
    await poolConnection.commit();
    return true;
  } catch (error) {
    console.log(error);
    await poolConnection.rollback();
    return false;
  } finally {
    poolConnection.release();
  }
}

export async function canVerifyOrder(orderId: string) {
  const order = await getOrderById(orderId);
  if (!order) {
    return false;
  }

  if (!(order.status === ORDER_STATUS.waitReceive)) {
    return false;
  }

  return true;
}

export async function canDeliveryOrder(orderId: string) {
  const order = await getOrderById(orderId);
  if (!order) {
    return false;
  }

  if (!(order.status === ORDER_STATUS.verified)) {
    return false;
  }

  return true;
}

export async function canVerifyReceivedOrder(orderId: string) {
  const order = await getOrderById(orderId);
  if (!order) {
    return false;
  }

  if (!(order.status === ORDER_STATUS.waitReceive)) {
    return false;
  }

  return true;
}

export async function canCompletedOrder(orderId: string) {
  const order = await getOrderById(orderId);
  if (!order) {
    return false;
  }

  if (order.status === ORDER_STATUS.cancelled) {
    return false;
  }

  return true;
}

export async function canCancelOrder(orderId: string) {
  const order = await getOrderById(orderId);
  if (!order) {
    return false;
  }

  if (order.status === ORDER_STATUS.verified) {
    return false;
  }

  return true;
}

export function calculateTemporaryTotalPrice(
  orderItems: TemporaryOrderDetail[]
) {
  const totalPrice = orderItems
    .map(({ price, quality }) => price * quality)
    .reduce((totalPrice, price) => totalPrice + price, 0);

  return totalPrice;
}

export async function statisOrders(
  fromDate: Date,
  toDate: Date,
  timeType: TimeType = "day",
  separated = "-"
) {
  const statisOrdersQuery = `select\ 
    sum(if(status = 'completed', 1, 0 )) as completed_count,\
    sum(if (status='completed' or status='cancelled',  1, 0)) as total_count,\
    sum(if(status='cancelled', 1, 0)) as cancelled_count,\
    sum(if(status = 'completed', total_price, 0 )) as completed_total_price,\
    sum(if (status='completed' or status='cancelled',  total_price, 0)) as total_price,\
    sum(if(status='cancelled', total_price, 0)) as cancelled_total_price,\
    date_format(created_at, ?) as date\
    from ${MYSQL_DB}.order \
    where date(created_at) >= date(?) and date(created_at) <= date(?)\
    group by date order by date`;

  const DAY_SPECIFIER = "%d";
  const MONTH_SPECIFIER = "%m";
  const YEAR_SPECIFIER = "%Y";
  const STATIS_DATE_FORMATE: Record<TimeType, string> = {
    day: [DAY_SPECIFIER, MONTH_SPECIFIER, YEAR_SPECIFIER].join(separated),
    month: [MONTH_SPECIFIER, YEAR_SPECIFIER].join(separated),
    year: [YEAR_SPECIFIER].join(separated),
  };

  const [statisOrdersRowDatas] = (await pool.query(statisOrdersQuery, [
    STATIS_DATE_FORMATE[timeType],
    fromDate,
    toDate,
  ])) as RowDataPacket[][];
  return statisOrdersRowDatas.map(
    convertUnderscorePropertiesToCamelCase
  ) as StatisOrderItem[];
}

function createSortSql(sort: SortType) {
  switch (sort) {
    case "newest":
      return "order by created_at desc";
    case "oldest":
      return "order by created_at asc";
    default:
      return "";
  }
}

function createFilterSql(filters: OrderFilters) {
  const orderFilterConditions: string[] = [];

  if (filters.status) {
    orderFilterConditions.push(`status=${escape(filters.status)}`);
  }

  if (filters.createdFrom && !isNaN(filters.createdFrom.getTime())) {
    orderFilterConditions.push(
      `date(created_at) >= date(${escape(filters.createdFrom)})`
    );
  }

  if (filters.createdTo && !isNaN(filters.createdTo.getTime())) {
    orderFilterConditions.push(
      `date(created_at) <= date(${escape(filters.createdTo)})`
    );
  }

  if (filters.searchString) {
    const searchStringConditions: string[] = [];
    searchStringConditions.push(
      `customer_name like ${escape(`%${filters.searchString}%`)}`
    );
    searchStringConditions.push(
      `phone like ${escape(`%${filters.searchString}%`)}`
    );
    orderFilterConditions.push(`(${searchStringConditions.join(" or ")})`);
  }

  return orderFilterConditions.join(" and ");
}
