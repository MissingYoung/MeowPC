import {http}from '@/lib/https';
import type{ 
    StatsData,
    CatDetail,
    CatListItem ,
    PageResult,
    UserInfo,
    LoginParams,
    LoginResult,
    RegisterParams,
    UpdateProfileParams,
    AdoptionPasrams,
    SOSParams,
    LeaderboardType,
    LeaderboardItem,
    MomentParams,
    MomentItem,
    MomentUser,
    RelatedCat,
    MomentQueryParams


} from '@/types';


export const statsApi={
    //获取首页统计数据
    getHomeStats(){
        return http.get<StatsData>('/stats/overview');
    }
}
export const catApi={
    //获取猫咪详细信息
    getCatDetail(id:number|string){
        return http.get<CatDetail>(`/cats/${id}`);
    }
    //获取猫咪列表
    ,
    getCatList(params?:Record<string,any>){
        return http.get<PageResult<CatListItem>>('/cats',{
            params
        });
    },
    //提交领养申请
    submitAdoption(data:AdoptionPasrams){
        return http.post('/adoptions',data);
    },
    //封神榜

     getLeaderboard: (type: LeaderboardType, limit: number = 20) => 
    http.get<LeaderboardItem[]>(`/leaderboard/${type}`, { params: { limit } })
}

export const userApi={
    login:(data:LoginParams)=>http.post<LoginResult>('/users/login',data),
    register:(data:RegisterParams)=>http.post('/users/register',data),
    getUserInfo:()=>http.get<UserInfo>('/users/me'),
    sendVerificationCode:(email:string)=>http.post<any>('/users/send-verification-code',{email}),
    updateUserInfo:(data:UpdateProfileParams)=>http.put<any>('/users/me',data)
}

export const sosApi={
    //获取预设症状列表
    getTags:()=>http.get<string[]>('/sos/tags'),
    //提交求助信息
    submitSOS:(data:SOSParams)=>http.post<{id:string,status:string}>('/sos',data)
}

export const momentApi = {
  // 发布动态
  createMoment: (data: MomentParams) => http.post('/moments', data),
  //获取动态列表
  getMoments: (params: MomentQueryParams) => 
    http.get<PageResult<MomentItem>>('/moments', { params }),
  // 点赞动态
  likeMoment: (id: string) => http.post(`/moments/${id}/like`, {}),
  // 取消点赞动态
  unlikeMoment: (id: string) => http.delete(`/moments/${id}/like`)
}