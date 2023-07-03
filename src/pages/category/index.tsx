import { useState, FormEvent } from "react";
import { setupApiClient } from "../../services/api";
import Head from "next/head";
import { Header } from "../../components/Header";
import styles from './styles.module.scss';
import { toast } from "react-toastify";
import { canSSRAuth } from "../../utils/canSSRAuth";

export default function Category(){

    const [name,setName] = useState('');

    async function handleRegister(event:FormEvent){
        event.preventDefault();
        if(name == ''){
            return
        }
        const apiClient = setupApiClient();
        await apiClient.post('/category', {
            name: name
        })

        toast.success('categoria Cadatrada com sucesso');
        setName('');
        
    }

    return(
        <>
            <Head>
                <title>Nova Categoria - Marazzi Pizzaria</title>
            </Head>
            <Header/>
            <div>
                <main className={styles.container}>
                    <h1>Cadastrar Categoria</h1>
                    <form className={styles.form} onSubmit={handleRegister}>
                        <input
                         type="text"
                         placeholder="Digite o nome da categoria"
                         className={styles.input}
                         value={name}
                         onChange={(e)=>setName(e.target.value)}
                        />

                        <button type="submit" className={styles.buttonAdd}>
                            Cadastrar
                        </button>

                    </form>
                </main>
            </div>
        
        </>
    )
}
export const getServerSideProps = canSSRAuth(async (ctx)=>{
    return{
        props:{}
    }
})