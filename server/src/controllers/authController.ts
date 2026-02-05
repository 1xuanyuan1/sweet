import { Request, Response } from 'express';
import axios from 'axios';
import User from '../models/User';
import jwt from 'jsonwebtoken';

const WX_API_URL = 'https://api.weixin.qq.com/sns/jscode2session';

export const login = async (req: Request, res: Response) => {
    try {
        const { code, userInfo } = req.body;

        if (!code) {
            res.status(400).json({ error: 'Code is required' });
            return;
        }

        const appId = process.env.WX_APP_ID;
        const secret = process.env.WX_APP_SECRET;

        if (!appId || !secret) {
             res.status(500).json({ error: 'Server configuration error' });
             return;
        }

        const response = await axios.get(WX_API_URL, {
            params: {
                appid: appId,
                secret: secret,
                js_code: code,
                grant_type: 'authorization_code'
            }
        });

        const { openid, session_key, errcode, errmsg } = response.data;

        if (errcode) {
             res.status(400).json({ error: errmsg || 'WeChat login failed' });
             return;
        }

        let user = await User.findOne({ openid });

        if (!user) {
            user = new User({
                openid,
                nickName: userInfo?.nickName || '微信用户',
                avatarUrl: userInfo?.avatarUrl || ''
            });
        } else if (userInfo) {
            user.nickName = userInfo.nickName;
            user.avatarUrl = userInfo.avatarUrl;
        }

        await user.save();

        // Generate JWT
        const token = jwt.sign({ id: user._id, openid: user.openid, isAdmin: user.isAdmin }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '7d'
        });

        res.json({
            token,
            user,
            openid // Frontend might expect openid
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getMe = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const user = await User.findById(userId);
    res.json(user);
};
