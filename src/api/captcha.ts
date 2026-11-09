import { http } from "@/utils/http";

/** 验证码错误或过期的统一错误码，与 mock 接口保持一致 */
export const CAPTCHA_ERROR_CODE = 4001;

export type CaptchaResult = {
  success: boolean;
  code?: number;
  message?: string;
  data: {
    /** 验证码图片，带 `data:image/png;base64,` 前缀，可直接作为图片地址使用 */
    captchaImage: string;
    /** 本次验证码的唯一标识，登录时回传用于定位正确答案 */
    captchaId: string;
  };
};

/** 获取图形验证码（无需登录态） */
export const getCaptcha = () => {
  return http.request<CaptchaResult>("get", "/captcha");
};
