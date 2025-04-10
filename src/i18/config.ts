import i18next from "i18next"
import { initReactI18next } from "react-i18next"
import en_localisation from "./en/localisation.json"
import sv_localisation from "./sv/localisation.json"
import en_ui from "./en/ui.json"
import en_tax from "./en/taxonomy.json"
import en_label from "./en/label.json"
import sv_ui from "./sv/ui.json"
import sv_tax from "./sv/taxonomy.json"
import sv_label from "./sv/label.json"

export const defaultNS = "localisation"

i18next.use(initReactI18next).init({
  lng: "en", // if you'e using a language detector, do not define the lng option
  debug: true,
  resources: {
    en: {
      [defaultNS]: en_localisation,
      ui: en_ui,
      taxonomy: en_tax,
      label: en_label,
    },
    sv: {
      [defaultNS]: sv_localisation,
      ui: sv_ui,
      taxonomy: sv_tax,
      label: sv_label,
    }
  },
  defaultNS,
})