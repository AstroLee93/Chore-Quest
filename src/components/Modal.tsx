/**
 * Modal — iOS sheet.
 * Phones: a bottom sheet with a grab handle that rises from the home
 * indicator. Tablets / desktop / the Pi kiosk: a centered, detached sheet.
 * Frosted adaptive material (light or dark per theme), 44pt close button,
 * Escape to close, and a reference-counted body scroll lock so nested
 * modals don't unlock the page underneath each other.
 */

import React, { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
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

let openModalCount = 0;

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
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;
    openModalCount += 1;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      openModalCount = Math.max(0, openModalCount - 1);
      if (openModalCount === 0) document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 ios-backdrop animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`ios-sheet ios-sheet-adaptive w-full ${maxWidthClass} ${maxHeightClass} flex flex-col overflow-hidden text-label pb-[var(--safe-bottom)] sm:pb-0`}
      >
        <div className="sheet-handle mt-2 !mb-0 sm:hidden" aria-hidden="true" />

        {(title || icon) && (
          <div className="flex items-center justify-between gap-3 px-5 pt-3 pb-3 sm:pt-4 border-b border-separator shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {icon && typeof icon === 'string' ? (
                <span className="text-2xl shrink-0" aria-hidden="true">{icon}</span>
              ) : (
                icon
              )}
              <div className="min-w-0" id={titleId}>
                {typeof title === 'string' ? (
                  <h3 className="type-headline text-label truncate">{title}</h3>
                ) : (
                  title
                )}
                {subtitle && (
                  <p className="text-[13px] text-label-secondary truncate mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn-ios-icon"
              title="Close"
              aria-label="Close"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto overscroll-contain p-5">
          {children}
        </div>

        {footer && (
          <div className="px-5 py-4 border-t border-separator shrink-0 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
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
