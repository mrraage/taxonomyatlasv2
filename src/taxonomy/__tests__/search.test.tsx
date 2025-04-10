/// <reference types="@testing-library/jest-dom" />
import React from "react"
import { render, screen, fireEvent, act } from "@testing-library/react"
import { describe, it, expect, beforeEach, vi, Mock } from "vitest" // Import Mock type
import i18n from "i18next" // Import i18n instance
import Search from "../search.tsx"
import Constants from "../../context/constants.ts"
import EventDispatcher from "../../context/event_dispatcher.tsx"

describe("Search Component", () => {
  const mockOnFilterChanged = vi.fn()
  const mockOnDisplayTypeChanged = vi.fn()
  const mockOnDisplayWorkTypeChanged = vi.fn()
  
  beforeEach(async () => { // Make beforeEach async
    vi.clearAllMocks()
    // Set language to Swedish before each test
    await i18n.changeLanguage('sv');
  })
  
  // Keep test async because beforeEach is async
  it("renders correctly with default props", async () => {
    render(<Search
      onFilterChanged={mockOnFilterChanged}
      onDisplayTypeChanged={mockOnDisplayTypeChanged}
      onDisplayWorkTypeChanged={mockOnDisplayWorkTypeChanged}
      filter=""
      displayType={Constants.DISPLAY_TYPE_WORK_SSYK}
    />)
    
    // Kontrollera att sökfältet finns (language is now 'sv')
    expect(await screen.findByTestId("search-filter-input")).toBeInTheDocument() // Use findByTestId
    
    // Kontrollera att select-elementet finns
    const selectElement = screen.getByRole("combobox")
    expect(selectElement).toBeInTheDocument()
    
    // Kontrollera att radioknapparna finns
    const radioButtons = screen.getAllByRole("radio")
    expect(radioButtons.length).toBe(4)
  })
  
  it("calls onFilterChanged when filter input changes", async () => { // Make test async
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
      displayType={Constants.DISPLAY_TYPE_WORK_SSYK}
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
    
    // Simulera att EventDispatcher.add anropas i componentDidMount
    // Cast to Mock to access .mock property safely
    const addCallback = (EventDispatcher.add as Mock).mock.calls[0][0]
    
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
  
  it("calls onFilterChanged when search input changes", () => {
    const mockOnFilterChanged = vi.fn()
    
    const { container } = render(
      <Search
        onFilterChanged={mockOnFilterChanged}
        onDisplayTypeChanged={vi.fn()}
        onDisplayWorkTypeChanged={vi.fn()}
        filter=""
      />
    )
    
    // Hitta sökfältet
    const searchInput = container.querySelector("input[type='text']") // Use single quotes for consistency
    
    // Simulera att användaren skriver i sökfältet (ensure element exists)
    if (searchInput) {
      fireEvent.change(searchInput, { target: { value: "test" } })
    } else {
      throw new Error("Search input not found");
    }
    
    // Kontrollera att onFilterChanged anropades med rätt värde
    expect(mockOnFilterChanged).toHaveBeenCalledWith("test")
  })
  
  it("calls onDisplayTypeChanged when dropdown changes", () => {
    const mockOnDisplayTypeChanged = vi.fn()
    
    const { container } = render(
      <Search
        onFilterChanged={vi.fn()}
        onDisplayTypeChanged={mockOnDisplayTypeChanged}
        onDisplayWorkTypeChanged={vi.fn()}
        filter=""
      />
    )
    
    // Hitta dropdown-menyn
    const dropdown = container.querySelector("select")
    
    // Simulera att användaren väljer ett annat alternativ (ensure element exists)
    if (dropdown) {
      fireEvent.change(dropdown, { target: { value: Constants.DISPLAY_TYPE_SKILL } })
    } else {
      throw new Error("Dropdown select not found");
    }
    
    // Kontrollera att onDisplayTypeChanged anropades med rätt värde
    expect(mockOnDisplayTypeChanged).toHaveBeenCalledWith(Constants.DISPLAY_TYPE_SKILL)
  })
  
  it("calls onDisplayWorkTypeChanged when radio button is clicked", () => {
    const mockOnDisplayWorkTypeChanged = vi.fn()
    
    render(
      <Search
        onFilterChanged={vi.fn()}
        onDisplayTypeChanged={vi.fn()}
        filter=""
        onDisplayWorkTypeChanged={mockOnDisplayWorkTypeChanged}
        displayType={Constants.DISPLAY_TYPE_WORK_SSYK}
      />
    )
    
    // Hitta radioknapparna
    const radioButtons = screen.getAllByRole("radio")
    
    // Kontrollera att det finns radioknapparna
    expect(radioButtons.length).toBe(4)
    
    // Simulera att användaren klickar på en radioknapp (DISPLAY_WORK_TYPE_OCCUPATIONS)
    fireEvent.click(radioButtons[2]); // Välj den tredje radioknappen
    
    // Kontrollera att onDisplayWorkTypeChanged anropades med rätt värde
    expect(mockOnDisplayWorkTypeChanged).toHaveBeenCalledWith(Constants.DISPLAY_WORK_TYPE_OCCUPATIONS)
  })
  
  it.skip("shows which radio button is selected", () => {
    render(
      <Search
        onFilterChanged={vi.fn()}
        onDisplayTypeChanged={vi.fn()}
        onDisplayWorkTypeChanged={vi.fn()}
        filter=""
        displayType={Constants.DISPLAY_TYPE_WORK_SSYK}
        displayRadioValue={Constants.DISPLAY_WORK_TYPE_OCCUPATIONS}
      />
    )
    
    // Hitta alla radioknapparna
    const radioButtons = screen.getAllByRole("radio")
    
    // Kontrollera att rätt radioknapp är markerad
    // Cast to HTMLInputElement to access value
    const occupationsRadio = radioButtons.find(
      radio => (radio as HTMLInputElement).value === Constants.DISPLAY_WORK_TYPE_OCCUPATIONS
    )
    
    // Ensure the radio button was found before checking
    expect(occupationsRadio).toBeDefined();
    expect(occupationsRadio).toBeChecked()
    
    // Kontrollera att de andra radioknapparna inte är markerade
    // Cast to HTMLInputElement to access value
    const otherRadios = radioButtons.filter(
      radio => (radio as HTMLInputElement).value !== Constants.DISPLAY_WORK_TYPE_OCCUPATIONS
    )
    
    otherRadios.forEach(radio => {
      expect(radio).not.toBeChecked() // This should now work due to the triple-slash directive
    })
  })
  
  it("shows radio buttons when switching back to DISPLAY_TYPE_WORK_SSYK", async () => {
    const { container } = render(
      <Search
        onFilterChanged={vi.fn()}
        onDisplayTypeChanged={vi.fn()}
        filter=""
        onDisplayWorkTypeChanged={vi.fn()}
        displayType={Constants.DISPLAY_TYPE_WORK_SSYK}
      />
    )
    
    // Kontrollera att radioknapparna visas från början
    let radioButtons = screen.getAllByRole("radio")
    expect(radioButtons.length).toBe(4)
    
    // Byt till ett annat läge
    const selectElement = screen.getByRole("combobox")
    fireEvent.change(selectElement, { target: { value: Constants.DISPLAY_TYPE_SKILL } })
    
    // Kontrollera att radioknapparna försvinner
    expect(screen.queryAllByRole("radio").length).toBe(0)
    
    // Byt tillbaka till DISPLAY_TYPE_WORK_SSYK
    fireEvent.change(selectElement, { target: { value: Constants.DISPLAY_TYPE_WORK_SSYK } })
    
    // Kontrollera att radioknapparna visas igen
    radioButtons = screen.getAllByRole("radio")
    expect(radioButtons.length).toBe(4)
  })
})