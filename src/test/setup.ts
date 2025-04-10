import "@testing-library/jest-dom"
import { vi } from "vitest"

import "../i18/config"

// Globala mock-funktioner för att hantera EventDispatcher och andra beroenden
vi.mock("../context/event_dispatcher.tsx", () => ({
  default: {
    add: vi.fn(),
    remove: vi.fn(),
    fire: vi.fn()
  }
}))


// Mock för Constants
vi.mock("../context/constants.tsx", () => ({
  default: {
    DISPLAY_TYPE_WORK_SSYK: "work_ssyk",
    DISPLAY_TYPE_WORK_ISCO: "work_isco",
    DISPLAY_TYPE_SKILL: "skill",
    DISPLAY_TYPE_SKILL_COLLECTION: "skill_collection",
    DISPLAY_TYPE_SWE_SKILL: "swe_skill",
    DISPLAY_TYPE_WORK_DESC: "work_desc",
    DISPLAY_TYPE_GEOGRAPHY: "geography",
    DISPLAY_TYPE_INDUSTRY: "industry",
    DISPLAY_TYPE_SEARCH: "search",
    DISPLAY_TYPE_LANGUAGE: "language",
    DISPLAY_TYPE_ESCO_OCCUPATION: "esco_occupation",
    DISPLAY_TYPE_ESCO_SKILL: "esco_skill",
    DISPLAY_TYPE_FORECAST_OCCUPATION: "forecast_occupation",
    DISPLAY_TYPE_BAROMETER_OCCUPATION: "barometer_occupation",
    DISPLAY_TYPE_EDUCATION: "education",
    DISPLAY_TYPE_OTHER: "other",
    DISPLAY_TYPE_JOB_TITLE: "job_title",
    DISPLAY_WORK_TYPE_STRUCTURE: "0",
    DISPLAY_WORK_TYPE_GROUP: "1",
    DISPLAY_WORK_TYPE_OCCUPATIONS: "2",
    DISPLAY_WORK_TYPE_FIELDS: "3",
    EVENT_TAXONOMY_SET_SEARCH_TYPE: "taxonomy_set_search_type"
  }
}))

// Mock för ContextUtil
vi.mock("../context/util.tsx", () => ({
  default: {
    sortByKey: vi.fn((items, key, direction) => items)
  }
}))