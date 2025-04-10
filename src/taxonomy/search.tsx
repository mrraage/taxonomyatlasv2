import React from "react"
import {sortByKey} from "../context/util.ts"
import Constants from "../context/constants.ts"
import EventDispatcher from "../context/event_dispatcher.tsx"
import { useTranslation } from "react-i18next"

import { TFunction } from 'i18next'; // Import TFunction from i18next directly

interface SearchProps {
  onFilterChanged: (filter: string) => void;
  onDisplayTypeChanged: (displayType: string) => void;
  onDisplayWorkTypeChanged: (workType: string) => void;
  filter: string;
  displayType?: string;
  displayRadioValue?: string;
  t: TFunction; // Explicitly define the t prop
}

// Define state interface
interface SearchState {
  isShowingRadio: boolean;
  filter: string;
  displayType: string;
  displayRadioValue: string;
}

class Search extends React.Component<SearchProps, SearchState> { // Add SearchState here
  // No need for a separate this.t property

  constructor(props) {
    super(props)
    // No need to assign this.t in constructor
    // state
    this.state = {
      isShowingRadio: true,
      filter: "",
      displayType: Constants.DISPLAY_TYPE_WORK_SSYK,
      displayRadioValue: Constants.DISPLAY_WORK_TYPE_GROUP,
    }
  }

  componentDidMount() {
    EventDispatcher.add(this.onSetSearchType.bind(this), Constants.EVENT_TAXONOMY_SET_SEARCH_TYPE)
  }

  UNSAFE_componentWillReceiveProps(props) {
    this.setState({filter: props.filter})
  }

  onSetSearchType(value) {
    this.setState({
      isShowingRadio: value.type == Constants.DISPLAY_TYPE_WORK_SSYK,
      displayType: value.type,
      displayRadioValue: value.radio,
    })
  }

  onFilterChanged(e) {
    if(this.props.onFilterChanged) {
      this.props.onFilterChanged(e.target.value)
      this.forceUpdate()
    }
  }

  onDisplayTypeChanged(e) {
    if(this.props.onDisplayTypeChanged) {
      this.props.onDisplayTypeChanged(e.target.value)
    }
    this.setState({
      isShowingRadio: e.target.value == Constants.DISPLAY_TYPE_WORK_SSYK,
      displayType: e.target.value,
      displayRadioValue: Constants.DISPLAY_WORK_TYPE_GROUP,
    })
  }

  onDisplayRadioChanged(e) {
    if(this.props.onDisplayWorkTypeChanged) {
      this.props.onDisplayWorkTypeChanged(e.target.value)
    }
    this.setState({displayRadioValue: e.target.value})
  }

  renderSearchType() {
    var items = [
      {value: Constants.DISPLAY_TYPE_WORK_SSYK, label: this.props.t("occupations_ssyk")},
      {value: Constants.DISPLAY_TYPE_WORK_ISCO, label: this.props.t("occupations_isco")},
      {value: Constants.DISPLAY_TYPE_SKILL, label: this.props.t("skills")},
      {value: Constants.DISPLAY_TYPE_GENERIC_SKILL, label: this.props.t("generic_skills")},
      {value: Constants.DISPLAY_TYPE_SKILL_COLLECTION, label: this.props.t("db_skill-collection")},
      {value: Constants.DISPLAY_TYPE_SWE_SKILL, label: this.props.t("db_swedish-retail-and-wholesale-council-skill")},
      {value: Constants.DISPLAY_TYPE_WORK_DESC, label: this.props.t("occupation_description")},
      {value: Constants.DISPLAY_TYPE_GEOGRAPHY, label: this.props.t("geography")},
      {value: Constants.DISPLAY_TYPE_INDUSTRY, label: this.props.t("industry")},
      {value: Constants.DISPLAY_TYPE_SEARCH, label: this.props.t("db_keyword")},
      {value: Constants.DISPLAY_TYPE_LANGUAGE, label: this.props.t("db_language")},
      {value: Constants.DISPLAY_TYPE_ESCO_OCCUPATION, label: this.props.t("db_esco-occupation")},
      {value: Constants.DISPLAY_TYPE_ESCO_SKILL, label: this.props.t("db_esco-skill")},
      {value: Constants.DISPLAY_TYPE_FORECAST_OCCUPATION, label: this.props.t("db_forecast-occupation")},
      {value: Constants.DISPLAY_TYPE_BAROMETER_OCCUPATION, label: this.props.t("db_barometer-occupation")},
      {value: Constants.DISPLAY_TYPE_EDUCATION, label: this.props.t("education")},
      {value: Constants.DISPLAY_TYPE_OTHER, label: this.props.t("something_else")},
      {value: Constants.DISPLAY_TYPE_JOB_TITLE, label: this.props.t("db_job-title")},
    ]
    sortByKey(items, "label", true)
    // Map directly inside the select element
    return (
      <div className="relative">
        <select
          className="w-full p-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none shadow-sm text-gray-700"
          value={this.state.displayType}
          onChange={this.onDisplayTypeChanged.bind(this)}>
          {items.map((element, index) => ( // Map here
            <option key={index} value={element.value}>{element.label}</option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    )
  }

  renderRadioButton(value, text) {
    const isChecked = value == this.state.displayRadioValue
    return (
      <label className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors duration-200 ${isChecked ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
        <div className="relative">
          <input 
            className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
            checked={isChecked}
            value={value}
            onChange={this.onDisplayRadioChanged.bind(this)}
            type="radio"/>
          {isChecked && (
            <div className="absolute top-0 left-0 h-4 w-4 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-blue-600"></div>
            </div>
          )}
        </div>
        <span className={`text-sm ${isChecked ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
          {text}
        </span>
      </label>
    )
  }

  renderRadios() {
    if(this.state.isShowingRadio) {
      return (
        <div className="mt-4 bg-white rounded-lg border border-gray-200 shadow-sm divide-y divide-gray-100">
          {this.renderRadioButton(Constants.DISPLAY_WORK_TYPE_STRUCTURE, this.props.t("occupation_structure"))}
          {this.renderRadioButton(Constants.DISPLAY_WORK_TYPE_GROUP, this.props.t("occupation_groups"))}
          {this.renderRadioButton(Constants.DISPLAY_WORK_TYPE_OCCUPATIONS, this.props.t("occupation_only"))}
          {this.renderRadioButton(Constants.DISPLAY_WORK_TYPE_FIELDS, this.props.t("occupation_fields"))}
        </div>
      )
    }
  }

  render() {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="space-y-4">
          <div className="space-y-3">
            {this.renderSearchType()}
            <div className="relative">
              <input
                data-testid="search-filter-input" // Add data-testid
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-gray-700 placeholder-gray-400"
                placeholder={this.props.t("filter") + "..."}
                type="text"
                value={this.state.filter}
                onChange={this.onFilterChanged.bind(this)}/>
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          {this.renderRadios()}
        </div>
      </div>
    )
  }
}

// Wrapper component passes the t function from the hook
export default (props: Omit<SearchProps, 't'>) => { // Omit t from passed props type
  const { t } = useTranslation(); // Get t function from hook
  return (
    <Search {...props} t={t} /> // Pass t function as prop
  )
}