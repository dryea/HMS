import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { Rating, TextInput } from '@mantine/core';

export default function PortalSurvey() {
  const {token}=useParams();const nav=useNavigate();
  const [survey,setSurvey]=useState<any>(null);const [hasResponded,setHasResponded]=useState(false);
  const [answers,setAnswers]=useState<Record<string,any>>({});const [saving,setSaving]=useState(false);
  useEffect(()=>{if(token)fetch('/api/portal/'+token+'/survey').then(r=>r.json()).then((d: any)=>{setSurvey(d.survey);setHasResponded(d.has_responded);}).catch(()=>{});},[token]);
  const answered=survey?.questions?.filter((q:any)=>answers[q.id]!==undefined&&answers[q.id]!=='').length||0;const total=survey?.questions?.length||0;const progress=total?Math.round((answered/total)*100):0;
  const submit=async()=>{setSaving(true);try{await fetch('/api/portal/'+token+'/survey',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({answers})});setHasResponded(true);notifications.show({title:'Thank you!',message:'Your responses have been submitted.',color:'green'});}catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}setSaving(false);};
  if(!survey)return<div className="page-container" style={{maxWidth:480}}><div className="md3-card p-24" style={{textAlign:'center'}}><p className="md3-body-medium" style={{color:'var(--md-on-surface-variant)'}}>No survey available</p></div></div>;
  if(hasResponded)return<div className="page-container" style={{maxWidth:480}}><div className="md3-card p-24" style={{textAlign:'center'}}><IconCheck size={48} style={{color:'var(--md-tertiary)',marginBottom:8}}/><h2 className="md3-title-large m-0">Thank You!</h2></div></div>;
  return(<div className="page-container" style={{maxWidth:480}}>
    <div className="flex items-center gap-8 mb-20"><button className="md3-btn-text" onClick={()=>nav(-1)}><IconArrowLeft size={20}/></button><h1 className="md3-headline-small m-0">{survey.title}</h1></div>
    <div style={{height:8,background:'var(--md-surface-container-high)',borderRadius:9999,marginBottom:16}}><div style={{height:8,width:progress+'%',background:'var(--md-primary)',borderRadius:9999,transition:'width 300ms'}}/></div>
    <p className="md3-body-small mb-16" style={{color:'var(--md-on-surface-variant)'}}>{answered} of {total} answered</p>
    {survey.questions?.map((q:any,i:number)=>(<div key={q.id} className="md3-card p-16 mb-12"><p className="md3-body-medium m-0 mb-8" style={{fontWeight:500}}>{i+1}. {q.question}</p>
      {q.type==='rating'&&<Rating value={answers[q.id]||0} onChange={v=>setAnswers({...answers,[q.id]:v})} size="lg"/>}
      {q.type==='text'&&<TextInput value={answers[q.id]||''} onChange={e=>setAnswers({...answers,[q.id]:e.target.value})} />}
      {q.type==='choice'&&(q.options||[]).map((opt:string)=><div key={opt} className="flex items-center gap-8 mb-4"><input type="radio" checked={answers[q.id]===opt} onChange={()=>setAnswers({...answers,[q.id]:opt})} /><span className="md3-body-medium">{opt}</span></div>)}
    </div>))}
    <button className="md3-btn" style={{width:'100%'}} onClick={submit} disabled={saving}>Submit ({progress}%)</button>
  </div>);
}
