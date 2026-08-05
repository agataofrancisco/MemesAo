// Origem pública usada em URLs de partilha (links copiados / og:url).
// Aponta para o domínio do Netlify (público), para o qual existe redirect
// /meme/:id para o Worker (que faz SSR de OG tags).
export const SHARE_ORIGIN =
  (import.meta.env.VITE_SHARE_ORIGIN as string | undefined) ||
  "https://memes-ao.netlify.app";