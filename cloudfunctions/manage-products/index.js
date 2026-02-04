// cloudfunctions/manage-products/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

/**
 * Action Types:
 * - GET_ALL: 获取所有方子和款式
 * - ADD_RECIPE: 添加方子
 * - UPDATE_RECIPE: 更新方子
 * - ADD_STYLE: 添加款式
 * - UPDATE_STYLE: 更新款式
 */
exports.main = async (event, context) => {
  const { action, data } = event;

  switch (action) {
    case 'GET_ALL':
      const recipes = await db.collection('recipes').get();
      const styles = await db.collection('styles').get();
      return {
        recipes: recipes.data,
        styles: styles.data
      };

    case 'ADD_RECIPE':
      return await db.collection('recipes').add({
        data: {
          ...data,
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      });

    case 'UPDATE_RECIPE':
      const { _id, ...updateData } = data;
      return await db.collection('recipes').doc(_id).update({
        data: {
          ...updateData,
          updatedAt: db.serverDate()
        }
      });

    case 'ADD_STYLE':
      return await db.collection('styles').add({
        data: {
          ...data,
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      });

    case 'UPDATE_STYLE':
      const { _id: styleId, ...styleUpdateData } = data;
      return await db.collection('styles').doc(styleId).update({
        data: {
          ...styleUpdateData,
          updatedAt: db.serverDate()
        }
      });

    default:
      return {
        success: false,
        message: 'Unknown action'
      };
  }
};
