import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Title, Text, Card, Stack, TextInput, Button, ActionIcon, Select } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

export default function PortalDietary() {
  const { token } = useParams();
  const nav = useNavigate();
  const [dietary, setDietary] = useState('');

  useEffect(() => {
    if(token) fetch('/api/portal/'+token+'/dietary').then(r=>r.json()).then(d=>setDietary(d.dietary||'')).catch(()=>{});
  }, [token]);

  const save = async () => {
    try { await fetch('/api/portal/'+token+'/dietary', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({dietary})}); notifications.show({title:'Saved',color:'green'}); } catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}
  };

  return (
    <Container size="sm" py="md">
      <Group mb="md"><ActionIcon variant="subtle" onClick={()=>nav(-1)}><IconArrowLeft size={20}/></ActionIcon><Title order={3}>Dietary Preferences</Title></Group>
      <Card withBorder padding="md" radius="md">
        <Text size="sm" mb="md">Let us know about any dietary requirements for meal planning.</Text>
        <Select label="Preference" value={dietary} onChange={setDietary}
          data={['None','Vegetarian','Vegan','Gluten-free','Halal','Kosher','No preference','Other']} searchable mb="md" />
        <TextInput label="Additional notes" value={dietary} onChange={e=>setDietary(e.target.value)} placeholder="e.g. Allergic to nuts" mb="md" />
        <Button onClick={save} fullWidth>Save Preferences</Button>
      </Card>
    </Container>
  );
}
