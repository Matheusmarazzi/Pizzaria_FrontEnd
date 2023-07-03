import { promises } from "dns";
import { createContext, ReactNode, useState, useEffect } from "react";
import {destroyCookie, setCookie, parseCookies} from 'nookies';
import Router from "next/router";
import { api } from "../services/apiClient";
import { toast } from "react-toastify";

type AuthCOntextData ={
    user: Userprops;
    isAuthenticated:boolean;
    signIn:(credentials:SignInProps)=> Promise<void>
    signOut:()=> void;
    signUp:(credentials :SignUpProps)=> Promise<void>;

}
type SignInProps={
    email:string;
    password:string;
}
type Userprops={
    id:string;
    name: string;
    email:string;
}
type AuthProviderProps={
    children: ReactNode;
}
type SignUpProps={
    name:string;
    email:string;
    password:string;
}



export const AuthContext = createContext({} as AuthCOntextData);

export function signOut(){
    try{
        destroyCookie(undefined, '@nextauth.token');
        Router.push('/');

    }catch{
        console.log("erro ao deslogar")
    }
}

export function AuthProvider({children}:AuthProviderProps){
    const [user, setUser ] = useState<Userprops>();
    const isAuthenticated = !!user;

    useEffect(()=>{
        const {'@nextauth.token':token} = parseCookies();

        if(token){
            api.get('/me').then(response=>{
                const {id,name,email} = response.data;

                setUser({
                    id, 
                    name, 
                    email
                })
            })
            .catch(()=>{
                signOut();
            })
        }
    },[])

    async function signIn({email, password}: SignInProps){
        try{
            const response = await api.post('/session', {
                email,
                password
            })
            const {id, name, token} = response.data;
            setCookie(undefined, '@nextauth.token', token,{
                maxAge: 60 * 60* 24 * 30,
                path:"/"
            })


            setUser({
                id,
                name,
                email
            })
            api.defaults.headers['Authorization'] = `Bearer ${token}`

            Router.push("/dashboard");
            toast.success('logado com sucesso')

            // console.log(response.data)
        }catch(err){
            toast.error("erro ao acessar");
            console.log(err)
        }
    }

    async function signUp({name,email,password}:SignUpProps){
        try{
            const response = await api.post('/users', {
                name,
                email,
                password,

            })
            toast.success("cadastrado com sucesso");
            Router.push('/');
        }catch(err){
            toast.error("ERRO AO CADASTRAR")
            console.log( err)
        }
    }

    return(
        <AuthContext.Provider value={{user, isAuthenticated, signIn, signOut, signUp}}>
            {children}
        </AuthContext.Provider>
    )
}