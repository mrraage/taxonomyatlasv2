import React from "react"
import Header from "../components/header.tsx"
import { useTranslation } from "react-i18next"
import GraphSVG from "../../resources/graph.svg"

export default function About() {
    const {t} = useTranslation()
    return (
        <div className="flex flex-col h-full">
            <Header />
            <div className="flex flex-col">
                <div className="flex flex-col">
                    <div className="m-4">
                        {t("about_content")}
                    </div>
                    <img className="m-4" src={GraphSVG} />
                    <a href={GraphSVG} download
                       className="text-center m-4 text-blue-500 underline">
                       {t("download_image")}
                    </a>
                </div>
            </div>
        </div>
    )
}
