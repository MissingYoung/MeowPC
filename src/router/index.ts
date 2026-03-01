import { createRouter,createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import CatDetailView from "@/views/CatDetailView.vue";
import { useUserStore } from "@/stores/user";
import UserCenterView from "@/views/UserCenterView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes:  [
    {
      path: "/",
      name: "home",
      component: HomeView
    },
    {
      path: "/cat/:id",
      name: "cat-detail",
      component: CatDetailView

    },
    {
      path:'/login',
      name:'login',
      component:()=>import('@/views/LoginView.vue')
    },
    {
      path:'/register',
      name:'register',
      component:()=>import('@/views/RegisterView.vue')
    },
    {
      path:'/userCenter',
      name:'userCenter',
      component:UserCenterView,
      meta:{RequiresAuth:true}
    },
    {
      path:'/editProfile',
      name:'editProfile',
      component:()=>import('@/views/EditProfileView.vue')
    },
    {
      path:'/adopt',
      name:'adopt',
      component:()=>import('@/views/AdoptView.vue')
    },
    {
      path:'/sos',
      name:'sos',
      component:()=>import('@/views/SOSView.vue')
    },
    {
      path:'/ranking/:type',
      name:'ranking',
      component:()=>import('@/views/LeaderboardView.vue')
    },
    {
      path: '/post',
      name: 'post-moment',
      component: () => import('@/views/PostMomentView.vue'),
      meta: { requiresAuth: true }
    },

    
  
  ]
});

//守卫函数
router.beforeEach((to,_from,next)=>{
  
  //白名单
  const staticWhitelist=['/login','/register','/','/editProfile','/adopt','/sos'];//允许未登录访问的路径
  //判断逻辑
  const iSWhiteListed = staticWhitelist.includes(to.path)||//静态白名单
  to.path.startsWith('/cat/')||//猫咪详情页
  to.path.startsWith('/ranking/')||//榜单页
  to.path.startsWith('/adopt')||//领养页
  to.path.startsWith('/sos')//求救页
  const userStore =useUserStore();
//拦截逻辑
if(iSWhiteListed){
  next()
}else if(userStore.token){
  next()
}else{
  next('/login')
}

   
  

})
export default router;