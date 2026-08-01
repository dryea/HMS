import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IconUserCheck, IconTrash, IconPlus, IconAlertCircle, IconBell } from '@tabler/icons-react';

const ACTION_ICONS: Record<string, any> = { checkin: IconUserCheck, delete: IconTrash, create: IconPlus, push_broadcast: IconBell, error: IconAlertCircle };

export default function AdminActivityLog() {
  const { id: eventId } = useParams();
  const [logs, setLogs] = useState<any[]>([]);

  const load = async () => {
    try {
      const qs = eventId ? '?event_id=' + eventId : '';
      setLogs(await (await fetch('/api/system/audit' + qs)).json());
    } catch {}
  };
  useEffect(() => { load(); }, [eventId]);

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-20">
        <h1 className="md3-headline-small m-0">Activity Log</h1>
        <button className="md3-btn-text" onClick={load}>Refresh</button>
      </div>
      {logs.length === 0 ? (
        <div className="md3-card p-24" style={{textAlign:'center'}}><p className="md3-body-medium" style={{color:'var(--md-on-surface-variant)'}}>No activity recorded yet</p></div>
      ) : (
        <div className="flex flex-col gap-8">
          {logs.map((log:any) => {
            const Icon = ACTION_ICONS[log.action] || IconBell;
            let details = '';
            try { details = log.details ? JSON.parse(log.details) : {}; } catch {}
            return (
              <div key={log.id} className="md3-card p-12">
                <div className="flex items-center gap-8">
                  <Icon size={16} style={{color:'var(--md-primary)'}} />
                  <span className="md3-title-small" style={{textTransform:'capitalize'}}>{log.action}</span>
                  <span className="md3-badge" style={{background:'var(--md-surface-container-high)',color:'var(--md-on-surface)'}}>{log.entity_type}</span>
                  <span className="md3-body-small" style={{color:'var(--md-on-surface-variant)',marginLeft:'auto'}}>{log.created_at}</span>
                </div>
                {details && (details.name || details.message) && (
                  <p className="md3-body-small m-0 mt-4" style={{color:'var(--md-on-surface-variant)'}}>
                    {details.name || details.message} {details.from && `· ${details.from} → ${details.to}`}
                  </p>
                )}
                <p className="md3-body-small m-0 mt-4" style={{color:'var(--md-on-surface-variant)'}}>by {log.actor || 'admin'}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
