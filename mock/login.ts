// 根据角色动态生成路由
import { defineFakeRoute } from "vite-plugin-fake-server/client";

/**
 * 演示用公钥，只用于让本地 mock 环境与真实后端的公钥接口保持一致的响应结构。
 * mock 不持有私钥、不校验密码内容，真实后端需使用自己的私钥解密。
 * 接入真实后端时，以真实后端返回的公钥为准。
 */
const MOCK_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoHJic+4dRmaQRSyLW9t/
myL4C709UmAXNIFSsaLjuCZb59HKZmreHxxXUcTTSkVFae4ZeQV9blw6sgPtDCmq
MyKHSq3O+L7Khbe8Wyqjf2bEHNhDL0CjejQMmlieVz84KT0vrs/7a4ljqnVHGtWn
0IYjxlh7v+a+Yke68KOzVqVee+vHGrC9phiih4YWp/nT+YwP34tABMHGC2XmDXQI
yDvbZPlDbfgiZh3NwqKuOzO/O79xi9JeZ520297frpf2A/YbUTVpsVYqjTq4ABhy
ZUEvYhjn102/YI20Lbs5wF6SRhNj/aJbiApd9uDb5jDTa88iNa8sZ754JmvQxpYC
TQIDAQAB
-----END PUBLIC KEY-----`;

/** RSA 2048 位 PKCS#1 v1.5 密文经 base64 编码后固定为 344 个字符 */
const RSA_CIPHERTEXT_LENGTH = 344;

/** 确认登录密码是公钥加密后的 base64 密文，而不是明文 */
const isEncryptedPassword = (password: unknown): boolean =>
  typeof password === "string" &&
  password.length === RSA_CIPHERTEXT_LENGTH &&
  /^[A-Za-z0-9+/]+={0,2}$/.test(password);

export default defineFakeRoute([
  {
    url: "/login/publicKey",
    method: "get",
    response: () => ({
      success: true,
      data: { publicKey: MOCK_PUBLIC_KEY }
    })
  },
  {
    url: "/login",
    method: "post",
    response: ({ body }) => {
      // 只接受公钥加密后的密码，避免 mock 环境出现明文登录
      if (!isEncryptedPassword(body?.password)) {
        return {
          success: false,
          data: {}
        };
      }
      if (body.username === "admin") {
        return {
          success: true,
          data: {
            avatar: "https://avatars.githubusercontent.com/u/44761321",
            username: "admin",
            nickname: "小铭",
            // 一个用户可能有多个角色
            roles: ["admin"],
            // 按钮级别权限
            permissions: ["*:*:*"],
            accessToken: "eyJhbGciOiJIUzUxMiJ9.admin",
            refreshToken: "eyJhbGciOiJIUzUxMiJ9.adminRefresh",
            expires: "2030/10/30 00:00:00"
          }
        };
      } else {
        return {
          success: true,
          data: {
            avatar: "https://avatars.githubusercontent.com/u/52823142",
            username: "common",
            nickname: "小林",
            roles: ["common"],
            permissions: ["permission:btn:add", "permission:btn:edit"],
            accessToken: "eyJhbGciOiJIUzUxMiJ9.common",
            refreshToken: "eyJhbGciOiJIUzUxMiJ9.commonRefresh",
            expires: "2030/10/30 00:00:00"
          }
        };
      }
    }
  }
]);
