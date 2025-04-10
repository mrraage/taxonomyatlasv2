import Constants from "./constants.ts"
class Rest {
    currentRequest: any
    onError: null
    currentErrorCallback: any

    setupCallbacks(http, onSuccess, onError) {
        this.currentRequest = http
        http.onerror = () => {
            if(this.onError != null) {
                onError(http.status)
            }
        }
        http.onload = () => {
            if(http.status >= 200 && http.status < 300) {
                if(onSuccess != null) {
                    try {
                        var response = http.response.split("\"taxonomy/").join("\"")
                        response = response.split("preferred-label").join("preferredLabel")
                        onSuccess(JSON.parse(response))
                    } catch(err) {
                        console.log("Exception", err)
                    }
                }
            } else {
                if(onError != null) {
                    onError(http.status)
                }
            }
        }
    }

    abort() {
        if(this.currentRequest) {
            this.currentRequest.abort()
        }
        if(this.currentErrorCallback) {
            this.currentErrorCallback(499); //Client Closed Request
        }
        this.currentRequest = null
    }

    getPromise(func) {
		return new Promise((resolve, reject) => {
			var http = new XMLHttpRequest()
			http.onerror = () => {
				reject(http.status)
			}
			http.onload = () => {
				if(http.status >= 200 && http.status < 300) {
					try {
						var response = http.response.split("\"taxonomy/").join("\"")
						response = response.split("preferred-label").join("preferredLabel")
						response = JSON.parse(response)
						resolve(response)
					} catch(err) {
						console.log("Exception", err)
					}
				} else {
					reject(http.status)
				}
            }
            console.log("GET", Constants.REST_IP + func)
			http.open("GET", Constants.REST_IP + func, true)
			// http.setRequestHeader("api-key", Constants.REST_API_KEY)
			http.setRequestHeader("Accept", "application/json")
			http.send()
		})
	}

    get(func, onSuccess, onError) {
        var http = new XMLHttpRequest()
        this.setupCallbacks(http, onSuccess, onError)
        http.open("GET", Constants.REST_IP + func, true)
//        http.setRequestHeader("api-key", Constants.REST_API_KEY)
        http.setRequestHeader("Accept", "application/json")
        http.send()
    }

    post(func, onSuccess, onError) {
        var http = new XMLHttpRequest()
        this.setupCallbacks(http, onSuccess, onError)
        http.open("POST", Constants.REST_IP + func, true)
//        http.setRequestHeader("api-key", Constants.REST_API_KEY)
        http.setRequestHeader("Accept", "application/json")
        http.send()
    }

    patch(func, onSuccess, onError) {
        var http = new XMLHttpRequest()
        this.setupCallbacks(http, onSuccess, onError)
        http.open("PATCH", Constants.REST_IP + func, true)
//        http.setRequestHeader("api-key", Constants.REST_API_KEY)
        http.setRequestHeader("Accept", "application/json")
        http.send()
    }

    delete(func, onSuccess, onError) {
        var http = new XMLHttpRequest()
        this.setupCallbacks(http, onSuccess, onError)
        http.open("DELETE", Constants.REST_IP + func, true)
//        http.setRequestHeader("api-key", Constants.REST_API_KEY)
        http.setRequestHeader("Accept", "application/json")
        http.send()
    }

    getConcept(id, version, onSuccess, onError) {
        this.get("/main/concepts?id=" + id + (version != null ? "&version=" + version : ""), onSuccess, onError)
    }

    getAutocompleteConcepts(query, version, onSuccess, onError) {
        this.get("/suggesters/autocomplete?query-string=" + encodeURIComponent(query) + (version != null ? "&version=" + version : ""), onSuccess, onError)
    }
    
    getVersions(onSuccess, onError) {
        this.get("/main/versions", onSuccess, onError)
    }

    getConceptChanges(fromVersion, toVersion, onSuccess, onError) {
        this.get("/main/concept/changes?after-version=" + fromVersion + "&to-version-inclusive=" + toVersion, onSuccess, onError)
    }
    
    getRelationChanges(fromVersion, toVersion, onSuccess, onError) {
        this.get("/main/relation/changes?after-version=" + fromVersion + "&to-version-inclusive=" + toVersion, onSuccess, onError)
    }

    getGraphQlPromise(query) {
        return this.getPromise("/graphql?query=" + encodeURIComponent(query))
    }

    getGraphQL(query, onSuccess, onError) {
        var encodedQuery = encodeURIComponent("query Atlas {\n" + query + "\n}\n")
        this.get("/graphql?query=" + encodedQuery + "&operationName=Atlas", onSuccess, onError)
    }

    getVersionsPromise() {
		return this.getPromise("/main/versions")
    }

    getTypesLocalization(onSuccessCallback, onError) {
        var onSuccess = (data) => {
            onSuccessCallback(data.data.concept_types)
        }
        var query = "concept_types(version: \"next\")"
            + "{ id label_en label_sv }"
        this.getGraphQL(query, onSuccess, onError)
    }

    async awaitGraphQl(query) {
        console.dir(query)
        try {
            return await this.getGraphQlPromise(query)
        } catch(error) {
            if(error) {
                console.log(error)
            }
        }
        return null
    }

}

export default new Rest