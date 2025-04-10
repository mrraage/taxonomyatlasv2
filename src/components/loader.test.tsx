import { describe, it, expect, vi } from "vitest"
import React from "react"
import { render, screen } from "@testing-library/react"
import Loader from "./loader"

// vi.mock('react-i18next', () => ({
//  useTranslation: () => Component => {
//     Component.defaultProps = { ...Component.defaultProps, t: (i18nKey: string) => i18nKey };
//     return Component;
//   },
// }));

describe("Loader", () => {
  it("renders a loader with default text", () => {
    render(<Loader />)

    // Check if the loader elements exist
    expect(screen.getByTestId("loader-container")).toBeInTheDocument()
    expect(screen.getByTestId("loader-spinner")).toBeInTheDocument()
    
    // Check if it displays the default text "Loading..."
    expect(screen.getByTestId("loader-text")).toHaveTextContent("Loading ...")
  })

  it("renders a loader with custom text", () => {
    const customText = "Please wait"
    render(<Loader text={customText} />)
    
    // Check if it displays the custom text
    expect(screen.getByTestId("loader-text")).toHaveTextContent(customText)
  })
})