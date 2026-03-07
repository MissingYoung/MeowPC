import {http}from '@/lib/https';
import type{ 
    StatsData,
    PublicStatsData,
    CatDetail,
    PageResult,
    UserInfo,
    LoginParams,
    LoginResult,
    RegisterParams,
    UpdateProfileParams,
    ChangePasswordParams,
    AdoptionPasrams,
    AdoptionItem,
    AdoptionQueryParams,
    MyAdoptionItem,
    MyAdoptionQueryParams,
    MyAdoptionPageResult,
    CheckinResult,
    CheckinHistory,
    SOSParams,
    LeaderboardType,
    LeaderboardItem,
    MomentParams,
    MomentItem,
    MomentQueryParams,
    SOSItem,
    SOSQueryParams,
    AdminCatItem,
    CatQueryParams,
    EditCatParams,
    AdminUserItem,
    AdminUserListResponse,
    AdminUserDetail,
    UserQueryParams,
    NewCatItem,
    NewCatQueryParams
} from '@/types';


export const statsApi={
    //获取首页统计数据
    getHomeStats(){
        return http.get<StatsData>('/stats/overview');
    },
    // 获取公共统计数据
    getPublicStats(){
        return http.get<PublicStatsData>('/stats/public');
    }
}
export const catApi={
    //获取猫咪详细信息
    getCatDetail(id:number|string){
        return http.get<CatDetail>(`/cats/${id}`);
    }
    //获取猫咪列表 
    ,
    getCatList(params?:any){
        return http.get<PageResult<any>>('/cats',{params});
    },
    // 管理端获取列表
    getAdminCatList:(params: CatQueryParams) => http.get<PageResult<AdminCatItem>>('/cats', { params }),
    // 新增猫咪 (multipart/form-data)
    addCat:(data: EditCatParams) => {
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (key === 'attributes' && typeof value === 'object') {
                    // Map 类型字段需要展开为 attributes[key]=value 格式
                    Object.entries(value as Record<string, any>).forEach(([attrKey, attrValue]) => {
                        formData.append(`attributes[${attrKey}]`, String(attrValue))
                    })
                } else if (typeof value === 'object' && !(value instanceof File)) {
                    formData.append(key, JSON.stringify(value))
                } else {
                    formData.append(key, String(value))
                }
            }
        })
        return http.post(`/admin/cats`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },
    //编辑猫咪信息 (multipart/form-data)
    editCat:(id:string, data: EditCatParams) => {
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (key === 'attributes' && typeof value === 'object') {
                    // Map 类型字段需要展开为 attributes[key]=value 格式
                    Object.entries(value as Record<string, any>).forEach(([attrKey, attrValue]) => {
                        formData.append(`attributes[${attrKey}]`, String(attrValue))
                    })
                } else if (typeof value === 'object' && !(value instanceof File)) {
                    formData.append(key, JSON.stringify(value))
                } else {
                    formData.append(key, String(value))
                }
            }
        })
        return http.put(`/admin/cats/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },
    //提交领养申请
    submitAdoption(data:AdoptionPasrams){
        return http.post('/adoptions',data);
    },
    // 投喂猫咪
    feedCat(id: number | string) {
        return http.post<{ userCurrency: number }>(`/cats/${id}/feed`);
    },
    // 删除猫咪（管理员）
    deleteCat(id: string) {
        return http.delete(`/admin/cats/${id}`);
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
    // 每日签到
    checkin:()=>http.post<CheckinResult>('/users/me/checkin'),
    // 获取签到历史记录
    getCheckinHistory:(month?: string)=>http.get<CheckinHistory>('/users/me/checkin/history', { params: { month } }),
    // 更新用户信息（支持FormData上传头像）
    updateUserInfo:(data: FormData | UpdateProfileParams)=>{
        // 如果是 FormData，直接发送
        if (data instanceof FormData) {
            return http.put<any>('/users/me', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
        }
        // 否则转换为 FormData
        const formData = new FormData()
        formData.append('nickname', data.nickname)
        if (data.campus) formData.append('campus', data.campus)
        if (data.phone) formData.append('phone', data.phone)
        if (data.wechat) formData.append('wechat', data.wechat)
        return http.put<any>('/users/me', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },
    // 修改密码
    changePassword:(data: ChangePasswordParams)=>http.post('/users/change-password', data)
}

export const sosApi={
    //获取SOS求助列表(管理员)
    getSOSList:(params: SOSQueryParams)=>http.get<PageResult<SOSItem>>('/admin/sos',{params}),
    //获取预设症状列表
    getTags:()=>http.get<string[]>('/sos/tags'),
    //提交求助信息
    submitSOS:(data:SOSParams)=>http.post<{id:string,status:string}>('/sos',data),
    //处理SOS请求（管理员）
    resolveSOS:(id:string,data:{status:string,reply:string})=>http.post(`/admin/sos/${id}/resolve`,data)
}

export const adoptionApi={
    //获取领养申请列表(管理员)
    getAdoptionList:(params: AdoptionQueryParams)=>http.get<PageResult<AdoptionItem>>('/admin/adoptions',{params}),
    //审核领养申请（管理员）
    auditAdoption:(id:string,data:{status:string,reason:string})=>http.post(`/admin/adoptions/${id}/audit`,data),
    //获取我的领养记录(用户端)
    getMyAdoptions:(params?: MyAdoptionQueryParams)=>http.get<MyAdoptionPageResult>('/adoptions/my',{params})
}

export const momentApi = {
  // 发布动态 - 使用 multipart/form-data
  createMoment: (data: MomentParams) => {
    const formData = new FormData()
    if (data.content) formData.append('content', data.content)
    if (data.relatedCatIds) formData.append('relatedCatIds', data.relatedCatIds)
    if (data.location) formData.append('location', data.location)
    // 处理图片文件
    if (data.media && Array.isArray(data.media)) {
      data.media.forEach((file: File) => {
        formData.append('media', file)
      })
    }
    return http.post('/moments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  //获取动态列表
  getMoments: (params: MomentQueryParams) => 
    http.get<PageResult<MomentItem>>('/moments', { params }),
  // 点赞动态
  likeMoment: (id: string) => http.post(`/moments/${id}/like`, {}),
  // 取消点赞动态
  unlikeMoment: (id: string) => http.delete(`/moments/${id}/like`)
}

export const adminUserApi = {
  // 获取用户列表（管理员）
    getUserList: (params: UserQueryParams) => http.get<AdminUserListResponse>('/admin/users', { params }),
    // 获取用户详情（管理员）
        getUserDetail: (id: string | number) => http.get<AdminUserDetail>(`/admin/users/${id}`),
        // 封禁/解封用户（状态取反）
        toggleBan: (id: string | number) => http.post<null>(`/admin/users/${id}/ban`)
}

// 发现新猫 API 响应类型
export interface NewCatResponse {
  id: string
  status: string
  experience: number
  currency: number
}

export const newCatApi = {
  // 提交发现新猫线索
  submitNewCat: (data: FormData) => http.post<NewCatResponse>('/new-cats', data)
}

export const adminNewCatApi = {
  // 获取新喵线索列表
  getNewCatList: (params: NewCatQueryParams) => 
    http.get<PageResult<NewCatItem>>('/admin/new-cats', { params }),
  // 审核/转正新猫
  approveNewCat: (id: string, data: { officialName: string }) =>
    http.post<{ catId: string; newCatId: string }>(`/admin/new-cats/${id}/approve`, data)
}