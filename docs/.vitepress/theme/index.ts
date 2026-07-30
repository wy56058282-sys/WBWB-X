import '@fontsource/silkscreen/400.css'
import '@fontsource/silkscreen/700.css'
import '@hackernoon/pixel-icon-library/fonts/iconfont.css'
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import './custom.css'
import './home.css'

export default {
  extends: DefaultTheme,
  Layout,
}
