// app.ts
App<IAppOption>({
  globalData: {},
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        // 1. 若不填，则使用默认环境（第一个创建的环境）
        // 2. 也可以填入具体的环境 ID，例如 'prod-123456'
        env: undefined, 
        traceUser: true,
      });
    }
  },
});
