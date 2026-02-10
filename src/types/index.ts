//通用API响应格式
export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

//分页数据格式
export interface PageResult<T> {
  items: T[];
  total: number;

}

//侧边栏菜单项
export interface MenuItem {
  name: string;
  icon: string;
  path: string;
}

//首页统计数据项
export interface StatsData {
  total: number;
  residential: number;
  watting: number;
  adopted: number;
  neutered: number;
}

//首页快捷卡片数据项
export interface ShortcutItem {
  id: number;
  title: string;
  desc: string;
  path: string;
  iconColor: string;
  bgColor: string;
  iconPath: string;
}

//猫猫数据项
export type Gender = 'MALE' | 'FEMALE';
export type Status = 'SCHOOL' | 'GRADUATED' | 'MEOW_STAR'|'HOSPITAL';
export type HealthStatus = 'HEALTHY' | 'ILL' | 'RECOVERING';
export type Campus = 'CENTRAL' | 'SOFTWARE_PARK' | 'HONGJIALOU' | 'XINGLONGSHAN' | 'QIANFOSHAN' | 'BAOTUQUAN' | 'WEIHAI'|'QINGDAO';

//猫咪基本信息
export interface CatBasicInfo {
  color: string;
  gender: Gender;
  campus: Campus;
  huntLocation: string;
  role: string;
  birtYear: number;
  admissionDate: string;
  status: Status;
  healthStatus: HealthStatus;
  lastSeenTime: string;
  neutered: NeuteredInfo;
}
//猫咪绝育信息
export interface NeuteredInfo {
  isNeutered: boolean;
  date?: string;
  type?: 'EAR_CUT'|'UNCUT'|string;
}

//猫咪属性评分
export interface CatAttribute {
  friendliness: number; // 亲人
  gluttony: number;     // 贪吃
  fight: number;        // 战斗
  appearance: number;   // 颜值
}

// 猫际关系
export interface CatRelation {
  catId: string;
  name: string;
  relation: string; // 如 "死对头", "情侣"
  avatar: string;
}
//猫咪详细信息(主接口)
export interface CatDetail {
  id: number;
  name: string;
  aliases: string[];
  avatar: string;
  images: string[];
  basicInfo: CatBasicInfo;
  attributes: CatAttribute;
  tags: string[];//标签列表
  relationships: CatRelation[];//猫际关系
  description: string;//猫咪描述
  popularity: number;//人气值

}

//猫猫列表查询参数
export interface CatListItem{
  id: number;
  name: string;
  avatar: string;
  color: string;
  status: Status;
  campus: Campus;
  popularity: number;
}