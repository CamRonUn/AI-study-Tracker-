import {baseURL, loadToken} from './config'

export const getQuiz = async (course, startDate) => {
    try {
        const token = await loadToken()
        const response = await fetch(`${baseURL}/quiz/newquiz`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                course: course,
                start_date: startDate || null
            })
        })
        const data = await response.json()
        return data
    } catch (err) {
        throw err
    }
} 

export const FinisQuiz = async (answers, subject) => {
    // userEmail removed — backend now gets it from the JWT token
    try {
        const token = await loadToken()
        const response = await fetch(`${baseURL}/quiz/evaluate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                answers: answers,
                subject: subject,
            })
        })
        const data = await response.json()
        // returns { score, result_id }
        return data
    } catch (err) {
        throw err
    }
} 

export const getQuizResult = async (resultId) => {
    // Poll this after evaluate to get the AI summary once it's ready
    try {
        const token = await loadToken()
        const response = await fetch(`${baseURL}/quiz/result/${resultId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        const data = await response.json()
        return data  // { summary, score, ready }
    } catch (err) {
        throw err
    }
}