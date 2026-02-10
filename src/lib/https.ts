import axios from "axios";
import type { AxiosInstance,AxiosRequestConfig,AxiosResponse } from "axios";
import type{ ApiResponse } from "@/types";

const service: AxiosInstance = axios.create({
  baseURL: "https://m1.apifoxmock.com/m1/7818383-7566189-default",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
//请求拦截器
service.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
//响应拦截器
service.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<any>>) => {
        const res = response.data;
        if (res.code === 200) {
            return res.data;
        } else {
            console.error('业务错误:', res.message);
            return Promise.reject(new Error(res.message || 'Error'));
        }
    },
    (error) => {
        let message = '';
        const status = error.response?.status;
        switch (status) {
            case 400:message = '请求错误(400)';break;
            case 401:message = '未授权，请重新登录(401)';break;
            case 403:message = '权限不足，拒绝访问(403)';break;
            case 404:message = '资源不存在(404)';break;
            case 422:message = '参数校验错误(422)';break;
            case 500:message = '服务器错误(500)';break;
        }
         console.error(`❌ HTTP Error ${status}:`, message)
        return Promise.reject(error);
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