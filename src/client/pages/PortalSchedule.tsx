import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Title, Text, Card, Group, Badge, Button, Stack, ActionIcon, Switch, Timeline } from '@mantine/core';
import { IconArrowLeft, IconBookmark, IconBookmarkFilled, IconMapPin, IconUser } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function PortalSchedule() {
  const { token } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState<any>(null);
  const [mySessions, setMySessions] = useState(false);
  const [filterTrack, setFilterTrack] = useState('');

  const load = () => {
    if(token) fetch('/api/portal/'+token+'/sessions').then(r=>r.json()).then(setData).catch(()=>{});
  };
  useEffect(() => { load(); }, [token]);

  const toggleBookmark = async (sid:string) => {
    await fetch('/api/portal/'+token+'/bookmark', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session_id:sid})});
    load();
  };

  if(!data) return <Container><Text>Loading...</Text></Container>;

  let sessions = data.sessions || [];
  if(mySessions) sessions = sessions.filter((s:any)=>s.booked);

  const byDate: Record<string, any[]> = {};
  for(const s of sessions) {
    if(!byDate[s.session_date]) byDate[s.session_date] = [];
    byDate[s.session_date].push(s);
  }

  const tracks = [...new Set((data.sessions||[]).map((s:any)=>s.track).filter(Boolean))];

  return (
    <Container size="sm" py="md">
      <Group mb="md"><ActionIcon variant="subtle" onClick={()=>nav(-1)}><IconArrowLeft size={20}/></ActionIcon>
        <Title order={3} style={{flex:1}}>Schedule</Title>
        <Switch label="My Schedule" checked={mySessions} onChange={e=>setMySessions(e.currentTarget.checked)} />
      </Group>

      {tracks.length > 0 && (
        <Group mb="md">
          <Button size="xs" variant={filterTrack===''?'filled':'light'} onClick={()=>setFilterTrack('')}>All</Button>
          {tracks.map((t:string)=>(
            <Button key={t} size="xs" variant={filterTrack===t?'filled':'light'} onClick={()=>setFilterTrack(t)}>{t}</Button>
          ))}
        </Group>
      )}

      {Object.entries(byDate).length === 0 && <Text c="dimmed" ta="center" py="xl">{mySessions ? 'No bookmarked sessions' : 'No sessions scheduled'}</Text>}

      {Object.entries(byDate).map(([date, sList]) => (
        <Card key={date} withBorder mb="md" padding="sm" radius="md">
          <Text fw={600} mb="sm">{date}</Text>
          {sList.filter((s:any)=>!filterTrack||s.track===filterTrack).map((s:any, i:number) => (
            <motion.div key={s.id} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:i*0.05}}>
              <Card withBorder mb="xs" padding="sm" radius="sm">
                <Group justify="space-between">
                  <Stack gap={2} style={{flex:1}}>
                    <Text fw={500}>{s.title}</Text>
                    <Group gap={4}>
                      <Text size="xs" c="dimmed">{s.start_time} - {s.end_time}</Text>
                      {s.speaker_name && <><IconUser size={12}/><Text size="xs">{s.speaker_name}</Text></>}
                      {s.location_name && <><IconMapPin size={12}/><Text size="xs">{s.location_name}</Text></>}
                    </Group>
                    {s.track && <Badge size="sm" variant="light" mt={2}>{s.track}</Badge>}
                  </Stack>
                  <ActionIcon variant={s.booked?'filled':'subtle'} color="blue" onClick={()=>toggleBookmark(s.id)}>
                    {s.booked ? <IconBookmarkFilled size={18} /> : <IconBookmark size={18} />}
                  </ActionIcon>
                </Group>
              </Card>
            </motion.div>
          ))}
        </Card>
      ))}
    </Container>
  );
}
