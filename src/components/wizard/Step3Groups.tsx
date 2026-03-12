"use client";

import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, useDraggable, useDroppable, TouchSensor, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useAppStore } from '@/store/useAppStore';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step3GroupsProps {
  onContinue: () => void;
}

interface DraggableStudentProps {
  student: any;
}

const DraggableStudent = ({ student }: DraggableStudentProps) => {
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
        "flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-zinc-200 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md",
        isDragging && "opacity-50 shadow-xl scale-105"
      )}
    >
      <Avatar className="h-8 w-8 pointer-events-none">
        <AvatarImage src={student.photo_preview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`} />
        <AvatarFallback>{student.first_name?.[0]}{student.last_name?.[0]}</AvatarFallback>
      </Avatar>
      <span className="font-medium text-zinc-800 pointer-events-none">
        {student.first_name} {student.last_name?.[0]}.
      </span>
      <GripVertical className="h-3 w-3 text-zinc-300 ml-1" />
    </div>
  );
};

interface DroppableGroupProps {
  group: any;
  students: any[];
  onRemove: () => void;
}

const DroppableGroup = ({ group, students, onRemove }: DroppableGroupProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: group.id,
    data: { type: 'Group', group }
  });

  return (
    <Card 
      ref={setNodeRef}
      className={cn(
        "group-card rounded-2xl bg-white shadow-lg border-2 transition-all duration-300 min-h-[120px]",
        isOver ? "border-indigo-500 bg-indigo-50/30 scale-[1.02]" : "border-zinc-100"
      )}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", group.color)} />
            <CardTitle className="text-lg font-bold text-zinc-900">
              {group.name}
            </CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-zinc-400 hover:text-zinc-600"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-wrap gap-2">
          {students.map((student) => (
            <DraggableStudent key={student.id} student={student} />
          ))}
          {students.length === 0 && !isOver && (
            <div className="w-full py-4 border-2 border-dashed border-zinc-100 rounded-xl flex items-center justify-center">
              <span className="text-xs font-medium text-zinc-300 uppercase tracking-wider">Drop here</span>
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
    setDraftStudents, 
    setDraftGroups 
  } = useAppStore();

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 },
    })
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

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {draftGroups.map((group) => (
            <DroppableGroup 
              key={group.id}
              group={group}
              students={draftStudents.filter(s => s.group_id === group.id)}
              onRemove={() => {
                setDraftGroups(draftGroups.filter(g => g.id !== group.id));
                setDraftStudents(draftStudents.map(s => 
                  s.group_id === group.id ? { ...s, group_id: undefined } : s
                ));
              }}
            />
          ))}
        </div>

        <Button 
          variant="outline" 
          onClick={() => {
            const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500', 'bg-violet-500'];
            const nextColor = colors[draftGroups.length % colors.length];
            setDraftGroups([...draftGroups, { 
              id: `group-${Date.now()}`, 
              name: `Group ${draftGroups.length + 1}`, 
              color: nextColor
            }]);
          }}
          className="w-full rounded-2xl border-zinc-200 font-bold h-14 border-dashed hover:bg-zinc-50"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Group
        </Button>

        <div className="mt-6 bg-zinc-50/50 p-6 rounded-[2rem] border border-zinc-100">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Unassigned Students</h3>
          <div className="flex flex-wrap gap-3">
            {unassignedStudents.length === 0 ? (
              <div className="text-center text-zinc-300 py-4 w-full font-medium italic">
                All students assigned
              </div>
            ) : (
              unassignedStudents.map((student) => (
                <DraggableStudent key={student.id} student={student} />
              ))
            )}
          </div>
        </div>

        <Button 
          onClick={onContinue}
          disabled={!allStudentsAssigned}
          className="w-full rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-6 shadow-xl shadow-zinc-200 transition-all disabled:opacity-50"
        >
          {allStudentsAssigned ? "Save & Finish" : "Assign all students to continue"}
        </Button>
      </div>
    </DndContext>
  );
};

export default Step3Groups;