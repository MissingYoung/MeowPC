//通用API响应格式
export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

//登录/注册参数
export interface LoginParams {
  email: string;
  password: string;
}

export interface LoginResult{
  accessToken:string;
  userInfo:UserInfo;
  refreshToken?:string;
}

export interface RegisterParams {
  
  email: string;
  password: string;
  code: string;//验证码
  
}
//用户详情（主接口）
export interface UserInfo {
  id: string;
  name: string;
  studentId: string;
  avatar: string;
  level: number;
  levelTitle: string; // "资深铲屎官"
  experience: number; // 当前经验
  nextLevelExp: number; // 升级所需经验
  campus: string;
  currency: number;   // 小鱼干余额 
  stats: UserStats;   // 
  settings: UserSettings; // 
  contact: {
    wechat: string;
    phone: string;
  }

}
//用户信息更新参数
export interface UpdateProfileParams {
  nickname: string;
  avatar: string;
  campus: string;
  contact:{
    wechat: string;
    phone: string;
  }
}

//用户统计数据
export interface UserStats{
  feedCount:number;
  found:number;
  receivedLikes:number;
  momentCount:number;
}

//用户设置
export interface UserSettings{
  showBadge:boolean;//是否显示勋章
  pushNotification:boolean;//是否接受推送
}

//分页数据格式
export interface PageResult<T> {
  total: number;
  currentPage: number;
  totalPage: number;
  hasNext: boolean;
  items: T[]; 
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
export type Status = 'SCHOOL' | 'GRADUATED' | 'MEOW_STAR' | 'HOSPITAL';
export type HealthStatus = 'HEALTHY' | 'ILL' | 'RECOVERING';
export type Campus = 'CENTRAL' | 'SOFTWARE_PARK' | 'HONGJIALOU' | 'XINGLONGSHAN' | 'QIANFOSHAN' | 'BAOTUQUAN' | 'WEIHAI' | 'QINGDAO';


export const CampusMap: Record<number, string> = {
  0: '中心校区',
  1: '趵突泉校区',
  2: '洪家楼校区',
  3: '千佛山校区',
  4: '兴隆山校区',
  5: '软件园校区',
  6: '青岛校区',
  7: '威海校区'
}

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
  type?: 'EAR_CUT' | 'UNCUT' | string;
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
export interface CatListItem {
  id: number;
  name: string;
  avatar: string;
  color: string;
  status: Status;
  campus: Campus;
  popularity: number;
}

//领养申请参数
export interface AdoptionPasrams {
  catId: number;
  info:{
    housing: string;
    experience: string;
    plan: string;
  };
  contact:{
    wechat: string;
    phone: string;
  }
}
//sos求助参数
export interface SOSParams {
  catId?: string;
  campus: number; // ✨ 例亚 API 文档，campus 是整数 (0-7)
  location: string;
  symptoms: string[];
  description: string;
  media: string[];
}

//排行榜类型枚举
export type LeaderboardType = 'popularity' | 'appearance' | 'gluttony' | 'fight';

// 排行榜单项数据 (继承自猫咪列表项，增加票数字段)
export interface LeaderboardItem {
  id?: string;
  catId?: string;
  name: string;
  avatar: string;
  campus?: string; // 校区 
  value: number;  // 票数/分数
  rank?: number;  // 前端计算排名用
}
//发布动态参数
export interface MomentParams {
  content?: string;       // 内容（可选）
  media?: string[];       // 图片链接数组（可选）
  relatedCatIds: string; // 关联的猫咪ID
  location?: string;     // 位置 
}

// 动态发布者
export interface MomentUser {
  id: string;   // JSON里是 string "6"
  name: string; // JSON里是 name
  avatar: string;
}

// 关联猫咪简略信息
export interface RelatedCat {
  id: string;
  name: string;
  avatar: string;
}

// 动态单项结构 
export interface MomentItem {
  id: string;
  content?: string;     // 动态内容（可选）
  media?: string[];     // 图片数组（可选）
  user: MomentUser;     // 发布者对象
  relatedCats: RelatedCat; // 关联猫咪对象
  likeCount: number;    // 点赞数
  isLiked: boolean;     // 当前用户是否点赞
  createTime: string;   // 时间
}