<script setup lang="ts">
import Motion from "./utils/motion";
import { useRouter } from "vue-router";
import { message } from "@/utils/message";
import { loginRules } from "./utils/rule";
import { ref, reactive, toRaw, onMounted } from "vue";
import { getCaptcha, CAPTCHA_ERROR_CODE } from "@/api/captcha";
import { debounce } from "@pureadmin/utils";
import { useNav } from "@/layout/hooks/useNav";
import { useEventListener } from "@vueuse/core";
import type { FormInstance } from "element-plus";
import { useLayout } from "@/layout/hooks/useLayout";
import { useUserStoreHook } from "@/store/modules/user";
import { initRouter, getTopMenu } from "@/router/utils";
import { bg, avatar, illustration } from "./utils/static";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";

import dayIcon from "@/assets/svg/day.svg?component";
import darkIcon from "@/assets/svg/dark.svg?component";
import Lock from "~icons/ri/lock-fill";
import User from "~icons/ri/user-3-fill";
import ShieldKeyhole from "~icons/ri/shield-keyhole-line";

defineOptions({
  name: "Login"
});

const router = useRouter();
const loading = ref(false);
const disabled = ref(false);
const ruleFormRef = ref<FormInstance>();

const { initStorage } = useLayout();
initStorage();

const { dataTheme, overallStyle, dataThemeChange } = useDataThemeChange();
dataThemeChange(overallStyle.value);
const { title } = useNav();

const ruleForm = reactive({
  username: "admin",
  password: "admin123",
  captchaCode: ""
});

/** 验证码图片、唯一标识及加载状态 */
const captcha = reactive({
  image: "",
  id: "",
  loading: false,
  failed: false
});

/** 获取验证码；刷新时同步清空已输入的验证码 */
const fetchCaptcha = async () => {
  captcha.loading = true;
  captcha.failed = false;
  captcha.image = "";
  captcha.id = "";
  ruleForm.captchaCode = "";
  try {
    const res = await getCaptcha();
    if (res?.success && res.data?.captchaImage && res.data?.captchaId) {
      captcha.image = res.data.captchaImage;
      captcha.id = res.data.captchaId;
    } else {
      throw new Error(res?.message ?? "验证码加载失败");
    }
  } catch {
    captcha.failed = true;
    message("验证码加载失败，点击重试", { type: "warning" });
  } finally {
    captcha.loading = false;
  }
};

onMounted(fetchCaptcha);

const onLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  const valid = await formEl.validate().catch(() => false);
  if (!valid) return;
  if (!captcha.id) {
    message("请先获取验证码", { type: "warning" });
    return;
  }
  loading.value = true;
  try {
    const res = await useUserStoreHook().loginByUsername({
      username: ruleForm.username,
      password: ruleForm.password,
      captchaId: captcha.id,
      captchaCode: ruleForm.captchaCode
    });
    if (res.success) {
      // 获取后端路由
      await initRouter();
      disabled.value = true;
      router
        .push(getTopMenu(true).path)
        .then(() => {
          message("登录成功", { type: "success" });
        })
        .finally(() => (disabled.value = false));
    } else {
      message(
        res.code === CAPTCHA_ERROR_CODE
          ? "验证码错误或已过期，请重新输入"
          : "登录失败",
        { type: "error" }
      );
      // 验证码一次性使用，登录失败后需要重新获取
      fetchCaptcha();
    }
  } catch {
    message("登录失败，请稍后重试", { type: "error" });
    fetchCaptcha();
  } finally {
    loading.value = false;
  }
};

const immediateDebounce: any = debounce(
  formRef => onLogin(formRef),
  1000,
  true
);

useEventListener(document, "keydown", ({ code }) => {
  if (
    ["Enter", "NumpadEnter"].includes(code) &&
    !disabled.value &&
    !loading.value
  )
    immediateDebounce(ruleFormRef.value);
});
</script>

<template>
  <div class="select-none">
    <img :src="bg" class="wave" />
    <div class="flex-c absolute right-5 top-3">
      <!-- 主题 -->
      <el-switch
        v-model="dataTheme"
        inline-prompt
        :active-icon="dayIcon"
        :inactive-icon="darkIcon"
        @change="dataThemeChange"
      />
    </div>
    <div class="login-container">
      <div class="img">
        <component :is="toRaw(illustration)" />
      </div>
      <div class="login-box">
        <div class="login-form">
          <avatar class="avatar" />
          <Motion>
            <h2 class="outline-hidden">{{ title }}</h2>
          </Motion>

          <el-form
            ref="ruleFormRef"
            :model="ruleForm"
            :rules="loginRules"
            size="large"
          >
            <Motion :delay="100">
              <el-form-item
                :rules="[
                  {
                    required: true,
                    message: '请输入账号',
                    trigger: 'blur'
                  }
                ]"
                prop="username"
              >
                <el-input
                  v-model="ruleForm.username"
                  clearable
                  placeholder="账号"
                  :prefix-icon="useRenderIcon(User)"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="150">
              <el-form-item prop="password">
                <el-input
                  v-model="ruleForm.password"
                  clearable
                  show-password
                  placeholder="密码"
                  :prefix-icon="useRenderIcon(Lock)"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="200">
              <el-form-item prop="captchaCode">
                <div class="captcha-row">
                  <el-input
                    v-model="ruleForm.captchaCode"
                    clearable
                    maxlength="4"
                    placeholder="验证码"
                    :prefix-icon="useRenderIcon(ShieldKeyhole)"
                  />
                  <button
                    type="button"
                    class="captcha-image"
                    :disabled="captcha.loading"
                    :title="
                      captcha.failed
                        ? '验证码加载失败，点击重试'
                        : '点击刷新验证码'
                    "
                    :aria-label="
                      captcha.failed
                        ? '验证码加载失败，点击重试'
                        : '点击刷新验证码'
                    "
                    @click="fetchCaptcha"
                  >
                    <img
                      v-if="captcha.image"
                      :src="captcha.image"
                      alt="验证码"
                    />
                    <span v-else class="captcha-tip">
                      {{ captcha.loading ? "加载中…" : "点击重试" }}
                    </span>
                  </button>
                </div>
              </el-form-item>
            </Motion>

            <Motion :delay="250">
              <el-button
                class="w-full mt-4!"
                size="default"
                type="primary"
                :loading="loading"
                :disabled="disabled"
                @click="onLogin(ruleFormRef)"
              >
                登录
              </el-button>
            </Motion>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("@/style/login.css");
</style>

<style lang="scss" scoped>
:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}

.captcha-row {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;

  :deep(.el-input) {
    flex: 1;
  }
}

.captcha-image {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 40px;
  padding: 0;
  overflow: hidden;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  background: #f2f5f9;
  border: 0;
  border-radius: 4px;
  box-shadow: 0 0 0 1px var(--el-border-color) inset;
  transition: box-shadow 0.2s;

  &:hover:not(:disabled) {
    box-shadow: 0 0 0 1px var(--el-color-primary) inset;
  }

  &:disabled {
    cursor: wait;
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
