// vue.config.js
module.exports = {

    css: {
        loaderOptions: {
            less: {
                modifyVars: {
                    /* less 变量覆盖，用于自定义 ant design 主题 */
                    'primary-color': '#1890FF',
                    'link-color': '#1890FF',
                    'border-radius-base': '4px',
                },
                javascriptEnabled: true,
            }
        }
    },

    devServer: {
        proxy: {
            '/api': {
                target: 'https://localhost:44315', // 后台请求地址
                ws: true,
                changeOrigin: true,
                pathRewrite: {
                    '^/api': '' //通过pathRewrite重写地址，将前缀/api转为/
                }
            }
        }
    }
}