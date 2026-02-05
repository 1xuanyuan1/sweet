// miniprogram/utils/cloud.ts
import { request } from './request';

// 兼容旧代码的 callCloud 函数，实际上现在走自建后端
export const callCloud = async (name: string, action: string, data?: any) => {
  console.log(`[Mock Cloud] Calling ${name}.${action}`, data);
  
  if (name === 'manage-orders') {
    if (action === 'CUSTOMER_GET_ALL') {
      return {
        result: {
          data: await request({ url: '/orders/my' })
        }
      };
    } else if (action === 'UPDATE_STATUS') {
        // data: { orderId, status }
        return {
            result: await request({
                url: `/orders/admin/${data.orderId}/status`, // 注意：前端调用的确认价格其实是确认状态
                method: 'PUT',
                data: { status: data.status }
            })
        }
    }
  }
  
  throw new Error(`Unknown cloud function call: ${name}.${action}`);
};
