import { canSSRAuth } from "../../utils/canSSRAuth"
import Head from "next/head";
import { Header } from "../../components/Header";
import styles from './styles.module.scss';
import { FiRefreshCcw } from "react-icons/fi";
import { setupApiClient } from "../../services/api";
import { useState } from "react";
import Modal from 'react-modal';
import { ModalOrder } from "../../components/ModalOrder";

type OrderProps={
    id:string;
    table: string | number;
    name:string | null;
    status:boolean;
    draft:boolean;
}

interface HomeProps{
    orders: OrderProps[];
    
}

export type OrderItemProps ={
    id:string;
    amount:number;
    order_id:string;
    product_id:string;
    product:{
        id:string;
        name:string;
        description:string;
        price:string;
        banner:string;
    }
    order:{
        id:string;
        table:string | number;
        status:boolean;
        name:string|null;
    }
}

export default function Dashboard({orders}:HomeProps){

    const [orderList, setOrderList] = useState(orders || []);


    function handleCloseModal(){
        setModalVisible(false)
    }

     async function handleOpenModalView(id:string){
        const apiClient = setupApiClient();
        const response = await apiClient.get('/order/detail', {
            params:{
                order_id:id
            }
        })
        setModalItem(response.data);
        setModalVisible(true);
    }
    async function handleFinishItem(id:string){
        const apiClient = setupApiClient();
        await apiClient.put('/order/finish', {
        
            order_id:id,
        })

        const response = await apiClient.get('/orders');
        setOrderList(response.data);
        setModalVisible(false); 
    }  


    Modal.setAppElement('#__next')

    const [modalItem, setModalItem] = useState<OrderItemProps[]>();
    const [modalVisible, setModalVisible] = useState(false);

    async function handleRefreshOrders(){
        const apiClient = setupApiClient();
        const response = await apiClient.get('/orders');
        setOrderList(response.data);
    }

    return(
        <>
            <Head>
                <title>Painel - Marazzi pizzaria</title>    
            </Head>
            <div>
                <Header/>
                <main className={styles.container}>
                    <div className={styles.containerHeader}>
                        <h1>Últimos pedidos</h1>
                        <button>
                            <FiRefreshCcw onClick={handleRefreshOrders} size={25} color="3fffa3"/>
                        </button>
                    </div>
                    <article className={styles.listOrder}>

                        {orderList.length === 0 && (
                            <span className={styles.emptyList}>
                                Nenhum Pedido está aberto
                            </span>
                        )}
                        {orderList.map(item =>(
                            <section key={item.id} className={styles.orderItem}>
                                <button onClick={()=>handleOpenModalView(item.id)}>
                                    <div className={styles.tag}></div>
                                    <span>Mesa {item.table}</span>
                                </button>
                            </section>
                        ))}
                        
                        
                    </article>
                </main>

                {modalVisible && (
                    <ModalOrder 
                    isOpen={modalVisible}
                    onRequestClose={handleCloseModal}
                    Order={modalItem}
                    handleFinishOrder={handleFinishItem}
                    />
                )}
            </div>        
        
        </>
    )
}


export const getServerSideProps = canSSRAuth(async (ctx)=>{

    const apiClient = setupApiClient(ctx)
    
    const response = await apiClient.get('/orders');
    
    
    return{
        props:{
            orders:response.data
        }
    }
})