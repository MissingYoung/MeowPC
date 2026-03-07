import {defineStore} from 'pinia';
import {ref} from 'vue';
import {userApi} from '@/lib/api';
import type{ UserInfo ,UpdateProfileParams} from '@/types';

export const useUserStore =defineStore('user',()=>{
    const token=ref(localStorage.getItem('token')||'')

    const userInfo =ref<UserInfo|null>(null)

    //获取/刷新用户信息
    const fetchUserInfo = async()=>{
        try{
            const data = await userApi.getUserInfo()
            userInfo.value =data;
        }catch(error){
            console.error('获取用户信息失败',error)
            
        }

    }

    //登录
    const login = async(paramas:any)=>{
        const res =await userApi.login(paramas)
        token.value = res.accessToken;
        localStorage.setItem('token',res.accessToken)
         localStorage.setItem('refreshToken', res.refreshToken? res.refreshToken : '')

        //登录成功后立刻获取一次详细信息
        await fetchUserInfo();

    }
   
        
    //登出
    const logout =()=>{
        token.value='';
        userInfo.value=null;
        localStorage.removeItem('token')
    }
    //更新用户信息（支持FormData或普通对象）
    const updateProfile= async(params: UpdateProfileParams | FormData)=>{
        await userApi.updateUserInfo(params as any)
        await fetchUserInfo();
    }

    return {token,userInfo,login,logout,fetchUserInfo,updateProfile}
})