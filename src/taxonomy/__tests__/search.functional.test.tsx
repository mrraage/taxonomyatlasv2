import React from "react"
import { render, screen, fireEvent, act } from "@testing-library/react"
import { describe, it, expect, beforeEach, vi, Mock } from "vitest" // Import Mock
import i18n from "i18next" // Import i18n instance
import "@testing-library/jest-dom"
import Search from "../search.tsx"
import Constants from "../../context/constants.ts"
import EventDispatcher from "../../context/event_dispatcher.tsx"

describe("Functional Search Component", () => {
  const mockOnFilterChanged = vi.fn()
  const mockOnDisplayTypeChanged = vi.fn()
  const mockOnDisplayWorkTypeChanged = vi.fn()
  
  beforeEach(async () => { // Make async
    vi.clearAllMocks()
    await i18n.changeLanguage('sv'); // Set language
  })
  
  it("renders correctly with default props", async () => { // Make async
    render(<Search
      onFilterChanged={mockOnFilterChanged}
      onDisplayTypeChanged={mockOnDisplayTypeChanged}
      onDisplayWorkTypeChanged={mockOnDisplayWorkTypeChanged}
      filter=""
    />)
    
    // Kontrollera att sökfältet finns
    expect(await screen.findByTestId("search-filter-input")).toBeInTheDocument() // Use findByTestId
    
    // Kontrollera att select-elementet finns
    const selectElement = screen.getByRole("combobox")
    expect(selectElement).toBeInTheDocument()
    
    // Kontrollera att radioknapparna finns
    const radioButtons = screen.getAllByRole("radio")
    expect(radioButtons.length).toBe(4)
  })
  
  it("calls onFilterChanged when filter input changes", async () => { // Make async
    render(<Search
      onFilterChanged={mockOnFilterChanged}
      onDisplayTypeChanged={mockOnDisplayTypeChanged}
      onDisplayWorkTypeChanged={mockOnDisplayWorkTypeChanged}
      filter=""
    />)
    
    const filterInput = await screen.findByTestId("search-filter-input") // Use findByTestId
    fireEvent.change(filterInput, { target: { value: "test" } })
    
    expect(mockOnFilterChanged).toHaveBeenCalledWith("test")
  })
  
  it("calls onDisplayTypeChanged when select changes", () => {
    render(<Search 
      onFilterChanged={mockOnFilterChanged}
      onDisplayTypeChanged={mockOnDisplayTypeChanged}
      onDisplayWorkTypeChanged={mockOnDisplayWorkTypeChanged}
      filter=""
    />)
    
    const selectElement = screen.getByRole("combobox")
    fireEvent.change(selectElement, { target: { value: Constants.DISPLAY_TYPE_SKILL } })
    
    expect(mockOnDisplayTypeChanged).toHaveBeenCalledWith(Constants.DISPLAY_TYPE_SKILL)
  })
  
  it("calls onDisplayWorkTypeChanged when radio button changes", () => {
    render(<Search 
      onFilterChanged={mockOnFilterChanged}
      onDisplayTypeChanged={mockOnDisplayTypeChanged}
      onDisplayWorkTypeChanged={mockOnDisplayWorkTypeChanged}
      filter=""
    />)
    
    const radioButtons = screen.getAllByRole("radio")
    fireEvent.click(radioButtons[2]); // Klicka på den tredje radioknappen (DISPLAY_WORK_TYPE_OCCUPATIONS)
    
    expect(mockOnDisplayWorkTypeChanged).toHaveBeenCalled()
  })
  
  it("updates state when EventDispatcher fires EVENT_TAXONOMY_SET_SEARCH_TYPE", async () => {
    const { container } = render(<Search 
      onFilterChanged={mockOnFilterChanged}
      onDisplayTypeChanged={mockOnDisplayTypeChanged}
      onDisplayWorkTypeChanged={mockOnDisplayWorkTypeChanged}
      filter=""
    />)
    
    // Simulera att EventDispatcher.add anropas i useEffect
    const addCallback = (EventDispatcher.add as Mock).mock.calls[0][0] // Cast to Mock
    
    // Använd act för att uppdatera state
    await act(async () => {
      // Anropa callback-funktionen med testdata
      addCallback({
        type: Constants.DISPLAY_TYPE_SKILL,
        radio: Constants.DISPLAY_WORK_TYPE_OCCUPATIONS
      })
    })
    
    // Kontrollera att radioknapparna inte visas när displayType inte är DISPLAY_TYPE_WORK_SSYK
    // Vi använder container.querySelectorAll istället för screen.queryAllByRole eftersom
    // React Testing Library kan ha problem med att hitta element som har försvunnit
    const radioButtons = container.querySelectorAll(".search_radio_group")
    expect(radioButtons.length).toBe(0)
  })
  
  it.skip("removes event listener on unmount", () => {
    const { unmount } = render(<Search 
      onFilterChanged={mockOnFilterChanged}
      onDisplayTypeChanged={mockOnDisplayTypeChanged}
      onDisplayWorkTypeChanged={mockOnDisplayWorkTypeChanged}
      filter=""
    />)
    
    // Spara referens till callback-funktionen
    const addCallback = (EventDispatcher.add as Mock).mock.calls[0][0] // Cast to Mock
    
    // Avmontera komponenten
    unmount()
    
    // Kontrollera att EventDispatcher.remove anropades med samma callback
    expect(EventDispatcher.remove).toHaveBeenCalledWith(addCallback)
  })
  
  it("updates filter when props change", async () => {
    const { rerender } = render(<Search 
      onFilterChanged={mockOnFilterChanged}
      onDisplayTypeChanged={mockOnDisplayTypeChanged}
      onDisplayWorkTypeChanged={mockOnDisplayWorkTypeChanged}
      filter=""
    />)
    
    // Kontrollera att sökfältet är tomt
    const filterInput = await screen.findByTestId("search-filter-input") as HTMLInputElement // Use findByTestId and cast
    expect(filterInput.value).toBe("")
    
    // Använd act för att uppdatera props
    await act(async () => {
      // Rendera om komponenten med nytt filter
      rerender(<Search 
        onFilterChanged={mockOnFilterChanged}
        onDisplayTypeChanged={mockOnDisplayTypeChanged}
        onDisplayWorkTypeChanged={mockOnDisplayWorkTypeChanged}
        filter="nytt filter"
      />)
    })
    
    // Kontrollera att sökfältet har uppdaterats
    expect(filterInput.value).toBe("nytt filter")
  })
})