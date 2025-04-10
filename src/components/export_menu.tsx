import React from "react"
import ExportService from "../services/export_service"

interface ExportMenuProps {
  isVisible: boolean
}

const ExportMenu: React.FC<ExportMenuProps> = ({ isVisible }) => {
  if (!isVisible) {
    return null
  }

  return (
    <ul className="export_menu">
      <li onPointerDown={ExportService.exportOccupations}>
        Yrken - yrkesgrupper - yrkesområden
      </li>
      <li onPointerDown={ExportService.exportSkills}>
        Kompetenser - kompetensgrupper-yrkesgrupper
      </li>
      <li onPointerDown={ExportService.exportSsyk}>
        Yrken - SSYK
      </li>
    </ul>
  )
}

export default ExportMenu