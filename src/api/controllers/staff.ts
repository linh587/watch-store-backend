import dotenv from "dotenv";
import { Response } from "express";
import { getSocketIO } from "../../socketIO.js";
import {
  ApproveOrderRequest,
  StaffRequest,
} from "../middlewares/authorization.js";
import { FormDataRequest } from "../middlewares/formDataExtract.js";
import * as NotificationService from "../services/notification.js";
import * as OrderService from "../services/order.js";
import * as DamageService from "../services/damage.js";
import * as RatingService from "../services/rating.js";
import * as StaffAccountService from "../services/staffAccount.js";
import { deleteImage, uploadImage } from "../utils/storageImage.js";

dotenv.config();

export async function getInformation(req: StaffRequest, res: Response) {
  const { staffAccountId } = req;
  if (!staffAccountId) {
    res.status(400).json("Miss credential");
    return;
  }

  const information = await StaffAccountService.getInformation(staffAccountId);
  if (!information) {
    res.status(400).json("Not found this staff");
    return;
  }

  res.json(information);
}

export async function updateInformation(
  req: FormDataRequest<StaffRequest>,
  res: Response
) {
  const { staffAccountId } = req;
  if (!staffAccountId) {
    res.status(400).json("Miss credential");
    return;
  }

  if (!staffAccountId || !req.fields) {
    res.status(400).json("Error unknown");
    return;
  }

  const information =
    req.fields as StaffAccountService.InformationToUpdateStaffAccount;
  const oldInformation = await StaffAccountService.getInformation(
    staffAccountId
  );
  const oldAvatar = String(oldInformation?.avatar || "");
  let newAvatar = "";
  information.avatar = oldAvatar;

  if (req.files && req.files.avatarFile) {
    const avatarFile = Array.isArray(req.files.avatarFile)
      ? req.files.avatarFile[0]
      : req.files.avatarFile;
    newAvatar = await uploadImage(avatarFile.filepath);
    information.avatar = newAvatar;
  }

  const success = await StaffAccountService.updateInformation(
    staffAccountId,
    information
  );
  if (success) {
    if (information.avatar !== oldAvatar) {
      await deleteImage(oldAvatar);
    }

    res.json(information);
  } else {
    res.status(400).json("Update failure");
  }
}

export async function updatePassword(req: StaffRequest, res: Response) {
  const { staffAccountId } = req;
  const { oldPassword, newPassword } = req.body;
  if (!staffAccountId) {
    res.status(400).json("Miss credential");
    return;
  }

  const success = await StaffAccountService.updatePassword(
    staffAccountId,
    oldPassword,
    newPassword
  );
  if (success) {
    res.json("Update successful");
  } else {
    res.status(400).json("Update failure");
  }
}

export async function checkExistsPhone(req: StaffRequest, res: Response) {
  const phone = String(req.body.phone || "");

  if (!phone) {
    res.status(400).json("Miss phone number");
  }

  const exists = await StaffAccountService.checkExistsPhone(phone);
  res.json(exists);
}

export async function verifyOrder(req: ApproveOrderRequest, res: Response) {
  const { staffAccountId, id } = req;
  const orderId = req.params["orderId"];
  if (!orderId) {
    res.status(400).json("Unknown error");
    return;
  }

  const success = await OrderService.verifyOrder(orderId, staffAccountId, id);
  if (success) {
    const order = await OrderService.getOrderById(orderId);
    if (order && order.userAccountId) {
      const notificationContent = `Đơn hàng #${orderId} đã được duyệt`;
      const CLIENT_ORIGIN =
        process.env.CLIENT_ORIGIN || "http://localhost:4200";
      const notificationLink = CLIENT_ORIGIN + "/order-history/" + orderId;

      await NotificationService.addNotification({
        content: notificationContent,
        linkTo: notificationLink,
        userAccountId: order.userAccountId,
      });
      const socketIO = getSocketIO();
      socketIO.to(order.userAccountId).emit("newNotification");
    }

    res.json("verified");
  } else {
    res.status(400).json("Failure");
  }
}

export async function deliveryOrder(req: ApproveOrderRequest, res: Response) {
  const { staffAccountId, id } = req;

  const orderId = req.params["orderId"];
  if (!orderId) {
    res.status(400).json("Unknown error");
    return;
  }

  const success = await OrderService.deliveryOrder(orderId, staffAccountId, id);
  if (success) {
    const order = await OrderService.getOrderById(orderId);
    if (order && order.userAccountId) {
      const notificationContent = `Đơn hàng #${orderId} đã được vận chuyển`;
      const CLIENT_ORIGIN =
        process.env.CLIENT_ORIGIN || "http://localhost:4200";
      const notificationLink = CLIENT_ORIGIN + "/order-history/" + orderId;

      await NotificationService.addNotification({
        content: notificationContent,
        linkTo: notificationLink,
        userAccountId: order.userAccountId,
      });
      const socketIO = getSocketIO();
      socketIO.to(order.userAccountId).emit("newNotification");
    }
    res.json("waitReceive");
  } else {
    res.status(400).json("Failure");
  }
}

export async function verifyReceivedOrder(
  req: ApproveOrderRequest,
  res: Response
) {
  const { staffAccountId, id } = req;

  const orderId = req.params["orderId"];
  if (!orderId) {
    res.status(400).json("Unknown error");
    return;
  }

  const success = await OrderService.verifyReceivedOrder(
    orderId,
    staffAccountId,
    id
  );
  if (success) {
    const order = await OrderService.getOrderById(orderId);
    if (order && order.userAccountId) {
      const notificationContent = `Đơn hàng #${orderId} đã được nhận`;
      const CLIENT_ORIGIN =
        process.env.CLIENT_ORIGIN || "http://localhost:4200";
      const notificationLink = CLIENT_ORIGIN + "/order-history/" + orderId;

      await NotificationService.addNotification({
        content: notificationContent,
        linkTo: notificationLink,
        userAccountId: order.userAccountId,
      });
      const socketIO = getSocketIO();
      socketIO.to(order.userAccountId).emit("newNotification");
    }
    res.json("received");
  } else {
    res.status(400).json("Failure");
  }
}

export async function completedOrder(req: ApproveOrderRequest, res: Response) {
  const { staffAccountId, id } = req;

  const orderId = req.params["orderId"];
  if (!orderId) {
    res.status(400).json("Unknown error");
    return;
  }

  const success = await OrderService.completedOrder(
    orderId,
    staffAccountId,
    id
  );
  if (success) {
    res.json("completed");
  } else {
    res.status(400).json("Failure");
  }
}

export async function cancelOrder(req: ApproveOrderRequest, res: Response) {
  const { staffAccountId, id } = req;
  const orderId = req.params["orderId"];
  const reason = req.body["reason"];
  if (!orderId || !reason) {
    res.status(400).json("Unknown error");
    return;
  }

  const success = await OrderService.cancelOrderByStaff(
    orderId,
    reason,
    staffAccountId,
    id
  );
  if (success) {
    const order = await OrderService.getOrderById(orderId);
    if (order && order.userAccountId) {
      const notificationContent = `Đơn hàng #${orderId} đã được hủy`;
      const CLIENT_ORIGIN =
        process.env.CLIENT_ORIGIN || "http://localhost:4200";
      const notificationLink = CLIENT_ORIGIN + "/order-history/" + orderId;

      await NotificationService.addNotification({
        content: notificationContent,
        linkTo: notificationLink,
        userAccountId: order.userAccountId,
      });
      const socketIO = getSocketIO();
      socketIO.to(order.userAccountId).emit("newNotification");
    }
    res.json("cancelled");
  } else {
    res.status(400).json("Failure");
  }
}

export async function canVerifyOrder(req: StaffRequest, res: Response) {
  const orderId = req.params["orderId"];
  if (!orderId) {
    res.status(400).json("Unknown error");
    return;
  }

  const result = await OrderService.canVerifyOrder(orderId);
  res.json(result);
}

export async function canDeliveryOrder(req: StaffRequest, res: Response) {
  const orderId = req.params["orderId"];
  if (!orderId) {
    res.status(400).json("Unknown error");
    return;
  }

  const result = await OrderService.canDeliveryOrder(orderId);
  res.json(result);
}

export async function canVerifyReceivedOrder(req: StaffRequest, res: Response) {
  const orderId = req.params["orderId"];
  if (!orderId) {
    res.status(400).json("Unknown error");
    return;
  }

  const result = await OrderService.canVerifyReceivedOrder(orderId);
  res.json(result);
}

export async function canCompletedOrder(req: StaffRequest, res: Response) {
  const orderId = req.params["orderId"];
  if (!orderId) {
    res.status(400).json("Unknown error");
    return;
  }

  const result = await OrderService.canCompletedOrder(orderId);
  res.json(result);
}

export async function canCancelOrder(req: StaffRequest, res: Response) {
  const orderId = req.params["orderId"];
  if (!orderId) {
    res.status(400).json("Unknown error");
    return;
  }

  const result = await OrderService.canCancelOrder(orderId);
  res.json(result);
}

export async function statisOrders(req: StaffRequest, res: Response) {
  const timeType = req.query["timeType"] as OrderService.TimeType;
  const fromDate = new Date(String(req.query["fromDate"]));
  const toDate = new Date(String(req.query["toDate"]));

  const result = await OrderService.statisOrders(fromDate, toDate, timeType);
  res.json(result);
}

export async function statisDamages(req: StaffRequest, res: Response) {
  const timeType = req.query["timeType"] as DamageService.TimeType;
  const fromDate = new Date(String(req.query["fromDate"]));
  const toDate = new Date(String(req.query["toDate"]));

  const result = await DamageService.statisDamage(fromDate, toDate, timeType);
  res.json(result);
}

export async function statisRating(req: StaffRequest, res: Response) {
  const timeType = req.query["timeType"] as DamageService.TimeType;
  const fromDate = new Date(String(req.query["fromDate"]));
  const toDate = new Date(String(req.query["toDate"]));

  const result = await RatingService.statisRating(fromDate, toDate, timeType);
  res.json(result);
}
