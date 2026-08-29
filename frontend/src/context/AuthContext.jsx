import React , {createContext , useState }from 'react'

const AuthContext = createContext()

const normalizeUser = (userData) => {
  if (!userData) return null

  return {
    ...userData,
    name: userData.name || userData.username || ''
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userInfo')
    if (!savedUser) return null

    try {
      return normalizeUser(JSON.parse(savedUser))
    } catch (error) {
      localStorage.removeItem('userInfo')
      return null
    }
  })

  const login = (userData) => {
    const normalizedUser = normalizeUser(userData)
    setUser(normalizedUser)
    localStorage.setItem('userInfo', JSON.stringify(normalizedUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('userInfo')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
