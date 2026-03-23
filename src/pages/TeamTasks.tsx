import React, { useState, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Plus, Users, ChevronDown, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { useTeamTasks } from '@/components/team-tasks/useTeamTasks';
import KanbanColumn from '@/components/team-tasks/KanbanColumn';
import TaskModal from '@/components/team-tasks/TaskModal';
import SummaryBar from '@/components/team-tasks/SummaryBar';
import AdminOverview from '@/components/team-tasks/AdminOverview';
import type { TeamTask, TaskStatus } from '@/components/team-tasks/types';
import { STATUS_COLUMNS } from '@/components/team-tasks/types';
import { toast } from 'sonner';

function getTeamSession(): { id: string; name: string; email: string } | null {
  try {
    const raw = sessionStorage.getItem('rmh_team_session');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

const TeamTasks: React.FC = () => {
  const { isAdmin } = useAuth();
  const isMobile = useIsMobile();
  const {
    tasks, members, loading, currentMemberId, currentMemberRole,
    viewingMemberId, setViewingMemberId,
    createTask, updateTask, deleteTask, moveTask,
    loadTasks, loadAllTasks, getViewableMembers,
  } = useTeamTasks();

  const [modalTask, setModalTask] = useState<Partial<TeamTask> | null>(null);
  const [showAdminOverview, setShowAdminOverview] = useState(isAdmin);
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);
  const [activeDragTask, setActiveDragTask] = useState<TeamTask | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const swipeStartX = useRef<number | null>(null);

  const teamSession = getTeamSession();
  const backLink = teamSession ? '/team' : '/avaadminpanel';

  const viewableMembers = getViewableMembers();
  const viewingMember = members.find(m => m.id === viewingMemberId);
  const isManager = currentMemberRole === 'manager';

  const filteredTasks = viewingMemberId
    ? tasks.filter(t => t.assignee_id === viewingMemberId)
    : tasks;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const taskData = event.active.data.current;
    if (taskData?.type === 'task') {
      setActiveDragTask(taskData.task as TeamTask);
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveDragTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overData = over.data.current;

    let targetStatus: TaskStatus | null = null;

    if (overData?.type === 'column') {
      targetStatus = overData.status as TaskStatus;
    } else if (overData?.type === 'task') {
      targetStatus = (overData.task as TeamTask).status;
    } else if (typeof over.id === 'string' && over.id.startsWith('column-')) {
      targetStatus = over.id.replace('column-', '') as TaskStatus;
    }

    if (targetStatus) {
      moveTask(taskId, targetStatus);
    }
  }, [moveTask]);

  const handleDragOver = useCallback((_event: DragOverEvent) => {
  }, []);

  const handleAddTask = (status: TaskStatus) => {
    setModalTask({
      status,
      assignee_id: viewingMemberId || currentMemberId || '',
      assignee_name: viewingMember?.name || members.find(m => m.id === currentMemberId)?.name || '',
    });
  };

  const handleEditTask = (task: TeamTask) => {
    setModalTask(task);
  };

  const handleSaveTask = async (taskData: Partial<TeamTask>) => {
    try {
      if (taskData.id) {
        await updateTask(taskData.id, taskData);
        toast.success('Task updated');
      } else {
        await createTask(taskData);
        toast.success('Task created');
      }
      setModalTask(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save task';
      toast.error(message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleToggleDone = async (task: TeamTask) => {
    const newStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    await moveTask(task.id, newStatus);
  };

  const handleSelectMember = (memberId: string | null) => {
    setViewingMemberId(memberId);
    if (memberId) {
      loadTasks(memberId);
    } else {
      loadAllTasks();
    }
    setShowAdminOverview(false);
  };

  const handleMobileColumnSwipe = (direction: 'left' | 'right') => {
    setActiveColumnIndex(prev => {
      if (direction === 'left') return Math.min(prev + 1, STATUS_COLUMNS.length - 1);
      return Math.max(prev - 1, 0);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground font-orbitron">Loading tasks...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Team Tasks | Rank Me Higher</title></Helmet>
      <div className="min-h-screen bg-background text-foreground">
        <div className="border-b border-white/10 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
          <div className={`max-w-7xl mx-auto ${isMobile ? 'px-3 py-2' : 'px-4 lg:px-8 py-3'}`}>
            <div className="flex items-center gap-3">
              <Link to={backLink} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Users className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <h1 className={`font-orbitron font-bold truncate ${isMobile ? 'text-sm' : 'text-base lg:text-lg'}`}>Team Tasks</h1>
              </div>

              {(isAdmin || isManager) && viewableMembers.length > 1 && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setMemberDropdownOpen(!memberDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs"
                  >
                    {viewingMember ? (
                      <>
                        <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-cyan-400">{viewingMember.name.charAt(0)}</span>
                        </div>
                        <span className="font-bold truncate max-w-[100px]">{viewingMember.name}</span>
                      </>
                    ) : (
                      <span className="font-bold">All Members</span>
                    )}
                    <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${memberDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {memberDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 w-56 rounded-xl bg-background/95 backdrop-blur-xl border border-white/10 shadow-xl z-50 py-1 max-h-64 overflow-y-auto">
                      {isAdmin && (
                        <button
                          onClick={() => { handleSelectMember(null); setMemberDropdownOpen(false); setShowAdminOverview(true); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors ${
                            !viewingMemberId ? 'bg-cyan-500/10' : ''
                          }`}
                        >
                          <Users className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs font-bold">All Members (Dashboard)</span>
                        </button>
                      )}
                      {viewableMembers.map(m => (
                        <button
                          key={m.id}
                          onClick={() => { handleSelectMember(m.id); setMemberDropdownOpen(false); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors ${
                            viewingMemberId === m.id ? 'bg-cyan-500/10' : ''
                          }`}
                        >
                          <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-[8px] font-bold text-cyan-400">{m.name.charAt(0)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold truncate block">{m.name}</span>
                            <span className="text-[9px] text-muted-foreground">{m.role}</span>
                          </div>
                          {m.is_manager && (
                            <span className="px-1 py-0.5 rounded text-[7px] font-bold bg-purple-500/20 border border-purple-500/30 text-purple-400">MGR</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => handleAddTask('todo')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold hover:bg-cyan-500/30 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                {!isMobile && 'New Task'}
              </button>
            </div>
          </div>
        </div>

        <div className={`max-w-7xl mx-auto ${isMobile ? 'px-3 py-3' : 'px-4 lg:px-8 py-4'}`}>
          {isAdmin && showAdminOverview && !viewingMemberId ? (
            <AdminOverview
              members={members}
              tasks={tasks}
              onSelectMember={handleSelectMember}
              selectedMemberId={viewingMemberId}
            />
          ) : (
            <>
              <div className="mb-4">
                <SummaryBar tasks={filteredTasks} />
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                {isMobile ? (
                  <div>
                    <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1">
                      {STATUS_COLUMNS.map((col, idx) => {
                        const count = filteredTasks.filter(t => t.status === col.key).length;
                        return (
                          <button
                            key={col.key}
                            onClick={() => setActiveColumnIndex(idx)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                              activeColumnIndex === idx
                                ? `${col.bgColor} border ${col.color}`
                                : 'bg-white/5 border border-white/10 text-muted-foreground'
                            }`}
                          >
                            {col.label}
                            <span className="text-[10px]">({count})</span>
                          </button>
                        );
                      })}
                    </div>

                    <div
                      onTouchStart={(e) => {
                        swipeStartX.current = e.touches[0].clientX;
                      }}
                      onTouchEnd={(e) => {
                        if (swipeStartX.current === null) return;
                        const diff = swipeStartX.current - e.changedTouches[0].clientX;
                        swipeStartX.current = null;
                        if (Math.abs(diff) > 50) {
                          handleMobileColumnSwipe(diff > 0 ? 'left' : 'right');
                        }
                      }}
                    >
                      <KanbanColumn
                        status={STATUS_COLUMNS[activeColumnIndex].key}
                        tasks={filteredTasks.filter(t => t.status === STATUS_COLUMNS[activeColumnIndex].key)}
                        onEditTask={handleEditTask}
                        onDeleteTask={handleDeleteTask}
                        onToggleDone={handleToggleDone}
                        onAddTask={handleAddTask}
                      />
                    </div>

                    <div className="flex items-center justify-center gap-1.5 mt-3">
                      {STATUS_COLUMNS.map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 rounded-full transition-all ${
                            activeColumnIndex === idx ? 'bg-cyan-400 w-4' : 'bg-white/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 200px)' }}>
                    {STATUS_COLUMNS.map(col => (
                      <KanbanColumn
                        key={col.key}
                        status={col.key}
                        tasks={filteredTasks.filter(t => t.status === col.key)}
                        onEditTask={handleEditTask}
                        onDeleteTask={handleDeleteTask}
                        onToggleDone={handleToggleDone}
                        onAddTask={handleAddTask}
                      />
                    ))}
                  </div>
                )}

                <DragOverlay>
                  {activeDragTask ? (
                    <div className="bg-card/80 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-3 shadow-xl w-[280px] opacity-90">
                      <h4 className="text-sm font-semibold text-foreground truncate">{activeDragTask.title}</h4>
                      {activeDragTask.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-1">{activeDragTask.description}</p>
                      )}
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </>
          )}
        </div>

        {isAdmin && viewingMemberId && (
          <div className={`fixed ${isMobile ? 'bottom-3 left-3 right-3' : 'bottom-4 left-1/2 -translate-x-1/2'}`}>
            <button
              onClick={() => { setViewingMemberId(null); setShowAdminOverview(true); loadAllTasks(); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-background/90 backdrop-blur-xl border border-white/10 shadow-xl hover:bg-white/10 transition-all mx-auto"
            >
              <LayoutGrid className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold">Back to Dashboard</span>
            </button>
          </div>
        )}
      </div>

      {modalTask !== null && (
        <TaskModal
          task={modalTask}
          members={isAdmin || isManager ? viewableMembers : []}
          isAdmin={isAdmin}
          isManager={isManager}
          onSave={handleSaveTask}
          onClose={() => setModalTask(null)}
        />
      )}
    </>
  );
};

export default TeamTasks;
