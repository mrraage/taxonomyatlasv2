class GraphQL {
  GRAPHQL_DEFAULT_ITEM: string
  GRAPHQL_SSYK_LIST_TYPE: string
  GRAPHQL_SSYK_LIST_TYPE_ITEM: string
  GRAPHQL_SSYK_LIST_TYPE_FRAGMENT: string
  GRAPHQL_SSYK_STRUCTURE: string
  GRAPHQL_SSYK_GROUPS: string
  GRAPHQL_ISCO_STRUCTURE: string
  GRAPHQL_OCCUPATIONS: string
  GRAPHQL_FIELDS: string
  GRAPHQL_SKILLS: string
  GRAPHQL_SKILL_COLLECTIONS: string
  GRAPHQL_GENERIC_SKILLS: string
  GRAPHQL_SWE_SKILLS: string
  GRAPHQL_INDUSTRY: string
  GRAPHQL_KEYWORDS: string
  GRAPHQL_JOB_TITLES: string
  GRAPHQL_LANGUAGE: string
  GRAPHQL_EDUCATION: string
  GRAPHQL_GEOGRAPHY: string
  GRAPHQL_OCCUPATION_DESC: string
  GRAPHQL_ESCO_OCCUPATION: string
  GRAPHQL_ESCO_SKILL: string
  GRAPHQL_FORECAST_OCCUPATIONS: string
  GRAPHQL_BAROMETER_OCCUPATIONS: string
  GRAPHQL_OTHER: string
  GRAPHQL_CONCEPT_BASE: string
  GRAPHQL_CONCEPT_SSYK_ITEM: string
  GRAPHQL_CONCEPT_ISCO_ITEM: string
  GRAPHQL_CONCEPT_SKILL_ITEM: string
  GRAPHQL_CONCEPT_SSYK_PARENT_ITEM: string

  constructor() {

    // graphql fragments
    this.GRAPHQL_DEFAULT_ITEM =
      "id " +
      "type " +
      "uri " +
      "esco_uri " +
      "label: preferred_label " +
      "alternativeLabels: alternative_labels " +
      "sortOrder: sort_order "
    this.GRAPHQL_SSYK_LIST_TYPE = "ssyk_type"
    this.GRAPHQL_SSYK_LIST_TYPE_ITEM = "..." + this.GRAPHQL_SSYK_LIST_TYPE + " "
    this.GRAPHQL_SSYK_LIST_TYPE_FRAGMENT =
      " fragment " + this.GRAPHQL_SSYK_LIST_TYPE + " on Concept {" +
      this.GRAPHQL_DEFAULT_ITEM +
      "ssyk_code: ssyk_code_2012 " +
      "}"

    // graphql queries
    this.GRAPHQL_SSYK_STRUCTURE =
      this.graphQlGenerateQuery([this.graphQlConceptQuery(null, "type: \"ssyk-level-1\"",
        this.GRAPHQL_SSYK_LIST_TYPE_ITEM +
        "children: narrower(type: \"ssyk-level-2\") {" +
        this.GRAPHQL_SSYK_LIST_TYPE_ITEM +
        "children: narrower(type: \"ssyk-level-3\") {" +
        this.GRAPHQL_SSYK_LIST_TYPE_ITEM +
        "children: narrower(type: \"ssyk-level-4\") {" +
        this.GRAPHQL_SSYK_LIST_TYPE_ITEM +
        "children: narrower(type: \"occupation-name\") {" + this.GRAPHQL_DEFAULT_ITEM + "}" +
        "}" +
        "}" +
        "}"
      )]) + this.GRAPHQL_SSYK_LIST_TYPE_FRAGMENT

    this.GRAPHQL_SSYK_GROUPS =
      this.graphQlGenerateQuery([this.graphQlConceptQuery(null, "type: \"ssyk-level-4\"",
        this.GRAPHQL_SSYK_LIST_TYPE_ITEM +
        "children: narrower(type: \"occupation-name\") {" + this.GRAPHQL_DEFAULT_ITEM + "}"
      )]) + this.GRAPHQL_SSYK_LIST_TYPE_FRAGMENT

    this.GRAPHQL_ISCO_STRUCTURE =
      this.graphQlGenerateQuery([this.graphQlConceptQuery(null, "type: \"isco-level-4\"",
        this.GRAPHQL_DEFAULT_ITEM +
        "isco_code: isco_code_08 "
      )])

    this.GRAPHQL_OCCUPATIONS =
      this.graphQlGenerateQuery([this.graphQlConceptQuery(null, "type: \"occupation-name\"",
        this.GRAPHQL_DEFAULT_ITEM
      )])

    this.GRAPHQL_FIELDS =
      this.graphQlGenerateQuery([this.graphQlConceptQuery(null, "type: \"occupation-field\"",
        this.GRAPHQL_DEFAULT_ITEM +
        "children: narrower(type: \"ssyk-level-4\") {" +
        this.GRAPHQL_SSYK_LIST_TYPE_ITEM +
        "children: narrower(type: \"occupation-name\") {" + this.GRAPHQL_DEFAULT_ITEM + "}" +
        "}"
      )]) + this.GRAPHQL_SSYK_LIST_TYPE_FRAGMENT

    this.GRAPHQL_SKILLS =
      this.graphQlGenerateQuery([this.graphQlConceptQuery(null, "type: \"skill-headline\"",
        this.GRAPHQL_DEFAULT_ITEM +
        "children: narrower(type: \"skill\") {" +
        this.GRAPHQL_DEFAULT_ITEM +
        "}"
      )])

    this.GRAPHQL_SKILL_COLLECTIONS =
      this.graphQlGenerateQuery([this.graphQlConceptQuery("skill_collections", "type: \"skill-collection\"",
        this.GRAPHQL_DEFAULT_ITEM +
        "children: related(type: \"skill\") {" +
        this.GRAPHQL_DEFAULT_ITEM +
        "}"
      )])

    this.GRAPHQL_GENERIC_SKILLS =
      this.graphQlGenerateQuery([this.graphQlConceptQuery("generic_skills", "type: \"skill-group\"",
        this.GRAPHQL_DEFAULT_ITEM +
        "children: narrower(type: \"generic-skill-group\") {" +
        this.GRAPHQL_DEFAULT_ITEM +
        "children: narrower(type: \"generic-skill\") {" +
        this.GRAPHQL_DEFAULT_ITEM +
        "}" +
        "}")])

    this.GRAPHQL_SWE_SKILLS =
      this.graphQlGenerateQuery([this.graphQlConceptQuery(null, "type: \"swedish-retail-and-wholesale-council-skill\"",
        this.GRAPHQL_DEFAULT_ITEM +
        "related(type: \"occupation-name\") {" + this.GRAPHQL_DEFAULT_ITEM + "}"
      )])

    this.GRAPHQL_INDUSTRY =
      this.graphQlGenerateQuery([this.graphQlConceptQuery("sni", "type: \"sni-level-1\"",
        this.GRAPHQL_DEFAULT_ITEM +
        "sni_level_code_2007 " +
        "code: sni_level_code_2007 " +
        "children: narrower(type: \"sni-level-2\") {" +
        this.GRAPHQL_DEFAULT_ITEM +
        "sni_level_code_2007 " +
        "code: sni_level_code_2007 " +
        "children: narrower(type: \"sni-level-3\") {" +
        this.GRAPHQL_DEFAULT_ITEM +
        "sni_level_code_2007 " +
        "code: sni_level_code_2007 " +
        "children: narrower(type: \"sni-level-4\") {" +
        this.GRAPHQL_DEFAULT_ITEM +
        "sni_level_code_2007 " +
        "code: sni_level_code_2007 " +
        "children: narrower(type: \"sni-level-5\") {" +
        this.GRAPHQL_DEFAULT_ITEM +
        "sni_level_code_2007 " +
        "code: sni_level_code_2007 " +
        "}" +
        "}" +
        "}" +
        "}")])

    this.GRAPHQL_KEYWORDS =
      this.graphQlGenerateQuery([this.graphQlConceptQuery("keyword", "type: \"keyword\"",
        this.GRAPHQL_DEFAULT_ITEM +
        "related {" + this.GRAPHQL_DEFAULT_ITEM + "}"
      )])

    this.GRAPHQL_JOB_TITLES =
      this.graphQlGenerateQuery([this.graphQlConceptQuery("job_title", "type: \"job-title\"",
        this.GRAPHQL_DEFAULT_ITEM +
        "related {" + this.GRAPHQL_DEFAULT_ITEM + "}"
      )])

    this.GRAPHQL_LANGUAGE =
      this.graphQlGenerateQuery([
        this.graphQlConceptQuery("language", "type: \"language\"",
          this.GRAPHQL_DEFAULT_ITEM +
          "iso_639_3_alpha_2_2007 " +
          "iso_639_3_alpha_3_2007 "
        ),
        this.graphQlConceptQuery("language_level", "type: \"language-level\"",
          this.GRAPHQL_DEFAULT_ITEM
        )]
      )

    this.GRAPHQL_EDUCATION =
      this.graphQlGenerateQuery([
        this.graphQlConceptQuery("sun_education_field", "type: \"sun-education-field-1\"",
          this.GRAPHQL_DEFAULT_ITEM +
          "sun_education_field_code_2020 " +
          "code: sun_education_field_code_2020 " +
          "children: narrower(type: \"sun-education-field-2\") {" +
          this.GRAPHQL_DEFAULT_ITEM +
          "sun_education_field_code_2020 " +
          "code: sun_education_field_code_2020 " +
          "children: narrower(type: \"sun-education-field-3\") {" +
          this.GRAPHQL_DEFAULT_ITEM +
          "sun_education_field_code_2020 " +
          "code: sun_education_field_code_2020 " +
          "children: narrower(type: \"sun-education-field-4\") {" +
          this.GRAPHQL_DEFAULT_ITEM +
          "sun_education_field_code_2020 " +
          "code: sun_education_field_code_2020 " +
          "}" +
          "}" +
          "}"
        ),
        this.graphQlConceptQuery("sun_education_level", "type: \"sun-education-level-1\"",
          this.GRAPHQL_DEFAULT_ITEM +
          "sun_education_level_code_2020 " +
          "code: sun_education_level_code_2020 " +
          "children: narrower(type: \"sun-education-level-2\") {" +
          this.GRAPHQL_DEFAULT_ITEM +
          "sun_education_level_code_2020 " +
          "code: sun_education_level_code_2020 " +
          "children: narrower(type: \"sun-education-level-3\") {" +
          this.GRAPHQL_DEFAULT_ITEM +
          "sun_education_level_code_2020 " +
          "code: sun_education_level_code_2020 " +
          "}" +
          "}"
        )]
      )

    this.GRAPHQL_GEOGRAPHY =
      this.graphQlGenerateQuery([this.graphQlConceptQuery("continent", "type: \"continent\"",
        this.GRAPHQL_DEFAULT_ITEM +
        "children: narrower(type: \"country\") {" +
        "iso_3166_1_alpha_2_2013 " +
        "iso_3166_1_alpha_3_2013 " +
        this.GRAPHQL_DEFAULT_ITEM +
        "children: narrower(type: \"region\") {" +
        this.GRAPHQL_DEFAULT_ITEM +
        "nuts_level_3_code_2013 " +
        "nuts_level_3_code_2021 " +
        "children: narrower(type: \"municipality\") {" +
        this.GRAPHQL_DEFAULT_ITEM +
        "lau_2_code_2015 " +
        "national_nuts_level_3_code_2019 " +
        "}" +
        "}" +
        "}"
      )])

    this.GRAPHQL_OCCUPATION_DESC =
      this.graphQlGenerateQuery([
        this.graphQlConceptQuery("employment_duration", "type: \"employment-duration\"", this.GRAPHQL_DEFAULT_ITEM),
        this.graphQlConceptQuery("work_place_environment", "type: \"work-place-environment\"", this.GRAPHQL_DEFAULT_ITEM),
        this.graphQlConceptQuery("wage_type", "type: \"wage-type\"", this.GRAPHQL_DEFAULT_ITEM),
        this.graphQlConceptQuery("worktime_extent", "type: \"worktime-extent\"", this.GRAPHQL_DEFAULT_ITEM),
        this.graphQlConceptQuery("occupation_experience_year", "type: \"occupation-experience-year\"", this.GRAPHQL_DEFAULT_ITEM),
        this.graphQlConceptQuery("employment_variety", "type: \"employment-variety\"",
          this.GRAPHQL_DEFAULT_ITEM +
          "employment_type: narrower(type: \"employment-type\") {" + this.GRAPHQL_DEFAULT_ITEM + "}" +
          "self_employment_type: narrower(type: \"self-employment-type\") {" + this.GRAPHQL_DEFAULT_ITEM + "}"
        ),]
      )

    this.GRAPHQL_ESCO_OCCUPATION =
      this.graphQlGenerateQuery(
        [this.graphQlConceptQuery("esco_occupation", "type: \"esco-occupation\"", this.GRAPHQL_DEFAULT_ITEM)
        ])

    this.GRAPHQL_ESCO_SKILL =
      this.graphQlGenerateQuery(
        [this.graphQlConceptQuery("esco_skill", "type: \"esco-skill\"", this.GRAPHQL_DEFAULT_ITEM)]
      )

    this.GRAPHQL_FORECAST_OCCUPATIONS =
      this.graphQlGenerateQuery([this.graphQlConceptQuery("forecast_occupation", "type: \"forecast-occupation\"",
        this.GRAPHQL_DEFAULT_ITEM +
        "children: related(type: \"ssyk-level-4\") {" +
        this.GRAPHQL_DEFAULT_ITEM +
        "}"
      )])

    this.GRAPHQL_BAROMETER_OCCUPATIONS =
      this.graphQlGenerateQuery([this.graphQlConceptQuery("barometer_occupation", "type: \"barometer-occupation\"",
        this.GRAPHQL_DEFAULT_ITEM +
        "children: related(type: \"occupation-name\") {" +
        this.GRAPHQL_DEFAULT_ITEM +
        "}"
      )])

    this.GRAPHQL_OTHER =
      this.graphQlGenerateQuery([this.graphQlConceptQuery("driving_licence", "type: \"driving-licence\"", this.GRAPHQL_DEFAULT_ITEM)])

    this.GRAPHQL_CONCEPT_BASE =
      "definition " +
      "type " +
      "label: preferred_label " +
      "sort_order " +
      "substitutes(type: \"occupation-name\") {" +
      "id " +
      "type " +
      "label: preferred_label " +
      "percentage: substitutability_percentage " +
      "} " +
      "keywords: related(type: \"keyword\") {" +
      "id " +
      "type " +
      "label: preferred_label " +
      "} " +
      "job_titles: related(type: \"job-title\") {" +
      "id " +
      "type " +
      "label: preferred_label " +
      "} " +
      "isco_codes: broader(type: \"isco-level-4\") {" +
      "code: isco_code_08 " +
      "label: preferred_label " +
      "} " +
      "exact_match {" + this.GRAPHQL_DEFAULT_ITEM + "} " +
      "broad_match {" + this.GRAPHQL_DEFAULT_ITEM + "} " +
      "narrow_match {" + this.GRAPHQL_DEFAULT_ITEM + "} " +
      "close_match {" + this.GRAPHQL_DEFAULT_ITEM + "} "

    this.GRAPHQL_CONCEPT_SSYK_ITEM =
      "definition " +
      "ssyk_code: ssyk_code_2012 " +
      "field: broader(type: \"occupation-field\") {" +
      "id " +
      "label: preferred_label " +
      "} " +
      "skills: related(type: \"skill\") {" +
      "id " +
      "label: preferred_label " +
      "headline: broader(type: \"skill-headline\") {" +
      "id " +
      "label: preferred_label " +
      "} " +
      "} " +
      "isco_codes: related(type: \"isco-level-4\") {" +
      "code: isco_code_08 " +
      "label: preferred_label " +
      "} "

    this.GRAPHQL_CONCEPT_ISCO_ITEM =
      "definition " +
      "isco_code: isco_code_08 " +
      "ssyk_codes: related(type: \"ssyk-level-4\") {" +
      "code: ssyk_code_2012 " +
      "label: preferred_label " +
      "} "

    this.GRAPHQL_CONCEPT_SKILL_ITEM =
      "definition " +
      "occupations: related(type: \"ssyk-level-4\") {" +
      "id " +
      "type " +
      "label: preferred_label " +
      "ssyk_code: ssyk_code_2012 " +
      "} " +
      "exact_match {" + this.GRAPHQL_DEFAULT_ITEM + "} " +
      "broad_match {" + this.GRAPHQL_DEFAULT_ITEM + "} " +
      "narrow_match {" + this.GRAPHQL_DEFAULT_ITEM + "} " +
      "close_match {" + this.GRAPHQL_DEFAULT_ITEM + "} " +
      "skill_collections: related(type: \"skill-collection\") {" +
      "id " +
      "type " +
      "label: preferred_label" +
      "} "

    this.GRAPHQL_CONCEPT_SSYK_PARENT_ITEM =
      "parent: broader(type: \"ssyk-level-4\") {" +
      "id " +
      "type " +
      "label: preferred_label " +
      "ssyk_code: ssyk_code_2012 " +
      "} "
  }

  graphQlConceptQuery(name, query, data) {
    var version = this.getArg("v")
    version = version != null ? ", version: \"" + version + "\"" : ""
    var result = (name ? name + ": " : "") + "concepts(" + query + version + ") {"
    if (data) {
      result += data
    }
    result += "}"
    return result
  }

  graphQlGenerateQuery(parts: string[]) {
    var query = "query Atlas {"
    for (var i = 0; i < parts.length; ++i) {
      query += parts[i]
    }
    query += "}"
    return query
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

}

export default new GraphQL()