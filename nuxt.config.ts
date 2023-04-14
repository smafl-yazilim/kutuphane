// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  modules: [
    "@nuxtjs/tailwindcss",
    "nuxt-icon",
    "@nuxtjs/google-fonts",
    "nuxt-vuefire",
  ],
  googleFonts: {
    families: {
      Inter: {
        wght: [400, 500, 600, 700],
      }
    },
    download: true,
    inject: true,
  },
  vuefire: {
    auth: true,
    appCheck: {
      debug: process.env.NODE_ENV !== "production",
      isTokenAutoRefreshEnabled: true,
      provider: "ReCaptchaV3",
      key: "6LdtAjglAAAAAJBUQ1mE2j6430ftnBpayxhkJhIX",
    },
    config: {
      apiKey: "AIzaSyB5AQdAbtQlglm9ZhF5CKollQoG6XI7txQ",
      authDomain: "smafl-kutuphane.firebaseapp.com",
      projectId: "smafl-kutuphane",
      storageBucket: "smafl-kutuphane.appspot.com",
      messagingSenderId: "80599854371",
      appId: "1:80599854371:web:016c42d1d86413ee0df096",
    },
  },
});
