// *Note (Farrel - 25/05/2026): Updated editCourses() to send { code, name } objects instead of plain strings. 
//                              This matches the updated backend CourseSelection model
//                              which now saves both Course_code and Course_name to the database.
//
// Backward compatibility note:
//   The backend accepts code as optional — if a teammate's frontend still sends
//   plain strings, the backend will fallback gracefully. But this frontend version
//   always sends the full { code, name } object.

import { baseURL, loadToken } from './config'

/**
 * Sends the full updated course list to the backend.
 *
 * Previously accepted: string[]  (name only) — e.g. ["COMP1100", "MATH1051"]
 * Now accepts:         { code: string, name: string }[]
 *                      e.g. [{ code: "CSSE2310", name: "Computer Systems Principles and Programming" }]
 *
 * @param picked - array of { code, name } objects
 */
export const editCourses = async (picked) => {
    try {
        const token = await loadToken()
        const response = await fetch(`${baseURL}/courses/edit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({ picked }) // picked is now [{ code, name }, ...]
        })
        const data = await response.json()
        return data
    } catch (err) {
        throw err
    }
} 

/**
 * Fetches all courses enrolled by the current user.
 * Returns: [{ Course_code, Course_name }, ...]
 */
export const getCources = async () => {
    try {
        const token = await loadToken()
        console.log("getting cources")
        const response = await fetch(`${baseURL}/courses/get`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        const data = await response.json()
        console.log(data)
        return data 
    } catch (e) {
        throw e
    }
}