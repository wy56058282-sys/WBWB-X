import '@fontsource/silkscreen/400.css'
import '@fontsource/silkscreen/700.css'
import '@hackernoon/pixel-icon-library/fonts/iconfont.css'
import DefaultTheme from 'vitepress/theme'
import CasesPage from './CasesPage.vue'
import Layout from './Layout.vue'
import { legacyRouteTarget } from '../legacy-routes'
import './custom.css'
import './reading.css'
import './home.css'
import './cases.css'
import './floating-quick-access.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, router }) {
    app.component('CasesPage', CasesPage)
    router.onBeforeRouteChange = (to) => legacyRouteTarget(to) ?? undefined
  },
}
