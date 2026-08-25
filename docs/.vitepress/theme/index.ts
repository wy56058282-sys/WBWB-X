import '@fontsource/silkscreen/400.css'
import '@fontsource/silkscreen/700.css'
import '@hackernoon/pixel-icon-library/fonts/iconfont.css'
import DefaultTheme from 'vitepress/theme'
import { defineAsyncComponent } from 'vue'
import Layout from './Layout.vue'
import { legacyRouteTarget } from '../legacy-routes'
import './custom.css'
import './reading.css'
import './floating-quick-access.css'

const Mermaid = defineAsyncComponent(() => import('vitepress-plugin-mermaid/Mermaid.vue'))
const CasesPage = defineAsyncComponent(() => import('./CasesPage.vue'))
const CaseServiceCta = defineAsyncComponent(() => import('./CaseServiceCta.vue'))
const AboutPage = defineAsyncComponent(() => import('./AboutPage.vue'))
const ServicePage = defineAsyncComponent(() => import('./ServicePage.vue'))
const ToolsPage = defineAsyncComponent(() => import('./ToolsPage.vue'))
const EnterpriseServicesPage = defineAsyncComponent(() => import('./EnterpriseServicesPage.vue'))
const LegacyPageRedirect = defineAsyncComponent(() => import('./LegacyPageRedirect.vue'))

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, router }) {
    app.component('Mermaid', Mermaid)
    app.component('CasesPage', CasesPage)
    app.component('CaseServiceCta', CaseServiceCta)
    app.component('AboutPage', AboutPage)
    app.component('ServicePage', ServicePage)
    app.component('ToolsPage', ToolsPage)
    app.component('EnterpriseServicesPage', EnterpriseServicesPage)
    app.component('LegacyPageRedirect', LegacyPageRedirect)
    router.onBeforeRouteChange = (to) => legacyRouteTarget(to) ?? undefined
  },
}
