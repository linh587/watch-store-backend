import dotenv from "dotenv";
import pool from "../db.js";
import { createUid } from "../utils/uid.js";
import * as DamageDetailService from "./damageDetail.js";
import * as ProductService from "./product.js";
import { RowDataPacket } from "mysql2";
import { convertUnderscorePropertiesToCamelCase } from "../utils/dataMapping.js";
import { PoolConnection } from "mysql2/promise";
import { date } from "joi";
import { now } from "lodash";

const MYSQL_DB = process.env.MYSQL_DB || "watch_db";

export interface Damage {
  id: string;
  totalAmount: number;
  creator?: string;
  createdAt: Date;
  note?: string;
  details: DamageDetailService.DamageDetail[];
}

export interface TemporaryDamage {
  details: TemporaryDamageDetail[];
}

export interface TemporaryDamageDetail {
  productId: string;
  sizeId: string;
  quantity: number;
  descript?: string;
}

export interface InfomationToCreateDamage {
    creator?: string;
    createdAt: Date;
  note: string;
  details: Omit<TemporaryDamageDetail, "product">[];
}

export interface InformationToUpdateDamage {
    creator?: string;
    createdAt: Date;
  note: string;
  details: Omit<TemporaryDamageDetail, "product">[];
}

dotenv.config();

export async function getAllDamages() {
  let getAllDamagisQuery = `select id, total_amount, creator, created_at, note from ${MYSQL_DB}.damage where deleted_at is null`;

  const [damageRowDatas] = (await pool.query(
    getAllDamagisQuery
  )) as RowDataPacket[][];
  return damageRowDatas.map(
    convertUnderscorePropertiesToCamelCase
  ) as Damage[];
}

export async function createDamage(
  information: InfomationToCreateDamage
) {
  const damageId = createUid(20);
  const creatAt= new Date();

  const {creator, note, details } =
    information;

  if (details.length <= 0) {
    return "";
  }

  const temporaryDamageDetails = (
    await Promise.all(
      details.map(async (detail) => {
        const productId = await ProductService.getProduct(detail.productId);
        if (!productId) {
          return null;
        }
        return { ...detail };
      })
    )
  ).flatMap((detail) => (detail ? [detail] : []));

  const totalAmount = calculateTemporaryTotalQuantity(temporaryDamageDetails);

  const createDamageQuery =
    "insert into " +
    MYSQL_DB +
    ".damage(`id`, `creator`, `created_at`, `note`, `total_amount`) values (?)";
  const poolConnection = await pool.getConnection();
  try {
    await poolConnection.beginTransaction();
    await poolConnection.query(createDamageQuery, [
      [
        damageId,
        creator,
        creatAt,
        note,
        totalAmount
      ],
    ]);
    await DamageDetailService.addDamageDetails(
      damageId,
      temporaryDamageDetails,
      poolConnection
    );
    await poolConnection.commit();
    return damageId;
  } catch (error) {
    await poolConnection.rollback();
    console.log(error);
    return "";
  } finally {
    poolConnection.release();
  }
}

export async function updateGoodReceipt(
  damageId: string,
  information: InformationToUpdateDamage
) {
  const {  creator, createdAt, note, details } =
    information;

  if (details.length <= 0) {
    return false;
  }

  const temporaryDamageDetails = (
    await Promise.all(
      details.map(async (detail) => {
        const productId = await ProductService.getProduct(detail.productId);
        if (!productId) {
          return null;
        }
        return { ...detail };
      })
    )
  ).flatMap((detail) => (detail ? [detail] : []));

  const totalAmount = calculateTemporaryTotalQuantity(temporaryDamageDetails);

  const updateGoodReceiptQuery =
    "UPDATE " +
    MYSQL_DB +
    ".damage SET creator = ?, created_at = ? note = ?, total_amount = ? WHERE id = ?";
  const poolConnection = await pool.getConnection();
  try {
    await poolConnection.beginTransaction();
    await poolConnection.query(updateGoodReceiptQuery, [
      creator,
      createdAt,
      note,
      totalAmount,
      damageId
    ]);
    await DamageDetailService.updateDamageDetails(
      damageId,
      temporaryDamageDetails,
      poolConnection
    );
    await poolConnection.commit();
    return true;
  } catch (error) {
    await poolConnection.rollback();
    console.log(error);
    return false;
  } finally {
    poolConnection.release();
  }
}

export function calculateTemporaryTotalQuantity(damageItems: TemporaryDamageDetail[]) {
  const totalAmount = damageItems.reduce((totalAmount, {quantity}) => totalAmount + quantity, 0);

  return totalAmount;
}

export async function getDamageById(damageId: string) {
  const getDamageQuery = `select id, total_amount, creator, created_at, note from ${MYSQL_DB}.damage where id=? and deleted_at is null`;
  const [damageRowDatas] = (await pool.query(getDamageQuery, [
    damageId,
  ])) as RowDataPacket[][];
  if (damageRowDatas.length <= 0) {
    return null;
  }

  const details = await DamageDetailService.getDamageDetails(
    damageId
  );

  return convertUnderscorePropertiesToCamelCase({
    ...damageRowDatas[0],
    details,
  }) as Damage[];
}

export async function deleteDamage(
  id: string,
  continueWithConnection?: PoolConnection
) {
  const deleteDamageQuery = "update damage set deleted_at=? where id=?";
  const connection = continueWithConnection || (await pool.getConnection());
  const deletedDateTime = new Date();
  try {
    await connection.beginTransaction();
    await connection.query(deleteDamageQuery, [deletedDateTime, id]);
    await DamageDetailService.deleteDamageId(
      id,
      connection
    );
    await connection.commit();
    return true;
  } catch (error) {
    console.log(error);
    await connection.rollback();
    return false;
  } finally {
    connection.release();
  }
}
