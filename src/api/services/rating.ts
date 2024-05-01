import { OkPacket, RowDataPacket } from "mysql2";
import { escape, PoolConnection } from "mysql2/promise";
import { LimitOptions } from "../config.js";
import pool from "../db.js";
import { convertUnderscorePropertiesToCamelCase } from "../utils/dataMapping.js";
import { createLimitSql } from "../utils/misc.js";
import * as OrderDetailService from "./orderDetail.js";

interface Rating {
  productId: string;
  userAccountId: string;
  star: number;
  content: string;
  status?: RatingStatus;
  createdAt: Date | string;
  updatedAt?: Date | string;
  userName: string;
  userAvatar: string;
}

export interface GetRatingOptions {
  limit?: LimitOptions;
  sort?: SortType;
}

export interface RatingFilters {
  star?: number;
  status?: RatingStatus;
  searchString?: string; // content or user name of rating
}

export interface StatisRatingItem {
  totalCount: number;
  totalCountStarFive: number;
  totalCountStarFour: number;
  totalCountStarThree: number;
  totalCountStarTwo: number;
  totalCountStarOne: number;
  date: string;
}

const MYSQL_DB = process.env.MYSQL_DB || "watch_db";
export type TimeType = (typeof TIME_TYPES)[number];
export type RatingStatus = "lock" | "unavailable";
export type SortType = (typeof SORT_TYPES)[number];

export type InformationToCreateRating = Pick<
  Rating,
  "productId" | "star" | "content"
>;
export type InformationToUpdateRating = Pick<Rating, "star" | "content">;

const RATING_STATUS = {
  lock: "lock",
  unavailable: "unavailable",
};


export const TIME_TYPES = ["day", "month", "year"] as const;
export const SORT_TYPES = ["newest", "oldest"] as const;

export async function getAllRatings(
  options: GetRatingOptions,
  filters: RatingFilters
) {
  let getAllRatingsQuery =
    "select product_id, user_account_id, star, content, status, created_at, updated_at, user_account.name as user_name\
    from rating inner join user_account on rating.user_account_id = user_account.id";

  if (filters) {
    const filterSql = createFilterSql(filters);
    if (filterSql) {
      getAllRatingsQuery += ` where ${filterSql}`;
    }
  }

  if (options) {
    if (options.sort && SORT_TYPES.includes(options.sort)) {
      getAllRatingsQuery += " " + createSortSql(options.sort);
    }

    if (options.limit) {
      getAllRatingsQuery += " " + createLimitSql(options.limit);
    }
  }

  const [ratingRowDatas] = (await pool.query(
    getAllRatingsQuery
  )) as RowDataPacket[][];
  return ratingRowDatas.map(convertUnderscorePropertiesToCamelCase) as Rating[];
}

export async function getRatings(
  productId: string,
  options?: GetRatingOptions,
  filters?: RatingFilters
) {
  let getRatingsQuery =
    "select product_id, user_account_id, star, content, status, created_at, updated_at, user_account.name as user_name from rating inner join user_account on rating.user_account_id = user_account.id where product_id=? and status is null";

  if (filters) {
    const filterSql = createFilterSql(filters);
    if (filterSql) {
      getRatingsQuery += ` and ${filterSql}`;
    }
  }

  if (options) {
    if (options.sort) {
      getRatingsQuery += " " + createSortSql(options.sort);
    }

    if (options.limit) {
      getRatingsQuery += " " + createLimitSql(options.limit);
    }
  }
  const [ratingRowDatas] = (await pool.query(getRatingsQuery, [
    productId,
  ])) as RowDataPacket[][];
  return ratingRowDatas.map(convertUnderscorePropertiesToCamelCase) as Rating[];
}

export async function getOwnRating(userAccountId: string, productId: string) {
  const getOwnRatingQuery =
    "select product_id, user_account_id, star, content, status, created_at, updated_at, user_account.name as user_name as user_avatar from rating inner join user_account on rating.user_account_id = user_account.id where product_id=? and user_account_id=? and status is null";
  const [ratingRowDatas] = (await pool.query(getOwnRatingQuery, [
    productId,
    userAccountId,
  ])) as RowDataPacket[][];
  return convertUnderscorePropertiesToCamelCase(
    ratingRowDatas[0] || null
  ) as Rating | null;
}

export async function addRating(
  userAccountId: string,
  information: InformationToCreateRating
) {
  const { productId, star, content } = information;
  const addRatingQuery =
    "insert into rating(`product_id`, `user_account_id`, `star`, `content`, `created_at`) values (?)";
  if (!(await canRating(userAccountId, productId))) {
    return false;
  }

  try {
    const [result] = (await pool.query(addRatingQuery, [
      [productId, userAccountId, star, content, new Date()],
    ])) as OkPacket[];
    return result.affectedRows > 0;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export async function updateRating(
  userAccountId: string,
  productId: string,
  information: InformationToUpdateRating
) {
  const { star, content } = information;
  const updateRatingQuery =
    "update rating set star=?, content=?, updated_at=? where product_id=? and user_account_id=?";
  const [result] = (await pool.query(updateRatingQuery, [
    star,
    content,
    new Date(),
    productId,
    userAccountId,
  ])) as OkPacket[];
  return result.affectedRows > 0;
}

export async function deleteRating(userAccountId: string, productId: string) {
  const deleteRatingQuery =
    "delete from rating where product_id=? and user_account_id=?";
  const [result] = (await pool.query(deleteRatingQuery, [
    productId,
    userAccountId,
  ])) as OkPacket[];
  return result.affectedRows > 0;
}

export async function canRating(userAccountId: string, productId: string) {
  const userBounghtProduct = await OrderDetailService.boughtProduct(
    userAccountId,
    productId
  );
  return userBounghtProduct;
}

export async function lockRating(userAccountId: string, productId: string) {
  const lockRatingQuery =
    "update rating set status=? where user_account_id=? and product_id=? and status is null";
  const [result] = (await pool.query(lockRatingQuery, [
    RATING_STATUS.lock,
    userAccountId,
    productId,
  ])) as OkPacket[];
  return result.affectedRows > 0;
}

export async function unlockRating(userAccountId: string, productId: string) {
  const unlockRatingQuery =
    "update rating set status=null where user_account_id=? and product_id=? and status=?";
  const [result] = (await pool.query(unlockRatingQuery, [
    userAccountId,
    productId,
    RATING_STATUS.lock,
  ])) as OkPacket[];
  return result.affectedRows > 0;
}

export async function setUnavailableRating(
  userAccountId: string,
  connection: PoolConnection
) {
  const setUnavailableRatingQuery =
    "update rating set status= where user_account_id=? and status is null";
  const [result] = (await connection.query(setUnavailableRatingQuery, [
    RATING_STATUS.unavailable,
    userAccountId,
  ])) as OkPacket[];
  return result.affectedRows > 0;
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

function createFilterSql(filters: RatingFilters) {
  const filterConditions: string[] = [];

  if (filters.star) {
    filterConditions.push(`star=${escape(filters.star)}`);
  }

  if (filters.status) {
    filterConditions.push(`rating.status=${escape(filters.status)}`);
  }

  if (filters.searchString) {
    const searchStringConditions: string[] = [];
    searchStringConditions.push(
      `rating.content like ${escape(`%${filters.searchString}%`)}`
    );
    searchStringConditions.push(
      `user_account.name like ${escape(`%${filters.searchString}%`)}`
    );
    filterConditions.push(`(${searchStringConditions.join(" or ")})`);
  }

  return filterConditions.join(" and ");
}

export async function statisRating(
  fromDate: Date,
  toDate: Date,
  //timeType: TimeType = "day",
  separated = "-"
) {
  const statisOrdersQuery = `select count(*) as total_count,\
    sum(if(rating.star = 5, 1, 0)) as start_five_count,\
    sum(if(rating.star = 4, 1, 0)) as start_four_count,\
    sum(if(rating.star = 3, 1, 0)) as start_three_count,\
    sum(if(rating.star = 2, 1, 0)) as start_two_count,\
    sum(if(rating.star = 1, 1, 0)) as start_one_count\
  from ${MYSQL_DB}.rating where date (rating.created_at) >= date(?) and date(rating.created_at) <= date(?);`;
    
  const DAY_SPECIFIER = "%d";
  const MONTH_SPECIFIER = "%m";
  const YEAR_SPECIFIER = "%Y";
  // const STATIS_DATE_FORMATE: Record<TimeType, string> = {
  //   day: [DAY_SPECIFIER, MONTH_SPECIFIER, YEAR_SPECIFIER].join(separated),
  //   month: [MONTH_SPECIFIER, YEAR_SPECIFIER].join(separated),
  //   year: [YEAR_SPECIFIER].join(separated),
  // };

  const [statisOrdersRowDatas] = (await pool.query(statisOrdersQuery, [
    fromDate,
    toDate,
  ])) as RowDataPacket[][];
  return statisOrdersRowDatas.map(
    convertUnderscorePropertiesToCamelCase
  ) as StatisRatingItem[];
}
