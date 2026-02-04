// cloudfunctions/manage-users/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

/**
 * Action Types:
 * - LOGIN: 用户登录/更新信息 (如果用户不存在则创建，存在则更新)
 * - GET_USER: 获取当前用户信息
 */
exports.main = async (event, context) => {
  const { action, data } = event;
  const { OPENID } = cloud.getWXContext();

  switch (action) {
    case 'LOGIN':
      // data: { nickName, avatarUrl }
      const { nickName, avatarUrl } = data;
      
      // 检查用户是否存在
      const userRes = await db.collection('users').doc(OPENID).get().catch(() => null);
      
      if (userRes && userRes.data) {
        // 更新用户
        await db.collection('users').doc(OPENID).update({
          data: {
            nickName,
            avatarUrl,
            updatedAt: db.serverDate()
          }
        });
        return { ...userRes.data, nickName, avatarUrl }; // 返回最新信息
      } else {
        // 创建新用户
        // 默认 isAdmin 为 false。如果需要设置管理员，请在数据库控制台手动修改该字段
        const newUser = {
          _id: OPENID,
          nickName,
          avatarUrl,
          isAdmin: false,
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
        };
        await db.collection('users').add({ data: newUser });
        return newUser;
      }

    case 'GET_USER':
      const res = await db.collection('users').doc(OPENID).get().catch(() => null);
      return res ? res.data : null;

    default:
      return { success: false, message: 'Unknown action' };
  }
};
