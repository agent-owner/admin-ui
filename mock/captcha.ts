import { defineFakeRoute } from "vite-plugin-fake-server/client";
import { issueCaptcha } from "./shared/captcha";

export default defineFakeRoute([
  {
    url: "/captcha",
    method: "get",
    response: () => {
      // 响应中只返回图片和标识，绝不返回正确答案
      return {
        success: true,
        data: issueCaptcha()
      };
    }
  }
]);
