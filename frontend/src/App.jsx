import { useState } from 'react'
import axios from 'axios'
import './App.css'

const api = axios.create({ baseURL: '/api' })

function App() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const callApi = async (label, request) => {
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const { data } = await request()
      setResults({ label, data })
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <h1>SweetBook API 테스트</h1>

      <div className="buttons">
        <button onClick={() => callApi('API 연결 테스트', () => api.get('/health'))}>
          API 연결 테스트
        </button>
        <button onClick={() => callApi('충전금 조회', () => api.get('/credits'))}>
          충전금 조회
        </button>
        <button onClick={() => callApi('책 목록 조회', () => api.get('/books'))}>
          책 목록 조회
        </button>
        <button onClick={() => callApi('주문 목록 조회', () => api.get('/orders'))}>
          주문 목록 조회
        </button>
      </div>

      <div className="result-area">
        {loading && <p className="loading">요청 중...</p>}
        {error && <p className="error">오류: {error}</p>}
        {results && (
          <div>
            <h2>{results.label}</h2>
            <pre>{JSON.stringify(results.data, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
