'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function useDeleteCalendar() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [calendarToDelete, setCalendarToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const openDeleteDialog = (calendarId: string) => {
    setCalendarToDelete(calendarId);
    setIsDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDialogOpen(false);
    setCalendarToDelete(null);
  };

  const confirmDelete = async () => {
    if (!calendarToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/calendars/${calendarToDelete}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete calendar');
      }
      
      // Close dialog and refresh page
      closeDeleteDialog();
      router.refresh();
    } catch (err) {
      console.error('Error deleting calendar:', err);
      alert('Failed to delete calendar. Please try again later.');
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDialogOpen,
    isDeleting,
    calendarToDelete,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
  };
} 