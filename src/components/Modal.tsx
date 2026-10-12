import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { TaskList, TaskListProps } from './TaskList';
import { ChoreItem, ChoreLog, ChoreCategory } from '../types';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  icon?: string | React.ReactNode;
  children?: React.ReactNode;
  maxWidthClass?: string;
  maxHeightClass?: string;
  footer?: React.ReactNode;
}

/**
 * Standard Modal / Popup component meeting all requirements:
 * 1. Fixed backdrop positioning (fixed inset-0 z-50 flex items-center justify-center)
 * 2. Box sizing & scroll isolation (max-w-2xl max-h-[85vh] flex flex-col; inner body flex-1 overflow-y-auto)
 * 3. Locks background page body scroll with useEffect ('hidden' -> 'unset')
 * 4. Renders clean, unnested content
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidthClass = 'max-w-2xl',
  maxHeightClass = 'max-h-[85vh]',
  footer,
}) => {
  // Prevent background page body scroll while modal is open, restore on cleanup
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in"
    >
      {/* Modal Box */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${maxWidthClass} ${maxHeightClass} flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 sm:border-4 border-yellow-300 overflow-hidden text-slate-800 dark:text-slate-100`}
      >
        {/* Header */}
        {(title || icon) && (
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-yellow-50/60 dark:bg-slate-800/60">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              {icon && typeof icon === 'string' ? (
                <span className="text-2xl shrink-0">{icon}</span>
              ) : (
                icon
              )}
              <div className="min-w-0">
                {typeof title === 'string' ? (
                  <h3 className="font-black text-base sm:text-xl text-slate-900 dark:text-white truncate">
                    {title}
                  </h3>
                ) : (
                  title
                )}
                {subtitle && (
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer shrink-0"
              title="Close"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Inner Body: isolated scroll container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const ModalPopup = Modal;

export interface TaskListModalProps extends Omit<ModalProps, 'children'>, TaskListProps {
  chores: ChoreItem[];
  logs?: ChoreLog[];
  categories?: ChoreCategory[];
}

/**
 * TaskListModal: Dedicated chore/task list modal that embeds ONLY the raw <TaskList />
 * without any nested page headers, iframes, or full view layouts inside the modal body.
 */
export const TaskListModal: React.FC<TaskListModalProps> = ({
  isOpen,
  onClose,
  title = 'Task Missions',
  subtitle = 'Household chore & routine checklist',
  icon = '📋',
  chores,
  logs,
  categories,
  onToggleComplete,
  onSelectTask,
  selectedTaskId,
  showCategoryBadge = true,
  emptyMessage,
  footer,
  maxWidthClass = 'max-w-2xl',
  maxHeightClass = 'max-h-[85vh]',
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={icon}
      maxWidthClass={maxWidthClass}
      maxHeightClass={maxHeightClass}
      footer={footer}
    >
      {/* Clean raw list component: no nested page header, iframe, or full view layout */}
      <TaskList
        chores={chores}
        logs={logs}
        categories={categories}
        onToggleComplete={onToggleComplete}
        onSelectTask={onSelectTask}
        selectedTaskId={selectedTaskId}
        showCategoryBadge={showCategoryBadge}
        emptyMessage={emptyMessage}
      />
    </Modal>
  );
};
