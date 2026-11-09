import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 密码正则（密码必须为8-18位，且同时包含大写字母、小写字母和特殊符号） */
export const REGEXP_PWD =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^0-9a-zA-Z])(?!^.*[\u4E00-\u9FA5].*$)([^(0-9a-zA-Z)]|[()]|[a-z]|[A-Z]|[0-9]){8,18}$/;

/** 登录校验 */
const loginRules = reactive<FormRules>({
  password: [
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback(new Error("请输入密码"));
        } else if (!REGEXP_PWD.test(value)) {
          callback(
            new Error(
              "密码必须为8-18位，且同时包含大写字母、小写字母和特殊符号"
            )
          );
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ]
});

export { loginRules };
