import React, { useContext } from 'react';
import { useAuth } from './authContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoutes = ({children, allowedRoles}) => {
    const {role} = useAuth();


    // if(!authenticated){
    //     return <Navigate to='/'/>

    // }

    console.log("🔹 Checking role in ProtectedRoutes:", role); // Debugging
    if(!allowedRoles.includes(role)){
        return <Navigate to='/'/>
    }
    
    return children;
 
}

export default ProtectedRoutes
