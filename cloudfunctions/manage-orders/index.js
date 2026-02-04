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
      // 使用 aggregate 进行联表查询，关联 users 集合
      const ordersRes = await db.collection('orders').aggregate()
        .lookup({
          from: 'users',
          localField: '_openid',
          foreignField: '_id',
          as: 'userList'
        })
        .replaceRoot({
          newRoot: $.mergeObjects([$.arrayElemAt(['$userList', 0]), '$$ROOT'])
        })
        .project({
          // userList: 0, // 移除不需要的字段，避免混合 projection
          // 显式指定所有需要的字段
          _id: 1,
          userInfo: {
            nickName: '$nickName',
            avatarUrl: '$avatarUrl'
          },
          recipe: 1,
          style: 1,
          quantity: 1,
          originalPrice: 1,
          finalPrice: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          expressCompany: 1,
          expressNumber: 1
        })
        .sort({ createdAt: -1 })
        .limit(100) // 限制返回数量，避免超出限制
        .end();

      // 如果查询结果为空，list 可能是 undefined 或空数组
      const orderList = ordersRes.list || [];

      // 处理头像 URL：将 cloud:// 或 wxfile:// 转换为 http 链接（仅限 cloud://）
      // 注意：wxfile:// 是本地临时路径，云端无法转换，只能依赖前端上传 cloudPath 后获取的 cloudID
      // 这里主要处理 cloudID 的换取
      const fileList = orderList
        .filter(item => item.userInfo && item.userInfo.avatarUrl && item.userInfo.avatarUrl.startsWith('cloud://'))
        .map(item => item.userInfo.avatarUrl);

      let tempFileMap = {};
      if (fileList.length > 0) {
        const result = await cloud.getTempFileURL({ fileList });
        result.fileList.forEach(file => {
          tempFileMap[file.fileID] = file.tempFileURL;
        });
      }

      const finalOrders = orderList.map(order => {
        if (order.userInfo && order.userInfo.avatarUrl) {
          // 如果是 cloudID，替换为临时 HTTP 链接
          if (tempFileMap[order.userInfo.avatarUrl]) {
            order.userInfo.avatarUrl = tempFileMap[order.userInfo.avatarUrl];
          }
        }
        return order;
      });

      return { data: finalOrders };

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
