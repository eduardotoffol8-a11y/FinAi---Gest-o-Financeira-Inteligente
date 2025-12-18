/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
  // Se precisar de outras variáveis, adicione aqui
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}