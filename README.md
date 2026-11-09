<h1>vue-pure-admin精简版（非国际化版本）</h1>

[![license](https://img.shields.io/github/license/pure-admin/vue-pure-admin.svg)](LICENSE)

**中文** | [English](./README.en-US.md)

## 介绍

精简版是基于 [vue-pure-admin](https://github.com/pure-admin/vue-pure-admin) 提炼出的架子，包含主体功能，更适合实际项目开发，打包后的大小在全局引入 [element-plus](https://element-plus.org) 的情况下仍然低于 `2.3MB`，并且会永久同步完整版的代码。开启 `brotli` 压缩和 `cdn` 替换本地库模式后，打包大小低于 `350kb`

## 登录密码加密传输

登录密码不再明文提交，前端按以下流程处理：

1. 请求 `GET /login/publicKey` 获取后端 RSA 公钥，响应结构：

   ```json
   {
     "success": true,
     "data": {
       "publicKey": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
     }
   }
   ```

2. 使用公钥按 RSA PKCS#1 v1.5 加密密码（UTF-8），密文再做 base64 编码。
3. `POST /login` 提交 `{ "username": "admin", "password": "<base64 密文>" }`，后端使用对应私钥解密后再校验密码。

约定与注意：

- 公钥同时支持 PEM 格式和纯 base64 公钥体，接口地址在 `src/api/user.ts` 中；后端路径不同时修改 `getLoginPublicKey` 即可。
- 登录密码规则：8-18 位，且必须同时包含大写字母、小写字母和特殊符号；登录页默认演示密码为 `Admin@12`。
- 后端需使用 `RSA/ECB/PKCS1Padding`（PKCS#1 v1.5）解密，不是 OAEP。
- 本地开发由 `mock/login.ts` 返回演示公钥并校验提交的是 RSA 密文（不持有私钥，也不校验密码内容）；接入真实后端后以真实公钥为准。
- 公钥加密只保护密码在请求体中的传输，仍需部署 HTTPS，否则公钥接口可能被中间人替换，无法从根本上防止窃听和篡改。

## 版本选择

当前是非国际化版本，如果您需要国际化版本 [请点击](https://github.com/pure-admin/pure-admin-thin/tree/i18n)

## 配套视频

[点我查看 UI 设计](https://www.bilibili.com/video/BV17g411T7rq)  
[点我查看快速开发教程](https://www.bilibili.com/video/BV1kg411v7QT)

## 配套保姆级文档

[点我查看 vue-pure-admin 文档](https://pure-admin.cn/)  
[点我查看 @pureadmin/utils 文档](https://pure-admin-utils.netlify.app)

## 高级服务

[点我查看详情](https://pure-admin.cn/pages/service/)

## 预览

[查看预览](https://pure-admin-thin.netlify.app/#/login)

## 维护者

[xiaoxian521](https://github.com/xiaoxian521)

## ⚠️ 注意

精简版不接受任何 `issues` 和 `pr`，如果有问题请到完整版 [issues](https://github.com/pure-admin/vue-pure-admin/issues/new/choose) 去提，谢谢！

## 许可证

[MIT © 2020-present, pure-admin](./LICENSE)
