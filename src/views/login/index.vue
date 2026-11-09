<script setup lang="ts">
import Motion from "./utils/motion";
import { useRouter } from "vue-router";
import { message } from "@/utils/message";
import { loginRules } from "./utils/rule";
import { ref, reactive, toRaw } from "vue";
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
import WechatIcon from "@/assets/svg/social/wechat.svg?component";
import WeiboIcon from "@/assets/svg/social/weibo.svg?component";
import DouyinIcon from "@/assets/svg/social/douyin.svg?component";
import QQIcon from "@/assets/svg/social/qq.svg?component";
import Lock from "~icons/ri/lock-fill";
import User from "~icons/ri/user-3-fill";

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
  password: "admin123"
});

const socialLogins = [
  { name: "微信", tip: "使用微信登录", color: "#07c160", icon: WechatIcon },
  { name: "微博", tip: "使用微博登录", color: "#e6162d", icon: WeiboIcon },
  {
    name: "抖音",
    tip: "使用抖音登录",
    color: "var(--el-text-color-primary)",
    icon: DouyinIcon
  },
  { name: "QQ", tip: "使用QQ登录", color: "#12b7f5", icon: QQIcon }
];

const onSocialLogin = (name: string) => {
  message(`${name}登录功能正在开发中，敬请期待`, { type: "warning" });
};

const onLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(valid => {
    if (valid) {
      loading.value = true;
      useUserStoreHook()
        .loginByUsername({
          username: ruleForm.username,
          password: ruleForm.password
        })
        .then(res => {
          if (res.success) {
            // 获取后端路由
            return initRouter().then(() => {
              disabled.value = true;
              router
                .push(getTopMenu(true).path)
                .then(() => {
                  message("登录成功", { type: "success" });
                })
                .finally(() => (disabled.value = false));
            });
          } else {
            message("登录失败", { type: "error" });
          }
        })
        .finally(() => (loading.value = false));
    }
  });
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

          <Motion :delay="300">
            <div class="social-login">
              <el-tooltip
                v-for="item in socialLogins"
                :key="item.name"
                :content="item.tip"
                placement="bottom"
              >
                <a
                  class="social-login-item"
                  href="#"
                  :style="{ color: item.color }"
                  :aria-label="item.tip"
                  @click.prevent="onSocialLogin(item.name)"
                >
                  <component :is="item.icon" />
                </a>
              </el-tooltip>
            </div>
          </Motion>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("@/style/login.css");

.social-login {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 20px;
}

.social-login-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  text-decoration: none;
  border: 1px solid var(--el-border-color);
  border-radius: 50%;
  transition:
    border-color 0.2s,
    background-color 0.2s,
    transform 0.2s;
}

.social-login-item svg {
  width: 20px;
  height: 20px;
}

.social-login-item:hover {
  background-color: color-mix(in srgb, currentcolor 10%, transparent);
  border-color: currentcolor;
  transform: translateY(-2px);
}
</style>

<style lang="scss" scoped>
:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}
</style>
