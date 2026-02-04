/// <reference types="miniprogram-api-typings" />

import { User } from './utils/types';

interface IAppOption {
  globalData: {
    userInfo?: User | null,
  }
}
