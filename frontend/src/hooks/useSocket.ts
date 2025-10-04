import { useEffect, useState } from "react"

export const useSocket = ()=>{
    const [socket, setSocket] = useState<WebSocket | null>(null)

    useEffect(()=>{
         const wsUrl = import.meta.env.VITE_BACKEND_URL;
         console.log(wsUrl);
        const ws = new WebSocket(wsUrl);
        ws.onopen = ()=>{
            console.log("connected");
            setSocket(ws);
            console.log(socket);
        }

        ws.onclose = ()=>{
            console.log("disconnected");
            setSocket(null);
        }

        return ()=>{
            ws.close();
        }
    }, [])

    return socket;
}