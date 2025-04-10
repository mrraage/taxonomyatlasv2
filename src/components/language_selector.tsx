import React from "react"
import { useTranslation } from "react-i18next"

interface LanguageSelectorProps {
  // No props needed at this time since it's self-contained
}

const LanguageSelector: React.FC<LanguageSelectorProps> = () => {  
  const { t, i18n } = useTranslation()
  const onLanguageClicked = (lang: string): void => {
    i18n.changeLanguage(lang)
  }
  const renderLanguageOption = (text: string, lang: string): React.JSX.Element => {
    return (
      <div
        className={`header_language_option ${i18n.language === lang ? "header_language_selected" : ""}`}
        onPointerUp={() => onLanguageClicked(lang)}
      >
        {text}
      </div>
    )
  }

  return (
    <div className="header_language_container">
      <div>
        {t("language")}:
      </div>
      {renderLanguageOption("Svenska", "sv")}
      {renderLanguageOption("English", "en")}
    </div>
  )
}

export default LanguageSelector