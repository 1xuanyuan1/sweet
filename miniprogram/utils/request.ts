export const API_BASE_URL = "https://api.dduke.cn/api";

export const request = <T>(
  options: WechatMiniprogram.RequestOption,
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync("token");
    const header = {
      ...options.header,
      Authorization: token ? `Bearer ${token}` : "",
    };

    wx.request({
      ...options,
      url: `${API_BASE_URL}${options.url}`,
      header,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as T);
        } else if (res.statusCode === 401) {
          wx.removeStorageSync("token");
          wx.showModal({
            title: "提示",
            content: "请先登录",
            showCancel: false,
            success: (modalRes) => {
              if (modalRes.confirm) {
                wx.navigateTo({
                  url: "/pages/login/login",
                });
              }
            },
          });
          reject(res.data);
        } else {
          reject(res.data);
        }
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
};

export const uploadFile = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync("token");
    wx.uploadFile({
      url: `${API_BASE_URL}/upload`,
      filePath,
      name: "file",
      header: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      success(res) {
        if (res.statusCode === 200) {
          const data = JSON.parse(res.data);
          resolve(data.url);
        } else if (res.statusCode === 401) {
          wx.removeStorageSync("token");
          wx.showModal({
            title: "提示",
            content: "请先登录",
            showCancel: false,
            success: (modalRes) => {
              if (modalRes.confirm) {
                wx.navigateTo({
                  url: "/pages/login/login",
                });
              }
            },
          });
          reject(new Error("Unauthorized"));
        } else {
          reject(new Error("Upload failed"));
        }
      },
      fail(err) {
        reject(err);
      },
    });
  });
};
