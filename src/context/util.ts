export function sortValue(direction, aa, bb) {
    var a = aa
    var b = bb
    if(typeof(a) === "string" && typeof(b) === "string") {
        a = a.toLowerCase()
        b = b.toLowerCase()
        if(direction) {
            return a.localeCompare(b)
        } else {
            return -a.localeCompare(b)
        }
    }
    if(direction) {
        if(a < b) return -1
        if(a > b) return 1
    } else {
        if(a < b) return 1
        if(a > b) return -1
    }
    return 0
}

export function sortByKey(items, key, direction) {
    items.sort((a, b) => {
        return sortValue(direction, a[key], b[key])
    })
    return items
}

export function sortByCmp(items, cmp, direction) {
    items.sort((a, b) => {
        return sortValue(direction, cmp(a), cmp(b))
    })
    return items
}