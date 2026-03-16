"use client";

import React from 'react';
import { DndContext, DragEndEvent, TouchSensor, MouseSensor, useSensor, useSensors, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useAppStore } from '@/store/useAppStore';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GripVertical, Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step3GroupsProps {
  onContinue: () => void;
}

const DraggableStudent = ({ student }: { student: any }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: student.id,
    data: { type: 'Student', student }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 1000 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "flex items-center gap-1.5 bg-white rounded-full px-2 py-1 shadow-sm border border-zinc-200 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md",
        isDragging && "opacity-50 shadow-xl scale-105"
      )}
    >
      <Avatar className="h-6 w-6 pointer-events-none">
        <AvatarImage src={student.photo_preview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`} />
        <AvatarFallback className="text-[10px]">{student.first_name?.[0]}</AvatarFallback>
      </Avatar>
      <span className="text-xs font-bold text-zinc-800 pointer-events-none truncate max-w-[70px]">
        {student.first_name} {student.last_name?.[0]}.
      </span>
      <GripVertical className="h-3 w-3 text-zinc-300" />
    </div>
  );
};

const DroppableGroup = ({ group, students }: { group: any, students: any[] }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: group.id,
    data: { type: 'Group', group }
  });

  return (
    <Card 
      ref={setNodeRef}
      className={cn(
        "group-card rounded-[2rem] bg-white shadow-lg border-2 transition-all duration-300 min-h-[120px]",
        isOver ? "border-indigo-500 bg-indigo-50/30 scale-[1.02]" : "border-zinc-100"
      )}
    >
      <CardHeader className="p-3 pb-1">
        <div className="flex items-center gap-2">
          <div className={cn("w-2.5 h-2.5 rounded-full", group.color)} />
          <CardTitle className="text-base font-black text-zinc-900">
            {group.name}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="flex flex-wrap gap-1.5">
          {students.map((student) => (
            <DraggableStudent key={student.id} student={student} />
          ))}
          {students.length === 0 && !isOver && (
            <div className="w-full py-3 border-2 border-dashed border-zinc-50 rounded-2xl flex items-center justify-center">
              <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest text-center">Empty</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const Step3Groups = ({ onContinue }: Step3GroupsProps) => {
  const { 
    draftStudents, 
    draftGroups, 
    setDraftStudents
  } = useAppStore();

  const sensors = useSensors(
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const studentId = active.id as string;
    const groupId = over.id as string;

    if (active.data.current?.type === 'Student' && over.data.current?.type === 'Group') {
      setDraftStudents(draftStudents.map(student => 
        student.id === studentId ? { ...student, group_id: groupId } : student
      ));
    }
  };

  const unassignedStudents = draftStudents.filter(student => !student.group_id);
  const allStudentsAssigned = draftStudents.length > 0 && unassignedStudents.length === 0;

  const handleRandomize = () => {
    if (unassignedStudents.length === 0 || draftGroups.length === 0) return;
    const shuffled = [...unassignedStudents].sort(() => Math.random() - 0.5);
    const updated = [...draftStudents];
    shuffled.forEach((student, index) => {
      const groupId = draftGroups[index % draftGroups.length].id;
      const idx = updated.findIndex(s => s.id === student.id);
      if (idx !== -1) updated[idx] = { ...updated[idx], group_id: groupId };
    });
    setDraftStudents(updated);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {draftGroups.map((group) => (
            <DroppableGroup
              key={group.id}
              group={group}
              students={draftStudents.filter(s => s.group_id === group.id)}
            />
          ))}
        </div>

        {/* Randomize button */}
        {unassignedStudents.length > 0 && (
          <Button
            variant="outline"
            onClick={handleRandomize}
            className="w-full rounded-2xl border-indigo-200 text-indigo-600 font-bold hover:bg-indigo-50 h-11"
          >
            <Shuffle className="h-4 w-4 mr-2" /> Assegnazione Casuale
          </Button>
        )}

        {/* Unassigned pool with fixed max-height */}
        <div className="bg-zinc-50/50 p-4 rounded-[2.5rem] border border-zinc-100 flex flex-col">
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">
            Unassigned Pool ({unassignedStudents.length})
          </h3>
          <div className="max-h-[20vh] overflow-y-auto no-scrollbar">
            <div className="flex flex-wrap gap-2">
              {unassignedStudents.length === 0 ? (
                <div className="text-center text-zinc-300 py-6 w-full font-bold uppercase text-xs tracking-widest">
                  All Students Assigned
                </div>
              ) : (
                unassignedStudents.map((student) => (
                  <DraggableStudent key={student.id} student={student} />
                ))
              )}
            </div>
          </div>
        </div>

        <Button 
          onClick={onContinue}
          disabled={!allStudentsAssigned}
          className="w-full rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black py-6 shadow-xl shadow-zinc-200 transition-all disabled:opacity-50 text-sm uppercase tracking-widest"
        >
          {allStudentsAssigned ? "Initialize Educational Week" : `Assign ${unassignedStudents.length} more students`}
        </Button>
      </div>
    </DndContext>
  );
};

export default Step3Groups;