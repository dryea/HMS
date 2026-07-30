import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Title, Tabs, Card, TextInput, Textarea, Button, Group, Stack, Text, ColorInput, SimpleGrid, Switch, Badge, ActionIcon, FileInput, Image, Table } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPalette, IconBuilding, IconCalendar, IconSettings, IconPhoto, IconPlus, IconTrash } from '@tabler/icons-react';
import Breadcrumbs from '../components/Breadcrumbs';

export default function AdminEventConfig() {
  const { id: eventId } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [tab, setTab] = useState<string|null>('general');
  const [form, setForm] = useState({ name:'', description:'', start_date:'', end_date:'' });
  const [branding, setBranding] = useState({ logo_url:'', banner_color:'#1a1b1e', accent_color:'#4c6ef5' });
  const [customTypes, setCustomTypes] = useState<any[]>([]);
  const [newTypeName, setNewTypeName] = useState('');

  const load = async () => {
    if(!eventId) return;
    try {
      const ev = await (await fetch('/api/events/'+eventId)).json();
      setEvent(ev);
      setForm({name:ev.name,description:ev.description||'',start_date:ev.start_date,end_date:ev.end_date});
    } catch {}
    try { const b = await (await fetch('/api/branding/'+eventId)).json(); setBranding({logo_url:b.logo_url||'',banner_color:b.banner_color||'#1a1b1e',accent_color:b.accent_color||'#4c6ef5'}); } catch {}
    try { setCustomTypes(await (await fetch('/api/event-config/service-types/'+eventId)).json()); } catch {}
  };
  useEffect(() => { load(); }, [eventId]);

  const saveEvent = async () => {
    try { await fetch('/api/events/'+eventId, {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)}); notifications.show({title:'Event updated',color:'green'}); } catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}
  };

  const saveBranding = async () => {
    try { await fetch('/api/branding/'+eventId, {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(branding)}); notifications.show({title:'Branding updated',color:'green'}); } catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}
  };

  const addCustomType = async () => {
    if(!newTypeName) return;
    try { await fetch('/api/event-config/service-types', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event_id:eventId,name:newTypeName})}); setNewTypeName(''); load(); notifications.show({title:'Service type added',color:'green'}); } catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}
  };

  const uploadLogo = async (file: File|null) => {
    if(!file) return;
    const fd = new FormData(); fd.append('file', file);
    try { const r = await (await fetch('/api/event-config/upload/logo/'+eventId, {method:'POST',body:fd})).json(); setBranding({...branding,logo_url:r.url}); notifications.show({title:'Logo uploaded',color:'green'}); } catch(e:any){notifications.show({title:'Error',message:e.message,color:'red'});}
  };

  return (
    <Container pb={70}>
      <Breadcrumbs items={[{label:'Super Admin',href:'/admin'},{label:'Events',href:'/admin/events'},{label:event?.name||'',href:'/admin/events/'+eventId},{label:'Configure'}]} />
      <Title order={3} mb="md"><IconSettings size={24} style={{verticalAlign:'middle',marginRight:8}} />Event Configuration</Title>

      <Tabs value={tab} onChange={setTab}>
        <Tabs.List grow mb="md">
          <Tabs.Tab value="general" leftSection={<IconCalendar size={14} />}>General</Tabs.Tab>
          <Tabs.Tab value="branding" leftSection={<IconPalette size={14} />}>Branding</Tabs.Tab>
          <Tabs.Tab value="services" leftSection={<IconBuilding size={14} />}>Services</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="general">
          <Card withBorder padding="lg" radius="md">
            <Stack>
              <TextInput label="Event Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
              <Textarea label="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
              <SimpleGrid cols={2}>
                <TextInput label="Start Date" type="date" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} />
                <TextInput label="End Date" type="date" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})} />
              </SimpleGrid>
              <Button onClick={saveEvent}>Save Changes</Button>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="branding">
          <Card withBorder padding="lg" radius="md">
            <Stack>
              <Text size="sm" fw={500}>Logo</Text>
              {branding.logo_url && <Image src={'https://hms.sudeepdhakal.workers.dev/'+branding.logo_url} h={80} fit="contain" />}
              <FileInput accept="image/png,image/jpeg,image/svg+xml" placeholder="Upload logo" onChange={uploadLogo} />
              
              <Text size="sm" fw={500} mt="md">Preset Themes</Text>
              <SimpleGrid cols={3} spacing="sm">
                {[
                  {id:'ocean',name:'Ocean',banner:'#0D1117',accent:'#1E88E5'},
                  {id:'forest',name:'Forest',banner:'#0D1F11',accent:'#2E7D32'},
                  {id:'sunset',name:'Sunset',banner:'#1F0D0D',accent:'#E65100'},
                  {id:'royal',name:'Royal',banner:'#1A0D2E',accent:'#7B1FA2'},
                  {id:'teal',name:'Teal',banner:'#0D1F1A',accent:'#00897B'},
                  {id:'slate',name:'Slate',banner:'#111318',accent:'#546E7A'},
                ].map(p => (
                  <Card key={p.id} withBorder padding="xs" radius="md" ta="center"
                    className={'preset-card'+(branding.banner_color===p.banner&&branding.accent_color===p.accent?' active':'')}
                    onClick={()=>setBranding({...branding,banner_color:p.banner,accent_color:p.accent})}>
                    <div style={{width:'100%',height:24,background:`linear-gradient(90deg, ${p.banner}, ${p.accent})`,borderRadius:4,marginBottom:4}} />
                    <Text size="xs">{p.name}</Text>
                  </Card>
                ))}
              </SimpleGrid>
              
              <SimpleGrid cols={2}>
                <ColorInput label="Banner Color" value={branding.banner_color} onChange={v=>setBranding({...branding,banner_color:v})} />
                <ColorInput label="Accent Color" value={branding.accent_color} onChange={v=>setBranding({...branding,accent_color:v})} />
              </SimpleGrid>
              <div style={{background:`linear-gradient(135deg, ${branding.banner_color}, ${branding.accent_color})`,padding:20,borderRadius:8}}>
                <Text c="white" fw={700} size="xl" style={{textShadow:'0 1px 2px rgba(0,0,0,0.3)'}}>Preview</Text>
                <Text c="white" size="sm" opacity={0.9}>Participant portal will use these colors</Text>
              </div>
              <Button onClick={saveBranding}>Save Branding</Button>
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="services">
          <Card withBorder padding="lg" radius="md">
            <Title order={5} mb="sm">Custom Service Types</Title>
            <Group mb="md">
              <TextInput placeholder="New service name (e.g. Gala Dinner)" value={newTypeName} onChange={e=>setNewTypeName(e.target.value)} style={{flex:1}} />
              <Button onClick={addCustomType}><IconPlus size={14} /></Button>
            </Group>
            <Table>
              <Table.Thead><Table.Tr><Table.Th>Name</Table.Th><Table.Th>Type</Table.Th></Table.Tr></Table.Thead>
              <Table.Tbody>
                {customTypes.map((t:any) => (
                  <Table.Tr key={t.id}>
                    <Table.Td><Text size="sm">{t.name}</Text></Table.Td>
                    <Table.Td><Badge size="sm" color={t.event_id?'orange':'blue'}>{t.event_id?'Custom':'System'}</Badge></Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
