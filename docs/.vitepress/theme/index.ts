import '@fontsource/silkscreen/400.css'
import '@fontsource/silkscreen/700.css'
import '@hackernoon/pixel-icon-library/fonts/iconfont.css'
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import { legacyRouteTarget } from '../legacy-routes'
import './custom.css'
import './home.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ router }) {
    router.onBeforeRouteChange = (to) => legacyRouteTarget(to) ?? undefined
  },
}
