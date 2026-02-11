import React, { useState } from 'react'
import { useRef } from 'react';
import { useEffect } from 'react';
// import { useEffect } from "react";
const page = () => {
  const boxRef = useRef(null)
  const [first, setfirst] = useState([{u:"",a:""}]);
  const [inp, setInp] = useState("");
  const [iny, set] = useState(false);
 
  const hand = (e) => {
    setInp(e.target.value); 
  }

  const chg = async() => {
    if(inp===""){
      return;
    }
    set(true);
    setfirst([...first,{ u:inp,a:"thinking...."}]); 
        try{
 const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({inp})
    });
    if (!res.ok) {
    if (res.status === 429) { 
           setfirst([...first, { u: inp, a: "too many request.." }]);
      return;
    }}
    let data = await res.json();
    console.log(data.ans)
    
    if(data){
       setTimeout(() => {
                 setfirst([...first,{ u:inp,a:data.ans}]);  
      },1000);
      }
    }catch (error) {  
     setfirst([...first, { u: inp, a: "please check your internet connection....  " }]);
  }     
    setInp("");        
  }
  
  console.log(first)
 useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight - 100;
    }
  }, [inp]);
  useEffect(() => {
  fetch(`${import.meta.env.VITE_BACKEND_URL}/clear`, {
    method: "DELETE"
  });
}, []);
 const bn=(i)=>{
          console.log(first[i].u)  
              navigator.clipboard.writeText(first[i].u)
           }
            const an=(i)=>{
          console.log(first[i].u)  
              navigator.clipboard.writeText(first[i].a)
           }
  return (
    <>
     {!iny && <><h1 className='text'>welcome to the ai</h1></>}
<div className="animatedBg">
          <div ref={boxRef} className='msg'> 
               <div className='ih'> 
                  {/* <img className='im' src="data:image/png;base64,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" alt="" /> */}
                  <div>Hello! User 👋</div>
                  </div>
        {first.map((item, i) => {
          return (
            <> 
           {item.u && <> <div className='fle'> <div  key={i} className='con1'>{item.u}</div> <span onClick={()=>bn(i)} className='to'>copy</span></div></>}
            {item.a &&<> <div className='fl'><div className='con2'>{item.a}</div><div onClick={()=>an(i)} className='tup'>copy</div></div></>}
            </>
          );
        })}
        <div className='sen'> 
          <div className='inp'>
            <input 
              onChange={hand}
              value={inp}
              className='tex'
              type="text"
              placeholder='Ask Any quetions '
               onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
            chg() 
    }
  }}
            />
            <span onClick={chg} className='btn'>send</span>
           </div>
        </div>
      </div> 
      </div>
    </>
  )
}
export default page





 