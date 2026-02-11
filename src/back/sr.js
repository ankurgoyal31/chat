import express from "express";
import cors from "cors";
import { tavily } from "@tavily/core";
import { MongoClient } from "mongodb";
import { configDotenv } from "dotenv";
import Groq from "groq-sdk";
const port = 3000;
const app = express();
app.use(cors());
app.use(express.json()); 
configDotenv();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY});
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY});
const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const db = client.db("ai");
const User = db.collection("msg")
app.delete("/clear", async (req, res) => {
  await User.deleteMany({}); 
  res.json({ ok: true });
});
    let y = ""
    async function get() {
   y = "";
 const data = (await User.find({}).toArray()).reverse().slice(0,2);
 console.log(data)
  data.forEach(item => {
    y += `User: ${item.que}\nAssistant: ${item.msg}\n\n`;
  });
console.log(y)
 }  
get() 
 async function main(que){
 let baseMessages = [
    { 
      role: 'system',
      content: `You are a personal assitant who give the answer for user.
        call websearch ( {"query"}:{"query":"string"}) , strictly first you check the current quetsion from previous content , if current question is connected to the previous conversation then  you answer to user acording to the previous content , answer shoold bhi correct means answer related to the current question , if the question is not related to the previous content then  you say the answer according to question and answer should be corect  if user say thanks and tell other words just like its then you say in singal line
        when user code mangta hai in any programming languages then you give the code in line by line , singal mai nhi dena ok only provides the code  `
    }, 
        
    { role: "user",
    content: `${y}`},
  { 
      role: 'user', 
      content: que 
    },
  
   ];
 
   const completion = await groq.chat.completions.create({ 
    model: "llama-3.3-70b-versatile",
    messages: baseMessages,              
    tools: [
      {
        type: "function",
        function: {
          name: "websearch",
          description: "search latest info",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string" }
            },
            required: ["query"]
          }
        }
      }
    ],
    tool_choice: "auto"
  });

  let tool_calls=completion.choices[0].message.tool_calls;
  if(!tool_calls){
   return completion.choices[0].message.content ;
  }
    if(tool_calls){
   for (const result of tool_calls) {
  const arg = JSON.parse(result.function.arguments);
  if (result.function.name === "websearch") {
    const re = await websearch(arg);

baseMessages.push({
      role: "tool",
      tool_call_id: result.id,
      name: "websearch",
      content: JSON.stringify(re)
       });

    const step2 = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: baseMessages
  });
  return step2.choices[0].message.content;
   }
}
 }
}
async function websearch({query}) {
  console.log(query,"........")
  const response = await tvly.search(query);
  let res = response.results.map((item)=>{return item.content}).join("\n\n")
   return res;
}
 
app.post("/ask", async (req, res) => {
  const iny = req.body.inp;
   const ans = await main(iny);
   await User.insertOne({msg:ans,que:iny});
   res.json({ans});
});
app.listen(port,(req,res)=>{
console.log("runing...")
})
