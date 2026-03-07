import axios from "axios";
import type { AxiosInstance,AxiosRequestConfig,AxiosResponse } from "axios";
import type{ ApiResponse } from "@/types";
import { toast } from 'vue-sonner';

// 防止重复弹出 token 过期提示
let isTokenExpiredToastShown = false;

const service: AxiosInstance = axios.create({
  baseURL: "/api",  // 通过 Vite 代理访问后端
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
//请求拦截器
service.interceptors.request.use(
  (config) => {
    const token=localStorage.getItem('token')
    if(token){
        config.headers['Authorization']=`Bearer ${token}`
    }
    // FormData 时删除 Content-Type，让浏览器自动设置 multipart/form-data
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 处理 token 过期
const handleTokenExpired = () => {
  if (isTokenExpiredToastShown) return;
  isTokenExpiredToastShown = true;
  
  // 清除 token
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  
  // 显示提示
  toast.error('登录已过期，请重新登录');
  
  // 跳转到登录页
  setTimeout(() => {
    window.location.href = '/login';
    // 重置标志，允许下次提示
    setTimeout(() => {
      isTokenExpiredToastShown = false;
    }, 1000);
  }, 1500);
};

//响应拦截器
service.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<any>>) => {
        const res = response.data;
        // 兼容 msg 和 message 字段
        const msg = res.msg || res.message || '';
        
        if (res.code === 200) {
            // 成功时，如果有有意义的消息则显示（排除通用消息）
            const skipMessages = ['success', '成功', '用户信息获取成功', '获取成功', '请求成功'];
            if (msg && !skipMessages.some(s => msg.toLowerCase().includes(s.toLowerCase()))) {
                toast.success(msg);
            }
            return res.data;
        } else {
            // 检查是否是 token 过期
            if (msg.includes('token过期') || msg.includes('token') && msg.includes('过期')) {
                console.error('token过期');
                handleTokenExpired();
            } else if (msg) {
                // 显示业务错误消息
                toast.error(msg);
            }
            console.error('业务错误:', msg);
            return Promise.reject(new Error(msg || 'Error'));
        }
    },
    (error) => {
        let message = '';
        if (error.response && error.response.data) {
            const resData=error.response.data 
            if(resData.msg){
                message=resData.msg
            }
            else if(resData.message){
                message=resData.message
            }
        }
        
        // 检查是否是 token 过期（401 状态码或消息包含 token 过期）
        const status = error.response?.status;
        if (status === 401 || message.includes('token过期') || (message.includes('token') && message.includes('过期'))) {
            console.error('token过期');
            handleTokenExpired();
            return Promise.reject(new Error('登录已过期'));
        }
        
        if(!message){
        switch (status) {
            case 400:message = '请求错误(400)';break;
            case 401:message = '未授权，请重新登录(401)';break;
            case 403:message = '权限不足，拒绝访问(403)';break;
            case 404:message = '资源不存在(404)';break;
            case 422:message = '参数校验错误(422)';break;
            case 500:message = '服务器错误(500)';break;
            default:message = `网络连接错误`;break;
        }
        }
        // 显示错误消息 toast
        toast.error(message);
        console.error(`❌ HTTP Error ${error.response?.status}:`, message)
        return Promise.reject(new Error(message));
    }
       
);
//导出封装好的方法
export const http={
    get<T>(url:string,config?:AxiosRequestConfig){
        return service.get<ApiResponse<T>,T>(url,config);
    },
    post<T>(url:string,data?:any,config?:AxiosRequestConfig){
        return service.post<ApiResponse<T>,T>(url,data,config);
    },
    put<T>(url:string,data?:any,config?:AxiosRequestConfig){
        return service.put<ApiResponse<T>,T>(url,data,config);
    },
    delete<T>(url:string,config?:AxiosRequestConfig){
        return service.delete<ApiResponse<T>,T>(url,config);
    }
}