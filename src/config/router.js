export const constantRouterMap = [
    {
        path: '/',
        component: () => import('@/components/navView'),
        redirect: '/home',
        hidden: true,
        children: [
            {
                path: 'home',
                name: 'home',
                component: () => import('@/views/home'),
                meta: {title: '实时地震'}
            },
            {
                path: 'recent',
                name: 'recent',
                component: () => import('@/views/recent'),
                meta: {title: '最近地震'}
            },
            {
                path: 'rise',
                name: 'rise',
                component: () => import('@/views/rise'),
                meta: {title: '历史变化'}
            },
            {
                path: 'search',
                name: 'search',
                component: () => import('@/views/search'),
                meta: {title: '历史查询'}
            },
            {
                path: 'book',
                name: 'book',
                component: () => import('@/views/book'),
                meta: {title: '知识库'}
            }
        ]
    },

    {
        path: '/404',
        component: () => import('@/views/exception/404'),
        meta: {title: '找不到'}
    },
    {
        path: '*',
        redirect: '/404'
    }

]
