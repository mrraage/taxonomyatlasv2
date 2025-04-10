import React, { use } from "react";
import { useTranslation } from "react-i18next"

interface LoaderProps {
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ text }) => {
  const {t} = useTranslation()
  const defaultText = `${t("loading")} ...`
  const displayText = text || defaultText;
  
  return (
    <div className="loader_group font" data-testid="loader-container">
      <div className="loader" data-testid="loader-spinner"/>
      <div data-testid="loader-text">{displayText}</div>
    </div>
  )
}

export default Loader