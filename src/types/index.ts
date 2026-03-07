//通用API响应格式
export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
  msg?: string; // 兼容后端返回的 msg 字段
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

// 修改密码参数
export interface ChangePasswordParams {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
//用户详情（主接口）
export interface UserInfo {
  uid: number;        // 用户ID
  nickname: string;   // 昵称
  sid: string;        // 学号
  avatar: string;
  level: number;
  title: string;      // 等级称号 "资深铲屎官"
  exp: number;        // 当前经验
  nextExp: number;    // 升级所需经验
  campus: number;     // 校区ID
  currency: number;   // 小鱼干余额 
  stats: UserStats;   // 
  settings?: UserSettings; // 
  contact?: {
    wechat: string;
    phone: string;
  }

}
//用户信息更新参数
export interface UpdateProfileParams {
  nickname: string;
  avatar?: string | File;
  campus?: string;
  phone?: string;
  wechat?: string;
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

// 公共统计数据（/stats/public）
export interface PublicStatsData {
  totalCats: number;
  residentCats: number;
  adoptedCats: number;
  neuteredCats: number;
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
  huntLocation?: string;
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
  locationName?: string; // 常驻地点名称

}

//猫猫列表查询参数
export interface CatListItem {
  id: number | string; // 兼容现有 number 和 API string
  name: string;
  avatar: string;
  color?: string;
  status: string; // 兼容 Status enum
  campus: string | number; // 兼容 Campus enum
  popularity?: number;
}

// 管理端猫咪列表项 (完全匹配 API)
export interface AdminCatItem {
  id: string;
  name: string;
  avatar: string;
  color: string;
  campus: string;
  locationName: string;  // 常驻地点名称（从API获取）
  hauntLocation?: string; // 常驻地点（提交时用）
  status: string;
  gender: string; // 性别 MALE | FEMALE
  healthStatus?: string; // 健康状况
  tags: string[];
  isNeutered: boolean;
  popularity: number;
  lastSeenTime: string;
  roleName: string;
  description?: string; // 猫咪描述
  attributes: {
    friendliness: number;
    gluttony: number;
    fight: number;
    appearance: number;
  }; // 属性评分
}

// 猫咪列表查询参数
export interface CatQueryParams {
  page: number;
  pageSize: number;
  campus?: string;
  status?: string;
  color?: string;
  search?: string;
  sort?: string;
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

// 领养申请列表项（管理员端）
export interface AdoptionItem {
  id: string;
  userId: number;
  userName: string;
  userAvatar?: string; // 申请人头像
  catId: string;
  catName: string;
  catAvatar: string;
  status: string; // PENDING, INTERVIEW, APPROVED, REJECTED, COMPLETED
  createTime: string;
  info: {
    plan: string;        // 喂养计划
    housing: string;     // 住房情况: OWN_HOUSE, RENT_WHOLE, RENT_SHARE, DORM, WITH_PARENT
    experience: string;  // 养猫经验: NEWBIE, EXPERIENCED, MULTI_CAT
  };
  contact: {
    phone: string;
    wechat: string;
  };
}

// 领养申请查询参数
export interface AdoptionQueryParams {
  status?: string;
  page: number;
  size: number;
}

//sos求助参数
export interface SOSParams {
  catId?: string;
  campus: number; // ✨ 例亚 API 文档，campus 是整数 (0-7)
  location: string;
  symptoms: string[];
  description: string;
  media: string[]; // 修改为 meta 对应 API 文档
}

export interface SOSItem {
  id: string; // SOS UUID
  catId: string | null;
  catName?: string;
  campus: number;
  location: string;
  symptoms: string[];
  description: string;
  imageURLs: string[]; // 从 API 返回的字段名
  create_time?: string;
  status: string; // PENDING, PROCESSED, etc.
  adminReply?: string | null;
  reporterId?: number;
  reporterName?: string;
}

export interface SOSQueryParams {
  status?: string;
  campus?: number;  // 直接使用数字 (0-7)
  page: number;
  size: number;
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
  media?: File[];         // 图片文件数组（可选）
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

// 3. 列表查询参数
export interface MomentQueryParams {
  page: number;
  pageSize: number;
  catId?: string; // 关联猫咪ID
}

// 编辑猫咪参数
export interface EditCatParams {
  name: string;
  aliases?: string[];
  color: string;
  avatar: string;
  images?: string[];
  gender: string;
  campus: string;
  hauntLocation?: string;
  birthYear?: number;
  admissionDate?: string;
  status: string;
  healthStatus?: string;
  attributes: Record<string, number>;
  isNeutered: boolean;
  neuteredDate?: string;
  neuteredType?: string;
  description?: string;
  tags?: string[];
}

// 管理端用户列表项
export interface AdminUserItem {
  id: number;
  email?: string;
  name: string;
  avatar?: string;
  status?: string;
  role?: string;
  roleName?: string;
  permission?: string; // 某些接口返回权限而非角色
  studentId?: string; // 兼容部分接口返回 studentId
  sid?: string;
  campus?: number | string;
  level?: number;
  levelTitle?: string;
  experience?: number;
  currency?: number;
  phone?: string;
  wechat?: string;
  createTime?: string;
  lastLoginTime?: string;
}

export interface AdminUserListResponse {
  size: number;
  current: number;
  total: number;
  pages: number;
  items: AdminUserItem[];
}

// 管理端用户详情
export interface AdminUserDetail extends AdminUserItem {
  nickname?: string;
  permission?: string;
  exp?: number;
  nextExp?: number;
  stats?: {
    feedCount: number;
    foundNewCatCount?: number;
    found?: number;
    receivedLikes: number;
    momentCount: number;
  };
}

// 用户列表查询参数
export interface UserQueryParams {
  page: number;
  size: number;
  campus?: number;
  search?: string; // 支持邮箱或UID查找
}

// 新喵线索列表项（管理员端）
export interface NewCatItem {
  id: string;
  tempName: string | null;  // 临时名称
  officialName?: string;    // 正式名称（审核通过后）
  color: string;            // 毛色
  images: string[];         // 图片数组
  campus: string;           // 校区名称
  location: string;         // 详细位置
  submitterId: string;      // 提交者ID
  submitterName: string;    // 提交者名称
  status: string;           // PENDING, APPROVED, REJECTED
  createTime: string;       // 创建时间
  tags?: string[];          // 标签
}

// 新喵线索查询参数
export interface NewCatQueryParams {
  status?: string;
  page?: number;
  pageSize?: number;
}

// 用户端我的领养申请列表项
export interface MyAdoptionItem {
  id: string;
  catId: string;
  catName: string;
  catAvatar: string;
  status: string; // PENDING, INTERVIEW, APPROVED, REJECTED, COMPLETED
  createTime: string;
  reason: string | null; // 拒绝原因
}

// 用户端我的领养申请查询参数
export interface MyAdoptionQueryParams {
  status?: string;
  page?: number;
  size?: number;
}

// 用户端我的领养申请分页结果
export interface MyAdoptionPageResult {
  items: MyAdoptionItem[];
  total: number;
  pages: number;
  size: number;
  current: number;
}

// 每日签到结果
export interface CheckinResult {
  totalDays: number;        // 总签到天数
  rewards: {
    currency: number;       // 获得小鱼干
    experience: number;     // 获得经验
  };
  todayChecked: boolean;    // 今天是否已签到（操作前）
  continuousDays: number;   // 连续签到天数
}

// 签到历史记录
export interface CheckinHistory {
  checkInDates: string[];   // 签到日期数组
  month: string;            // 查询月份
  totalDays: number;        // 本月签到天数
}