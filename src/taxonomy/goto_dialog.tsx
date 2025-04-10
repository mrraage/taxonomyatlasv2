import React, { useEffect, useCallback } from "react"
import { useTranslation } from "react-i18next"

interface GotoDialogProps {
    text: string
    yesCallback?: () => void
    noCallback?: () => void
}

const GotoDialog: React.FC<GotoDialogProps> = ({ text, yesCallback, noCallback }) => {
    const { t } = useTranslation()
    const onYesPressed = useCallback(() => {
        if (yesCallback) {
            yesCallback()
        }
    }, [yesCallback])

    const onNoPressed = useCallback(() => {
        if (noCallback) {
            noCallback()
        }
    }, [noCallback])

    const onKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") {
            onNoPressed()
        }
    }, [onNoPressed])

    useEffect(() => {
        window.addEventListener("keydown", onKeyDown)

        // Cleanup function (componentWillUnmount equivalent)
        return () => {
            window.removeEventListener("keydown", onKeyDown)
        }
    }, [onKeyDown])

    return (
        <div className="goto_dialog_base">
            <div className="goto_dialog_window font">
                <span>{t("goto")} <b>{text}</b>?</span>
                <div className="goto_dialog_buttons">
                    <div onPointerUp={onYesPressed}>
                        {t("yes")}
                    </div>
                    <div onPointerUp={onNoPressed}>
                        {t("no")}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GotoDialog