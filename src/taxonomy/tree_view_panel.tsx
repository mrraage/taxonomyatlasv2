import React from "react";
import TreeView from "../components/treeview";
import Search from "./search";

interface TreeViewPanelProps {
  items: any[];
  isLoading: boolean;
  filter: string;
  preSelectType: { key: string; value: any } | null;
  relatedSkills: any[]; // Add relatedSkills prop
  onDisplayTypeChanged: (type: any, preSelectType: any, conceptType: any) => void;
  onDisplayWorkTypeChanged: (type: any) => void;
  onFilterChanged: (filter: string) => void;
  onItemClicked: (item: any) => void;
  onPreSelect: (item: any) => boolean;
}

const TreeViewPanel: React.FC<TreeViewPanelProps> = ({
  items,
  isLoading,
  filter,
  preSelectType,
  relatedSkills, // Destructure relatedSkills
  onDisplayTypeChanged,
  onDisplayWorkTypeChanged,
  onFilterChanged,
  onItemClicked,
  onPreSelect,
}) => {
  return (
    <div className="search_panel">
      <Search
        onDisplayTypeChanged={onDisplayTypeChanged}
        onDisplayWorkTypeChanged={onDisplayWorkTypeChanged}
        onFilterChanged={onFilterChanged}
        filter={filter}
      />
      {/* Render relatedSkills as chips here */}
      {relatedSkills && relatedSkills.length > 0 && (
        <div className="related-skills-container p-4 mt-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Related Skills:</h4>
          <div className="flex flex-wrap gap-2">
            {relatedSkills.map((skill) => (
              <span
                key={skill.id}
                className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full cursor-pointer hover:bg-blue-200"
                onClick={() => onItemClicked(skill)} // Allow clicking on chips
                title={skill.label} // Show full label on hover
              >
                {skill.label}
              </span>
            ))}
          </div>
        </div>
      )}
      <TreeView
        preSelectCallback={onPreSelect}
        isLoading={isLoading}
        filter={filter}
        roots={items}
        preSelectObject={preSelectType}
        onClick={onItemClicked}
      />
    </div>
  );
};

export default TreeViewPanel;