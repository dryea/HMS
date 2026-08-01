import { useState } from 'react';
import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { IconUser } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { api } from '../api/client';

function DraggableParticipant({ p }: { p: any }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: 'p_' + p.id });
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.6 : 1,
    cursor: 'grab',
  };
  return (
    <div ref={setNodeRef} {...listeners} {...attributes}
      className="md3-chip" data-selected style={{ ...style, margin: 4, display: 'inline-flex' }}>
      <IconUser size={14}/> {p.name}
    </div>
  );
}

function DroppableBed({ bed, onDrop }: { bed: any; onDrop: (bedId: string, participantId: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'bed_' + bed.id });
  return (
    <div ref={setNodeRef}
      className={'bed-card ' + (bed.is_occupied ? 'occupied' : 'vacant')}
      style={{ border: isOver ? '2px solid var(--md-primary)' : undefined, padding: 8, minHeight: 72 }}>
      <div className="md3-label-medium">{bed.label}</div>
      {bed.participant_name
        ? <div className="md3-body-small" style={{ color: 'var(--md-error)' }}>{bed.participant_name}</div>
        : <div className="md3-body-small" style={{ color: 'var(--md-tertiary)' }}>Drop here</div>}
    </div>
  );
}

export default function RoomVisualizer({ rooms, unassigned, onChanged }: { rooms: any[]; unassigned: any[]; onChanged: () => void }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    const pid = String(active.id).replace('p_', '');
    const bedId = String(over.id).replace('bed_', '');
    try {
      await api.participants.assignBed(pid, bedId);
      notifications.show({ title: 'Assigned', message: 'Participant assigned to bed successfully.', color: 'green' });
      onChanged();
    } catch (err: any) {
      notifications.show({ title: 'Error', message: err.message, color: 'red' });
    }
  };

  return (
    <div>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="md3-card p-16 mb-16">
          <p className="md3-title-medium m-0 mb-8">Unassigned ({unassigned.length})</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {unassigned.map(p => <DraggableParticipant key={p.id} p={p} />)}
            {unassigned.length === 0 && <p className="md3-body-small" style={{ color: 'var(--md-on-surface-variant)' }}>All participants assigned</p>}
          </div>
        </div>

        {rooms.map((room: any) => (
          <div key={room.id} className="md3-card p-12 mb-8">
            <div className="flex items-center gap-8 mb-8">
              <span className="md3-title-small">Room {room.room_number}</span>
              {room.wing && <span className="md3-badge" style={{ background: 'var(--md-surface-container-high)', color: 'var(--md-on-surface)' }}>{room.wing}</span>}
            </div>
            <div className="bed-grid">
              {(room.beds || []).map((bed: any) => (
                <DroppableBed key={bed.id} bed={bed} onDrop={(bid, pid) => {}} />
              ))}
            </div>
          </div>
        ))}
      </DndContext>
    </div>
  );
}
