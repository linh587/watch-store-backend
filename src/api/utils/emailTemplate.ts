import moment from "moment";
import { formatPrice } from "./formatPrice.js";
import { OrderDetail } from "../services/orderDetail.js";
import { v2 as cloudinary } from "cloudinary";

export function getEmailTemplate(
  order: any,
  details: any,
  amountOfDecreaseMoney: number
) {
  return `
  <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <div
      style="
        width: 100%;
        max-width: 600px;
        margin: 0px auto;
        background: repeat white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
          Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
          'Segoe UI Symbol';
      ">
      <table
        style="
          padding: 24px 40px 32px;
          width: 100%;
          background: repeat white;
          border-collapse: separate;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
            'Segoe UI Symbol';
        ">
        <tbody
          style="
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
              Helvetica, Arial, sans-serif, 'Apple Color Emoji',
              'Segoe UI Emoji', 'Segoe UI Symbol';
          ">
          <tr
            style="
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                'Segoe UI Emoji', 'Segoe UI Symbol';
            ">
            <td
              style="
                text-align: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                  Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                  'Segoe UI Emoji', 'Segoe UI Symbol';
              ">
              <p
                style="
                  margin: 0px 0px 4px;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                    Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                    'Segoe UI Emoji', 'Segoe UI Symbol';
                ">
                <img
                  style="
                    width: 220px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                      Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                      'Segoe UI Emoji', 'Segoe UI Symbol';
                  "
                  src="https://mir-s3-cdn-cf.behance.net/projects/404/3f15d6158686469.63903addb222a.png"
                  alt="Logo"
                  class="CToWUd"
                  data-bit="iit" />
              </p>
              <h1
                style="
                  font-size: 24px;
                  font-style: normal;
                  font-weight: 700;
                  line-height: 120%;
                  margin: 32px 0px 0px;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                    Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                    'Segoe UI Emoji', 'Segoe UI Symbol';
                ">
                Xác nhận đặt hàng
              </h1>
            </td>
          </tr>
        </tbody>
      </table>

      <table
        style="
          padding: 0px 40px;
          width: 100%;
          background: repeat white;
          border-collapse: separate;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
            'Segoe UI Symbol';
        ">
        <tbody
          style="
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
              Helvetica, Arial, sans-serif, 'Apple Color Emoji',
              'Segoe UI Emoji', 'Segoe UI Symbol';
          ">
          <tr
            style="
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                'Segoe UI Emoji', 'Segoe UI Symbol';
            ">
            <td
              style="
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                  Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                  'Segoe UI Emoji', 'Segoe UI Symbol';
              ">
              <p
                style="
                  margin: 0px 0px 8px;
                  font-size: 14px;
                  font-weight: 400;
                  line-height: 18.2px;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                    Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                    'Segoe UI Emoji', 'Segoe UI Symbol';
                ">
                Xin chào quý khách
                <b
                  style="
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                      Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                      'Segoe UI Emoji', 'Segoe UI Symbol';
                  "></b
                >,
              </p>
              <p
                style="
                  margin: 0px 0px 8px;
                  font-size: 14px;
                  font-weight: 400;
                  line-height: 18.2px;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                    Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                    'Segoe UI Emoji', 'Segoe UI Symbol';
                ">
                Cảm ơn bạn đã mua hàng tại
                <b
                  style="
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                      Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                      'Segoe UI Emoji', 'Segoe UI Symbol';
                  "
                  ><a
                    style="
                      text-decoration: underline;
                      font-weight: 700;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                        Roboto, Helvetica, Arial, sans-serif,
                        'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
                      color: rgb(46, 46, 46);
                    "
                    href="https://www.watchstore.vn/"
                    rel="noreferrer"
                    target="_blank"
                    data-saferedirecturl="https://www.google.com/url?q=https://www.maisononline.vn/&amp;source=gmail&amp;ust=1714986643501000&amp;usg=AOvVaw2SyM9RnmQ56g4Ls43SlKWI"
                    >https://www.watchstore.vn</a
                  ></b
                >
              </p>
              <p
                style="
                  margin: 0px 0px 8px;
                  font-size: 14px;
                  font-weight: 400;
                  line-height: 18.2px;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                    Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                    'Segoe UI Emoji', 'Segoe UI Symbol';
                ">
                Chúng tôi xin thông báo, đơn hàng
                <b
                  style="
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                      Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                      'Segoe UI Emoji', 'Segoe UI Symbol';
                  "
                  >#${order?.id}</b
                >
                đã được đặt hàng.
                Thời gian giao hàng dự kiến: 2 - 3 ngày làm việc.
              </p>
              </p>
            </td>
          </tr>
        </tbody>
      </table>

      <table
        style="
          border-top-width: 1px;
          border-top-style: solid;
          padding: 16px 0px 0px;
          width: 100%;
          background: repeat white;
          border-collapse: separate;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
            'Segoe UI Symbol';
          border-top-color: rgb(247, 248, 249);
        ">
        <tbody
          style="
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
              Helvetica, Arial, sans-serif, 'Apple Color Emoji',
              'Segoe UI Emoji', 'Segoe UI Symbol';
          ">
          <tr
            style="
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                'Segoe UI Emoji', 'Segoe UI Symbol';
            ">
            <td
              style="
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                  Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                  'Segoe UI Emoji', 'Segoe UI Symbol';
              ">
              <div
                style="
                  width: 520px;
                  margin: 0px auto;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                    Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                    'Segoe UI Emoji', 'Segoe UI Symbol';
                ">
                <div
                  style="
                    padding: 16px;
                    background: repeat rgb(247, 248, 249);
                    display: grid;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                      Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                      'Segoe UI Emoji', 'Segoe UI Symbol';
                  ">
                  <div
                    style="
                      margin: 0px 0px 13px;
                      font-size: 14px;
                      font-weight: 700;
                      line-height: 18.2px;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                        Roboto, Helvetica, Arial, sans-serif,
                        'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
                    ">
                    Thông tin mua hàng
                  </div>
                  <div
                    style="
                      font-size: 14px;
                      line-height: 18.2px;
                      display: flex;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                        Roboto, Helvetica, Arial, sans-serif,
                        'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
                    ">
                    <p
                      style="
                        margin: 0px;
                        font-family: -apple-system, BlinkMacSystemFont,
                          'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
                          'Apple Color Emoji', 'Segoe UI Emoji',
                          'Segoe UI Symbol';
                      ">
                      Mã đơn hàng:
                      <b
                        style="
                          text-decoration: underline;
                          font-family: -apple-system, BlinkMacSystemFont,
                            'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
                            'Apple Color Emoji', 'Segoe UI Emoji',
                            'Segoe UI Symbol';
                        "
                        >#${order?.id}</b
                      >
                    </p>
                    <p
                      style="
                        margin: 0px 0px 0px auto;
                        font-family: -apple-system, BlinkMacSystemFont,
                          'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
                          'Apple Color Emoji', 'Segoe UI Emoji',
                          'Segoe UI Symbol';
                      ">
                    </p>
                  </div>
                  <div
                    style="
                      width: 100%;
                      float: left;
                      border-top-width: 1px;
                      border-top-style: dashed;
                      padding: 16px 0px 0px;
                      margin: 16px 0px 0px;
                      font-size: 14px;
                      line-height: 18.2px;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                        Roboto, Helvetica, Arial, sans-serif,
                        'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
                      border-top-color: rgb(134, 141, 149);
                    ">
                    <p
                      style="
                        margin: 0px 0px 8px;
                        font-family: -apple-system, BlinkMacSystemFont,
                          'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
                          'Apple Color Emoji', 'Segoe UI Emoji',
                          'Segoe UI Symbol';
                      ">
                      Thời gian đặt hàng:
                      <b
                        style="
                          font-family: -apple-system, BlinkMacSystemFont,
                            'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
                            'Apple Color Emoji', 'Segoe UI Emoji',
                            'Segoe UI Symbol';
                        "
                        >${moment(order?.createdAt).format(
                          "DD-MM-YYYY HH:mm:ss"
                        )}</b
                      >
                    </p>
                    <p
                      style="
                        margin: 0px 0px 8px;
                        font-family: -apple-system, BlinkMacSystemFont,
                          'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
                          'Apple Color Emoji', 'Segoe UI Emoji',
                          'Segoe UI Symbol';
                      ">
                      Phương thức thanh toán:
                      <b
                        style="
                          font-family: -apple-system, BlinkMacSystemFont,
                            'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
                            'Apple Color Emoji', 'Segoe UI Emoji',
                            'Segoe UI Symbol';
                        "
                        >${
                          order?.paymentType === "0"
                            ? "Thanh toán khi nhận hàng (COD)"
                            : "Thanh toán online qua ví VNPay"
                        }</b
                      >
                    </p>
                    <p
                      style="
                        margin: 0px 0px 8px;
                        font-family: -apple-system, BlinkMacSystemFont,
                          'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
                          'Apple Color Emoji', 'Segoe UI Emoji',
                          'Segoe UI Symbol';
                      ">
                      Trạng thái thanh toán:
                      <b
                        style="
                          font-family: -apple-system, BlinkMacSystemFont,
                            'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
                            'Apple Color Emoji', 'Segoe UI Emoji',
                            'Segoe UI Symbol';
                        "
                        >${
                          order?.paymentStatus === "paid"
                            ? "Đã thanh toán"
                            : "Chưa thanh toán"
                        }</b
                      >
                    </p>
                  </div>
                </div>
                <div
                  style="
                    padding: 16px;
                    background: repeat rgb(247, 248, 249);
                    display: grid;
                    margin: 16px 0px 0px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                      Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                      'Segoe UI Emoji', 'Segoe UI Symbol';
                  ">
                  <div
                    style="
                      margin: 0px;
                      font-size: 14px;
                      font-weight: 700;
                      line-height: 18.2px;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                        Roboto, Helvetica, Arial, sans-serif,
                        'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
                    ">
                    Địa chỉ giao hàng
                  </div>
                  <div
                    style="
                      width: 100%;
                      float: left;
                      border-top-width: 1px;
                      border-top-style: dashed;
                      padding: 16px 0px 0px;
                      margin: 16px 0px 0px;
                      font-size: 14px;
                      line-height: 18.2px;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                        Roboto, Helvetica, Arial, sans-serif,
                        'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
                      border-top-color: rgb(134, 141, 149);
                    ">
                    <p
                      style="
                        margin: 0px 0px 8px;
                        font-family: -apple-system, BlinkMacSystemFont,
                          'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
                          'Apple Color Emoji', 'Segoe UI Emoji',
                          'Segoe UI Symbol';
                      ">
                      Số điện thoại:
                      <b
                        style="
                          font-family: -apple-system, BlinkMacSystemFont,
                            'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
                            'Apple Color Emoji', 'Segoe UI Emoji',
                            'Segoe UI Symbol';
                        "
                        >${order?.phone}</b
                      >
                    </p>
                    <p
                      style="
                        margin: 0px 0px 8px;
                        font-family: -apple-system, BlinkMacSystemFont,
                          'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
                          'Apple Color Emoji', 'Segoe UI Emoji',
                          'Segoe UI Symbol';
                      ">
                      Người nhận:
                      <b
                        style="
                          font-family: -apple-system, BlinkMacSystemFont,
                            'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
                            'Apple Color Emoji', 'Segoe UI Emoji',
                            'Segoe UI Symbol';
                        "
                        >${order?.customerName}</b
                      >
                    </p>
                    <p
                      style="
                        margin: 0px;
                        font-family: -apple-system, BlinkMacSystemFont,
                          'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
                          'Apple Color Emoji', 'Segoe UI Emoji',
                          'Segoe UI Symbol';
                      ">
                      <a
                        style="
                          font-family: -apple-system, BlinkMacSystemFont,
                            'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
                            'Apple Color Emoji', 'Segoe UI Emoji',
                            'Segoe UI Symbol';
                        "
                        >${order?.receivedAddress}</a
                      >
                    </p>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <table
        style="
          padding: 32px 40px;
          width: 100%;
          border-top-width: 1px;
          border-top-style: solid;
          border-collapse: separate;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
            'Segoe UI Symbol';
          border-top-color: rgb(247, 248, 249);
        ">
        <tbody
          style="
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
              Helvetica, Arial, sans-serif, 'Apple Color Emoji',
              'Segoe UI Emoji', 'Segoe UI Symbol';
          ">
          <tr
            style="
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                'Segoe UI Emoji', 'Segoe UI Symbol';
            ">
            <td
              style="
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                  Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                  'Segoe UI Emoji', 'Segoe UI Symbol';
              ">
              <div
                style="
                  font-size: 16px;
                  font-style: normal;
                  font-weight: 700;
                  line-height: 20.8px;
                  text-transform: uppercase;
                  margin: 0px 0px 16px;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                    Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                    'Segoe UI Emoji', 'Segoe UI Symbol';
                ">
                THÔNG TIN ĐƠN HÀNG #${order?.id}
              </div>

              ${details}

              <div
                style="
                  margin: 16px 0px;
                  padding: 16px 0px 0px;
                  font-size: 16px;
                  font-weight: 700;
                  line-height: 20.8px;
                  text-transform: uppercase;
                  border-top-width: 1px;
                  border-top-style: solid;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                    Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                    'Segoe UI Emoji', 'Segoe UI Symbol';
                  border-top-color: rgb(247, 248, 249);
                ">
                Tổng quan đơn hàng
              </div>
              <div
                style="
                  margin: 0px 0px 16px;
                  display: flex;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                    Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                    'Segoe UI Emoji', 'Segoe UI Symbol';
                ">
                <span
                  style="
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                      Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                      'Segoe UI Emoji', 'Segoe UI Symbol';
                  ">
                  <b
                    style="
                      font-size: 14px;
                      font-weight: 700;
                      line-height: 18.2px;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                        Roboto, Helvetica, Arial, sans-serif,
                        'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
                    "
                    >Tổng giá trị đơn hàng
                  </b>
                </span>
                <span
                  style="
                    margin-left: auto;
                    font-size: 14px;
                    font-weight: 700;
                    line-height: 18.2px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                      Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                      'Segoe UI Emoji', 'Segoe UI Symbol';
                  "
                  >${formatPrice(order?.subtotalPrice)}đ</span
                >
              </div>

              <div
                style="
                  margin: 0px 0px 6px;
                  display: flex;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                    Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                    'Segoe UI Emoji', 'Segoe UI Symbol';
                ">
                <span
                  style="
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                      Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                      'Segoe UI Emoji', 'Segoe UI Symbol';
                  ">
                  <b
                    style="
                      font-size: 14px;
                      font-weight: 700;
                      line-height: 18.2px;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                        Roboto, Helvetica, Arial, sans-serif,
                        'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
                    "
                    >Phí vận chuyển</b
                  >
                </span>
                <span
                  style="
                    margin-left: auto;
                    font-size: 14px;
                    font-weight: 700;
                    line-height: 18.2px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                      Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                      'Segoe UI Emoji', 'Segoe UI Symbol';
                  "
                  >${formatPrice(order?.deliveryCharge)}đ</span
                >
              </div>
              <div
              style="
                margin: 0px 0px 16px;
                display: flex;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                  Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                  'Segoe UI Emoji', 'Segoe UI Symbol';
              ">
              <span
                style="
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                    Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                    'Segoe UI Emoji', 'Segoe UI Symbol';
                ">
                <b
                  style="
                    font-size: 14px;
                    font-weight: 700;
                    line-height: 18.2px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                      Roboto, Helvetica, Arial, sans-serif,
                      'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
                  "
                  >Khuyến mãi
                </b>
              </span>
              <span
                style="
                  margin-left: auto;
                  font-size: 14px;
                  font-weight: 700;
                  line-height: 18.2px;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                    Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                    'Segoe UI Emoji', 'Segoe UI Symbol';
                "
                >- ${
                  order?.couponCode ? formatPrice(amountOfDecreaseMoney) : 0
                }đ</span
              >
            </div>
              <div
                style="
                  font-size: 12px;
                  font-weight: 400;
                  line-height: 15.6px;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                    Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                    'Segoe UI Emoji', 'Segoe UI Symbol';
                "></div>
              <div
                style="
                  display: flex;
                  padding: 16px 0px 0px;
                  margin: 16px 0px 0px;
                  border-top-width: 1px;
                  border-top-style: solid;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                    Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                    'Segoe UI Emoji', 'Segoe UI Symbol';
                  border-top-color: rgb(247, 248, 249);
                ">
                <span
                  style="
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                      Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                      'Segoe UI Emoji', 'Segoe UI Symbol';
                  ">
                  <b
                    style="
                      font-size: 20px;
                      font-weight: 700;
                      line-height: 24px;
                      text-transform: uppercase;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                        Roboto, Helvetica, Arial, sans-serif,
                        'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
                    "
                    >THÀNH TIỀN</b
                  >
                  <span
                    style="
                      font-size: 16px;
                      font-weight: 400;
                      line-height: 20.8px;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                        Roboto, Helvetica, Arial, sans-serif,
                        'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
                    "
                    >(Đã bao gồm VAT)</span
                  >
                </span>
                <b
                  style="
                    margin-left: auto;
                    font-size: 20px;
                    font-weight: 700;
                    line-height: 24px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                      Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                      'Segoe UI Emoji', 'Segoe UI Symbol';
                  "
                  >${formatPrice(order.totalPrice)}đ</b
                >
              </div>
              <div
                style="
                  text-align: center;
                  margin: 24px 0px 0px;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                    Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                    'Segoe UI Emoji', 'Segoe UI Symbol';
                ">
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <table
        style="
          padding: 32px 40px;
          width: 100%;
          background: repeat rgb(247, 248, 249);
          border-collapse: separate;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
            'Segoe UI Symbol';
        ">
        <tbody
          style="
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
              Helvetica, Arial, sans-serif, 'Apple Color Emoji',
              'Segoe UI Emoji', 'Segoe UI Symbol';
          ">
          <tr
            style="
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                'Segoe UI Emoji', 'Segoe UI Symbol';
            ">
            <td
              style="
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                  Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                  'Segoe UI Emoji', 'Segoe UI Symbol';
              ">
              <div
                style="
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                    Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                    'Segoe UI Emoji', 'Segoe UI Symbol';
                "></div>
              <div
                style="
                  font-size: 14px;
                  font-weight: 400;
                  line-height: 18.2px;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                    Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                    'Segoe UI Emoji', 'Segoe UI Symbol';
                ">
                <p
                  style="
                    margin: 0px 0px 8px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                      Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                      'Segoe UI Emoji', 'Segoe UI Symbol';
                  ">
                  Mọi thắc mắc và góp ý, xin Quý khách vui lòng liên hệ với
                  chúng tôi qua:
                </p>
                <p
                  style="
                    margin: 0px 0px 8px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                      Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                      'Segoe UI Emoji', 'Segoe UI Symbol';
                  ">
                  <b
                    style="
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                        Roboto, Helvetica, Arial, sans-serif,
                        'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
                    "
                    >Hotline:</b
                  >
                  <a
                    style="
                      text-decoration: none;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                        Roboto, Helvetica, Arial, sans-serif,
                        'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
                      color: rgb(46, 46, 46);
                    "
                    rel="noreferrer"
                    >0931892222</a
                  >
                </p>
                <p
                  style="
                    margin: 0px 0px 8px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                      Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                      'Segoe UI Emoji', 'Segoe UI Symbol';
                  ">
                  <b
                    style="
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                        Roboto, Helvetica, Arial, sans-serif,
                        'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
                    "
                    >Email:</b
                  >
                  <a
                    style="
                      text-decoration: underline;
                      font-weight: 700;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                        Roboto, Helvetica, Arial, sans-serif,
                        'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
                      color: rgb(46, 46, 46);
                    "
                    href="mailto:info@watchstore.vn"
                    rel="noreferrer"
                    target="_blank"
                    >info@watchstore.vn</a
                  >
                </p>
                <p
                  style="
                    margin: 0px 0px 8px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                      Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                      'Segoe UI Emoji', 'Segoe UI Symbol';
                  ">
                  <b
                    style="
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                        Roboto, Helvetica, Arial, sans-serif,
                        'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
                    "
                    >Địa chỉ:</b
                  >
                  <a
                    href="https://www.google.com/maps/search/189+D%C6%B0%C6%A1ng+B%C3%A1+Tr%E1%BA%A1c,+Ph%C6%B0%E1%BB%9Dng+1,+Qu%E1%BA%ADn+8,+TP.+HCM?entry=gmail&amp;source=g"
                    style="
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                        Roboto, Helvetica, Arial, sans-serif,
                        'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
                    "
                    rel="noreferrer"
                    target="_blank"
                    data-saferedirecturl="https://www.google.com/url?q=https://www.google.com/maps/search/189%2BD%25C6%25B0%25C6%25A1ng%2BB%25C3%25A1%2BTr%25E1%25BA%25A1c,%2BPh%25C6%25B0%25E1%25BB%259Dng%2B1,%2BQu%25E1%25BA%25ADn%2B8,%2BTP.%2BHCM?entry%3Dgmail%26source%3Dg&amp;source=gmail&amp;ust=1714986643502000&amp;usg=AOvVaw0T2UHSn0q22xa_OL5Fy9Dc"
                    >97 Trần Đại Nghĩa, P. Bách Khoa, Hai Bà Trưng, Hà Nội</a
                  >
                </p>
                <p
                  style="
                    margin: 0px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                      Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                      'Segoe UI Emoji', 'Segoe UI Symbol';
                  ">
                  Watch Store trân trọng cảm ơn và rất hân hạnh được phục vụ
                  Quý khách.
                </p>
              </div>
              <div
                style="
                  border-top-width: 1px;
                  border-top-style: solid;
                  padding: 16px 0px 0px;
                  margin: 16px 0px 0px;
                  display: flex;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
                    Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
                    'Segoe UI Emoji', 'Segoe UI Symbol';
                  border-top-color: rgb(240, 240, 240);
                "></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </body>
</html>
`;
}

export function listProductTemplate(item: OrderDetail) {
  const image = cloudinary.url(item.productCoverImage);
  return `
  <div
    style="
      display: flex;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
        Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
        'Segoe UI Emoji', 'Segoe UI Symbol';
    ">
    <div
      style="
        width: 100px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
          Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
          'Segoe UI Emoji', 'Segoe UI Symbol';
      ">
      <img
        style="
          width: 100px;
          height: 110px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
            Roboto, Helvetica, Arial, sans-serif,
            'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
        "
        src="${image ? image : ""}"
        class="CToWUd"
        data-bit="iit" />
    </div>
    <div
      style="
        padding: 0px 16px;
        width: calc(90% - 100px);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
          Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
          'Segoe UI Emoji', 'Segoe UI Symbol';
      ">
      <div
        style="
          font-size: 16px;
          font-weight: 700;
          line-height: 20.8px;
          text-transform: uppercase;
          margin: 0px 0px 2px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
            Roboto, Helvetica, Arial, sans-serif,
            'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
        ">
        ${item?.categoryName ? item.categoryName : ""}
      </div>
      <div
        style="
          font-size: 14px;
          font-weight: 400;
          line-height: 18.2px;
          margin: 0px 0px 2px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
            Roboto, Helvetica, Arial, sans-serif,
            'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
        ">
        ${item?.productName ? item.productName : ""}
      </div>
      <div
        style="
          font-size: 12px;
          font-weight: 400;
          line-height: 15.6px;
          margin: 0px 0px 10px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
            Roboto, Helvetica, Arial, sans-serif,
            'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
        ">
        (${item?.productSizeName ? item.productSizeName : ""})
      </div>
      <div
        style="
          font-size: 16px;
          font-style: normal;
          font-weight: 700;
          line-height: 20.8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
            Roboto, Helvetica, Arial, sans-serif,
            'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
        ">
        ${formatPrice(item?.priceAtPurchase ? item.priceAtPurchase : 0)}đ
      </div>
    </div>
    <div
      style="
        width: 10%;
        text-align: right;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
          Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
          'Segoe UI Emoji', 'Segoe UI Symbol';
      ">
      <span
        style="
          font-size: 14px;
          font-weight: 700;
          line-height: 18.2px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
            Roboto, Helvetica, Arial, sans-serif,
            'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
        "
        >x ${item?.quality ? item.quality : ""}</span
      >
    </div>
    </div>
    <div
    style="
      margin: 16px 0px 0px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
        Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
        'Segoe UI Emoji', 'Segoe UI Symbol';
    "></div>
`;
}
