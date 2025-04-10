class Constants {
    REST_IP: string
    DISPLAY_WORK_TYPE_STRUCTURE: string
    DISPLAY_WORK_TYPE_GROUP: string
    DISPLAY_WORK_TYPE_OCCUPATIONS: string
    DISPLAY_WORK_TYPE_FIELDS: string
    DISPLAY_TYPE_WORK_SSYK: string
    DISPLAY_TYPE_WORK_ISCO: string
    DISPLAY_TYPE_SKILL: string
    DISPLAY_TYPE_SKILL_COLLECTION: string
    DISPLAY_TYPE_SWE_SKILL: string
    DISPLAY_TYPE_OTHER: string
    DISPLAY_TYPE_WORK_DESC: string
    DISPLAY_TYPE_GEOGRAPHY: string
    DISPLAY_TYPE_INDUSTRY: string
    DISPLAY_TYPE_SEARCH: string
    DISPLAY_TYPE_LANGUAGE: string
    DISPLAY_TYPE_EDUCATION: string
    DISPLAY_TYPE_ESCO_OCCUPATION: string
    DISPLAY_TYPE_ESCO_SKILL: string
    DISPLAY_TYPE_FORECAST_OCCUPATION: string
    DISPLAY_TYPE_BAROMETER_OCCUPATION: string
    DISPLAY_TYPE_JOB_TITLE: string
    DISPLAY_TYPE_GENERIC_SKILL: string
    RELATION_NARROWER: string
    RELATION_BROADER: string
    RELATION_RELATED: string
    EVENT_TAXONOMY_SET_SEARCH_TYPE: string
    EVENT_SHOW_POPUP_INDICATOR: string
    EVENT_HIDE_POPUP_INDICATOR: string
    EVENT_LANGUAGE_CHANGED: string
    EVENT_AUTOCOMPLETE_ITEM: string

    lang: string | null

    constructor() {
        // settings
        this.REST_IP = "https://taxonomy.api.jobtechdev.se/v1/taxonomy"

        // display work type
        this.DISPLAY_WORK_TYPE_STRUCTURE = "0"
        this.DISPLAY_WORK_TYPE_GROUP = "1"
        this.DISPLAY_WORK_TYPE_OCCUPATIONS = "2"
        this.DISPLAY_WORK_TYPE_FIELDS = "3"

        // display type
        this.DISPLAY_TYPE_WORK_SSYK = "work_ssyk"
        this.DISPLAY_TYPE_WORK_ISCO = "work_isco"
        this.DISPLAY_TYPE_SKILL = "skill"
        this.DISPLAY_TYPE_SKILL_COLLECTION = "skill_collection"
        this.DISPLAY_TYPE_SWE_SKILL = "swe_skill"
        this.DISPLAY_TYPE_OTHER = "other"
        this.DISPLAY_TYPE_WORK_DESC = "work_desc"
        this.DISPLAY_TYPE_GEOGRAPHY = "geography"
        this.DISPLAY_TYPE_INDUSTRY = "industry"
        this.DISPLAY_TYPE_SEARCH = "search"
        this.DISPLAY_TYPE_LANGUAGE = "language"
        this.DISPLAY_TYPE_EDUCATION = "education"
        this.DISPLAY_TYPE_ESCO_OCCUPATION = "esco_occupation"
        this.DISPLAY_TYPE_ESCO_SKILL = "esco_skill"
        this.DISPLAY_TYPE_FORECAST_OCCUPATION = "forecast_occupation"
        this.DISPLAY_TYPE_BAROMETER_OCCUPATION = "barometer_occupation"
        this.DISPLAY_TYPE_JOB_TITLE = "job_title"
        this.DISPLAY_TYPE_GENERIC_SKILL = "generic_skill"

        // relation types
        this.RELATION_NARROWER = "narrower"
        this.RELATION_BROADER = "broader"
        this.RELATION_RELATED = "related"

        // events
        this.EVENT_TAXONOMY_SET_SEARCH_TYPE = "EVENT_TAXONOMY_SET_SEARCH_TYPE"
        this.EVENT_SHOW_POPUP_INDICATOR = "EVENT_SHOW_POPUP_INDICATOR"
        this.EVENT_HIDE_POPUP_INDICATOR = "EVENT_HIDE_POPUP_INDICATOR"
        this.EVENT_LANGUAGE_CHANGED = "EVENT_LANGUAGE_CHANGED"
        this.EVENT_AUTOCOMPLETE_ITEM = "EVENT_AUTOCOMPLETE_ITEM"


        this.lang = this.getArg("lang")
    }

    getArg(key) {
        var raw = window.location.hash.split("#")
        if (raw.length == 2) {
            var cmd = raw[1]
            var args = cmd.split("&")
            for (var i = 0; i < args.length; ++i) {
                if (args[i].indexOf(key + "=") !== -1) {
                    return args[i].split("=")[1]
                }
            }
        }
        return null
    }

    replaceArg(key, value) {
        var raw = window.location.hash.split("#")
        if (raw.length == 2) {
            var cmd = raw[1]
            var args = cmd.split("&")
            var found = false
            // replace value
            for (var i = 0; i < args.length; ++i) {
                if (args[i].indexOf(key + "=") !== -1) {
                    if (value == null) {
                        args[i] = null
                    } else {
                        args[i] = key + "=" + value
                    }
                    found = true
                    break
                }
            }
            if (!found && value != null) {
                args.push(key + "=" + value)
            }
            args = args.filter(Boolean)
            // rebuild string
            var h = "#"
            for (var i = 0; i < args.length; ++i) {
                h += args[i]
                if (i < args.length - 1) {
                    h += "&"
                }
            }
            window.location.hash = h
        } else if (value) {
            window.location.hash = key + "=" + value
        }
    }
}

export default new Constants()