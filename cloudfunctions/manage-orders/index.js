// cloudfunctions/manage-orders/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

/**
 * Action Types:
 * - CREATE: 客户创建订单
 * - ADMIN_GET_ALL: 管理员获取所有订单
 * - CUSTOMER_GET_ALL: 客户获取自己的订单
 * - UPDATE_STATUS: 更新订单状态
 * - UPDATE_PRICE: 管理员修改价格
 * - GET_STATS: 获取月度统计
 */
exports.main = async (event, context) => {
  const { action, data } = event;
  const { OPENID } = cloud.getWXContext();

  switch (action) {
    case 'CREATE':
      return await db.collection('orders').add({
        data: {
          ...data,
          _openid: OPENID,
          status: 'pending',
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      });

    case 'ADMIN_GET_ALL':
      // 简单起见，这里不处理分页，实际应处理
      return await db.collection('orders').orderBy('createdAt', 'desc').get();

    case 'CUSTOMER_GET_ALL':
      return await db.collection('orders')
        .where({ _openid: OPENID })
        .orderBy('createdAt', 'desc')
        .get();

    case 'UPDATE_STATUS':
      return await db.collection('orders').doc(data.orderId).update({
        data: {
          status: data.status,
          expressCompany: data.expressCompany || '',
          expressNumber: data.expressNumber || '',
          updatedAt: db.serverDate()
        }
      });

    case 'UPDATE_PRICE':
      return await db.collection('orders').doc(data.orderId).update({
        data: {
          finalPrice: data.finalPrice,
          status: 'wait_confirm', // 改价后进入待客户确认状态
          updatedAt: db.serverDate()
        }
      });

    case 'GET_STATS':
      // 按月统计订单
      const stats = await db.collection('orders').aggregate()
        .project({
          month: $.dateToString({
            date: '$createdAt',
            format: '%Y-%m'
          }),
          finalPrice: 1,
          status: 1
        })
        .group({
          _id: '$month',
          totalOrders: $.sum(1),
          totalAmount: $.sum('$finalPrice'),
          paidAmount: $.sum(
            $.cond({
              if: $.in(['$status', ['paid', 'producing', 'shipped', 'received']]),
              then: '$finalPrice',
              else: 0
            })
          ),
          pendingAmount: $.sum(
            $.cond({
              if: $.in(['$status', ['pending', 'wait_confirm', 'confirmed']]),
              then: '$finalPrice',
              else: 0
            })
          )
        })
        .sort({ _id: -1 })
        .end();
      return stats;

    default:
      return { success: false, message: 'Unknown action' };
  }
};
