export function addLazyImageRendering(md: any) {
  const fallback = md.renderer.rules.image
    ?? ((tokens: any[], index: number, options: any) => md.renderer.renderToken(tokens, index, options))

  md.renderer.rules.image = (tokens: any[], index: number, options: any, env: any, self: any) => {
    tokens[index].attrSet('loading', 'lazy')
    tokens[index].attrSet('decoding', 'async')
    return fallback(tokens, index, options, env, self)
  }
}
