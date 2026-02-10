import {http}from '@/lib/https';
import type{ 
    StatsData,
    CatDetail,
    CatListItem ,
    PageResult,
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
    }
}