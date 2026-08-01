import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TextInput, Card, Badge, Switch, Group, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconTrash } from '@tabler/icons-react';

export default function AdminSurvey() {
  const {id:eventId}=useParams();
  const [survey,setSurvey]=useState<any>(null);
  const [responses,setResponses]=useState<any>(null);
  const [questions,setQuestions]=useState<any[]>([]);
  const [active,setActive]=useState(false);
  const load=async()=>{if(!eventId)return;try{const s=await(await fetch('/api/surveys/'+eventId)).json();setSurvey(s.id?s:null);setQuestions(s.questions?(typeof s.questions==='string'?JSON.parse(s.questions):s.questions):[]);setActive(s.active?true:false);}catch{}try{const r=await(await fetch('/api/surveys/'+eventId+'/responses')).json();setResponses(r);}catch{}};
  useEffect(()=>{load();},[eventId]);
  const save=async()=>{try{await fetch('/api/surveys/'+eventId,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({questions,active})});notifications.show({title:'Survey saved',color:'green'});load();}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}};
  return(<div className="page-container">
    <h1 className="md3-headline-small m-0 mb-20">Post-Event Survey</h1>
    <div className="flex items-center gap-12 mb-20"><Switch label="Survey Active" checked={active} onChange={e=>setActive(e.currentTarget.checked)} /></div>
    {questions.map((q:any,i:number)=>(<div key={q.id} className="md3-card p-16 mb-12">
      <div className="flex items-center gap-8 mb-8"><span className="md3-label-large">Q{i+1}</span>
        <select value={q.type} onChange={e=>{const qs=[...questions];qs[i].type=e.target.value;setQuestions(qs);}} style={{padding:'4px 8px',borderRadius:8,border:'1px solid var(--md-outline-variant)',background:'var(--md-surface-container-high)'}}>
          <option value="rating">Rating (1-5)</option><option value="text">Text</option><option value="choice">Multiple Choice</option></select>
        <button className="md3-btn-text" style={{height:28,minWidth:28,padding:0,color:'var(--md-error)',marginLeft:'auto'}} onClick={()=>setQuestions(questions.filter((_:any,idx:number)=>idx!==i))}><IconTrash size={14}/></button>
      </div>
      <TextInput placeholder="Question" value={q.question} onChange={e=>{const qs=[...questions];qs[i].question=e.target.value;setQuestions(qs);}} />
      {q.type==='choice'&&<TextInput mt={4} placeholder="Options (comma separated)" value={q.options?.join(',')||''} onChange={e=>{const qs=[...questions];qs[i].options=e.target.value.split(',').map((s:string)=>s.trim());setQuestions(qs);}} />}
    </div>))}
    <div className="flex gap-8 mb-20"><button className="md3-btn-text" onClick={()=>setQuestions([...questions,{id:'q'+Date.now(),question:'',type:'rating',options:[]}])}><IconPlus size={18}/> Add Question</button><button className="md3-btn" onClick={save}>Save Survey</button></div>
    {responses?.analytics&&Object.keys(responses.analytics).length>0&&(<div className="md3-card p-20"><h3 className="md3-title-medium m-0 mb-12">Results ({responses.total} responses)</h3>
      {Object.values(responses.analytics).map((a:any)=>(<div key={a.question} className="mb-12"><p className="md3-body-medium" style={{fontWeight:500}}>{a.question}</p>
        {a.type==='rating'&&<div className="flex gap-8">{[1,2,3,4,5].map(n=><span key={n} className="md3-badge" style={{background:'var(--md-primary-container)',color:'var(--md-on-primary-container)'}}>{n}: {a.counts[String(n)]||0}</span>)}</div>}
      </div>))}
    </div>)}
  </div>);
}
