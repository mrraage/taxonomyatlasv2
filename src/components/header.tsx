import React, { useState, useEffect, useCallback } from "react"
import { useNavigate, Link } from "react-router"
import AutocompleteSearch from "./autocomplete_search"
import Constants from "../context/constants"
import ExportMenu from "./export_menu"
import Rest from "../context/rest"
import EventDispatcher from "../context/event_dispatcher"
import LanguageSelector from "./language_selector"
import { useTranslation } from "react-i18next"

interface AutocompleteItem {
    id: string
    type: string
    [key: string]: any
}

const Header: React.FC = () => {
    const { t, i18n } = useTranslation() // Destructure i18n here
    // Convert state to useState hooks
    const [isShowingExport, setIsShowingExport] = useState<boolean>(false)
    const [isShowingLinks, setIsShowingLinks] = useState<boolean>(false)
    const [isShowingAbout, setIsShowingAbout] = useState<boolean>(false)

    const navigate = useNavigate()

    // Handle click outside to close menus
    const onMouseDown = useCallback(() => {
        if (isShowingExport || isShowingAbout || isShowingLinks) {
            setIsShowingExport(false)
            setIsShowingLinks(false)
            setIsShowingAbout(false)
        }
    }, [isShowingExport, isShowingAbout, isShowingLinks])

    // Setup event listeners (equivalent to componentDidMount/componentWillUnmount)
    useEffect(() => {
        document.addEventListener("mousedown", onMouseDown, false)

        // Cleanup function (componentWillUnmount equivalent)
        return () => {
            document.removeEventListener("mousedown", onMouseDown, false)
        }
    }, [onMouseDown])

    const onLinkClicked = useCallback((url: string) => {
        const isSame = window.location.pathname === url
        navigate(url)
        if (isSame) {
            window.location.reload()
        }
    }, [navigate])

    const onExportClicked = useCallback(() => {
        setIsShowingExport(true)
    }, [])

    // onAutocompleteSelected removed as AutocompleteSearch is no longer used
    // placeholder logic removed as AutocompleteSearch is no longer used

    return (
        // --- New Header Structure with Background ---
        <div
            className="relative bg-cover bg-center text-white py-16 px-8 md:px-16 shadow-lg" // Added padding, text color, shadow
            style={{ backgroundImage: `url('placeholder-image-url.jpg')` }} // Placeholder URL
        >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black opacity-50 z-0"></div>

            {/* Content Container - Positioned above overlay */}
            <div className="relative z-10">
                {/* Top Row: Title and Language Flags */}
                <div className="flex justify-between items-center mb-12">
                    {/* Title */}
                    <div className="text-3xl font-bold">
                        Careers in Gothenburg
                    </div>

                    {/* Language Flags */}
                    <div className="flex space-x-3">
                        <button
                            onClick={() => i18n.changeLanguage('sv')}
                            className={`cursor-pointer text-2xl ${i18n.language === 'sv' ? 'opacity-100' : 'opacity-50 hover:opacity-75'}`}
                            title="Svenska"
                        >
                            🇸🇪
                        </button>
                        <button
                            onClick={() => i18n.changeLanguage('en')}
                            className={`cursor-pointer text-2xl ${i18n.language === 'en' ? 'opacity-100' : 'opacity-50 hover:opacity-75'}`}
                            title="English"
                        >
                            🇬🇧
                        </button>
                    </div>
                </div>

                {/* Hero Section Content (from image) */}
                <div className="max-w-2xl">
                    {/* Title is already above, keeping description and buttons */}
                    <p className="text-lg md:text-xl mb-8">
                        {t('label:hero_description', "Find your dream job in one of Sweden's most vibrant cities, surrounded by beautiful nature and innovation.")} {/* Specify 'label' namespace */}
                        Find your dream job in one of Sweden's most vibrant cities, surrounded by beautiful nature and innovation. {/* Text from image */}
                    </p>
                    <div className="flex space-x-4">
                        {/* Find Jobs Button with Link */}
                        <Link to="/taxonomy">
                            <button className="bg-white text-gray-800 hover:bg-gray-200 font-semibold py-2 px-5 rounded shadow">
                                {t('label:find_jobs', 'Find Jobs')} {/* Specify 'label' namespace */}
                            </button>
                        </Link>
                        {/* Post a Job Button with Link */}
                        <Link to="/jobs">
                            <button className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-5 rounded shadow opacity-90">
                                {t('label:post_a_job', 'Post a Job')} {/* Specify 'label' namespace */}
                            </button>
                        </Link>
                        {/* For Employers Button (no link specified) */}
                        <button className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-5 rounded shadow opacity-90">
                            {t('label:for_employers', 'For Employers')} {/* Specify 'label' namespace */}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header