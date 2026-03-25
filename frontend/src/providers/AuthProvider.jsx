import React, { createContext, useState } from 'react'
// Step 1:
export const AuthStateContext = createContext(null);
export const AuthActionsContext = createContext(null);
const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);

    const login = (payload) =>{
        console.log(payload);
        setUser(payload);
    }

    const logout = ()=>{
        setUser(null);
        localStorage.removeItem("accessToken");

        window.location.href = "/";
    }

    const stateValues = {user};
    const actionValues = {login, logout}

    return (
        <AuthStateContext value={stateValues}>
            <AuthActionsContext value={actionValues}>
                {children}
            </AuthActionsContext>
        </AuthStateContext>
    )
}

export default AuthProvider;