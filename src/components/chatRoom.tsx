import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
export default function chatRoom(){

    useEffect(()=>{
        supa()
    },[])

    const supa = async () => {
        const {data, error} = await supabase.from('groups').select('*');
        console.log(data)
    }

    const userGrps = async ()=>{
        
        
    }
    return(
        <>
        
        </>
    )
}