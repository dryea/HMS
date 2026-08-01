import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ParticipantQR() {
  const {token}=useParams();const nav=useNavigate();
  useEffect(()=>{if(token)nav('/portal/'+token,{replace:true});},[token]);
  return<div className="page-container"><p>Redirecting to your dashboard...</p></div>;
}
