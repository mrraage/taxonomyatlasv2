import React, { useState, useEffect, useCallback } from "react"
import { useNavigate, Link } from "react-router"
import AutocompleteSearch from "./autocomplete_search"
import Constants from "../context/constants"
import ExportMenu from "./export_menu"
import Rest from "../context/rest"
import EventDispatcher from "../context/event_dispatcher"
import LanguageSelector from "./language_selector"
import { useTranslation } from "react-i18next"
import { FaChevronDown } from 'react-icons/fa';

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
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80')` }} // Swedish nature Unsplash
        >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black opacity-50 z-0"></div>

            {/* Content Container - Positioned above overlay */}
            <div className="relative z-10">
                {/* Top Row: Title and Language Flags */}
                <div className="flex justify-between items-center mb-12">
                    {/* Title */}
                    <div className="text-3xl font-bold">
    {t('header_title')}
</div>

                    {/* Language Dropdown Switcher */}
<div className="relative">
  <button
    className="flex items-center bg-neutral-800 rounded px-5 py-2 shadow text-pink-100 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
    onClick={() => setIsShowingLinks(!isShowingLinks)}
    aria-haspopup="listbox"
    aria-expanded={isShowingLinks}
  >
    {i18n.language === 'sv' ? (
  <span className="mr-2 text-lg" style={{display: 'inline-block', width: '1.5em', height: '1.5em'}}>
    {/* Swedish flag SVG */}
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30"><rect width="60" height="30" fill="#006aa7"/><rect x="17" width="8" height="30" fill="#fecc00"/><rect y="11" width="60" height="8" fill="#fecc00"/></svg>
  </span>
) : (
  <span className="mr-2 text-lg" style={{display: 'inline-block', width: '1.5em', height: '1.5em'}}>
    {/* UK flag SVG */}
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30"><clipPath id="a"><path d="M0 0v30h60V0z"/></clipPath><g clipPath="url(#a)"><path fill="#012169" d="M0 0h60v30H0z"/><path stroke="#fff" strokeWidth="6" d="M0 0l60 30M60 0L0 30"/><path stroke="#c8102e" strokeWidth="4" d="M0 0l60 30M60 0L0 30"/><path fill="#fff" d="M25 0h10v30H25zM0 10h60v10H0z"/><path fill="#c8102e" d="M27 0h6v30h-6zM0 12h60v6H0z"/></g></svg>
  </span>
)}
{i18n.language === 'sv' ? 'Svenska' : 'English'}
<FaChevronDown className="ml-2 text-pink-200" />
  </button>
  {isShowingLinks && (
    <ul
      className="absolute right-0 mt-2 w-40 bg-neutral-800 rounded-xl shadow-lg z-20 py-2"
      role="listbox"
    >
      <li>
        <button
          className="flex items-center w-full px-4 py-2 text-pink-100 hover:bg-neutral-700 rounded-xl transition"
          onMouseDown={() => { i18n.changeLanguage('sv'); setIsShowingLinks(false); }}
        >
          <span className="mr-2 text-lg" style={{display: 'inline-block', width: '1.5em', height: '1.5em'}}>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30"><rect width="60" height="30" fill="#006aa7"/><rect x="17" width="8" height="30" fill="#fecc00"/><rect y="11" width="60" height="8" fill="#fecc00"/></svg>
</span> Svenska
        </button>
      </li>
      <li>
        <button
          className="flex items-center w-full px-4 py-2 text-pink-100 hover:bg-neutral-700 rounded-xl transition"
          onMouseDown={() => { i18n.changeLanguage('en'); setIsShowingLinks(false); }}
        >
          <span className="mr-2 text-lg" style={{display: 'inline-block', width: '1.5em', height: '1.5em'}}>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30"><clipPath id="a"><path d="M0 0v30h60V0z"/></clipPath><g clipPath="url(#a)"><path fill="#012169" d="M0 0h60v30H0z"/><path stroke="#fff" strokeWidth="6" d="M0 0l60 30M60 0L0 30"/><path stroke="#c8102e" strokeWidth="4" d="M0 0l60 30M60 0L0 30"/><path fill="#fff" d="M25 0h10v30H25zM0 10h60v10H0z"/><path fill="#c8102e" d="M27 0h6v30h-6zM0 12h60v6H0z"/></g></svg>
</span> English
        </button>
      </li>
    </ul>
  )}
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