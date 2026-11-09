import { CAPTCHA_IMAGE } from "./captcha-image";

/** 验证码有效期（毫秒），过期后需要重新获取 */
const CAPTCHA_TTL = 2 * 60 * 1000;

/** 固定验证码答案：只保存在 mock 服务端，接口响应中不会返回 */
const CAPTCHA_ANSWER = "A7K9";

/** 验证码错误或过期的统一错误码，前端据此自动刷新验证码 */
export const CAPTCHA_ERROR_CODE = 4001;

/** 缓存上限，避免 mock 服务长时间运行时无限增长 */
const MAX_CAPTCHA_COUNT = 500;

type CaptchaRecord = { answer: string; expiresAt: number };

/**
 * mock 文件会被分别打包加载，这里借助 `globalThis` 让 `/captcha` 与 `/login`
 * 两个 mock 文件共享同一份验证码缓存。
 */
const globalStore = globalThis as typeof globalThis & {
  __ADMIN_UI_CAPTCHA_STORE__?: Map<string, CaptchaRecord>;
};
const captchaStore =
  globalStore.__ADMIN_UI_CAPTCHA_STORE__ ??
  (globalStore.__ADMIN_UI_CAPTCHA_STORE__ = new Map<string, CaptchaRecord>());

function createCaptchaId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `captcha-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

/** 清理已过期的验证码 */
function clearExpiredCaptcha(now: number) {
  for (const [captchaId, item] of captchaStore) {
    if (item.expiresAt <= now) captchaStore.delete(captchaId);
  }
}

/** 生成并缓存一个验证码，返回图片和唯一标识（不包含正确答案） */
export function issueCaptcha() {
  const now = Date.now();
  clearExpiredCaptcha(now);
  while (captchaStore.size >= MAX_CAPTCHA_COUNT) {
    const oldestCaptchaId = captchaStore.keys().next().value;
    if (!oldestCaptchaId) break;
    captchaStore.delete(oldestCaptchaId);
  }
  const captchaId = createCaptchaId();
  captchaStore.set(captchaId, {
    answer: CAPTCHA_ANSWER,
    expiresAt: now + CAPTCHA_TTL
  });
  return { captchaImage: CAPTCHA_IMAGE, captchaId };
}

/**
 * 取出并立即作废验证码（一次性校验），比较时忽略大小写。
 * 无论校验成功还是失败，该 `captchaId` 都会失效，杜绝重放。
 */
export function verifyCaptcha(captchaId?: string, captchaCode?: string) {
  if (!captchaId) return false;
  const item = captchaStore.get(captchaId);
  captchaStore.delete(captchaId);
  if (!item || item.expiresAt <= Date.now()) return false;
  if (typeof captchaCode !== "string") return false;
  return item.answer.toLowerCase() === captchaCode.trim().toLowerCase();
}
