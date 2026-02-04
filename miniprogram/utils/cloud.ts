// miniprogram/utils/cloud.ts

export const callCloud = async (name: string, action: string, data?: any) => {
  try {
    const res = await wx.cloud.callFunction({
      name,
      data: { action, data }
    });
    return res.result;
  } catch (err) {
    console.error(`Cloud function ${name} [${action}] failed:`, err);
    throw err;
  }
};
