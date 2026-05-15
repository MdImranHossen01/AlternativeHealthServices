'use client';

import { useState } from 'react';
import {
  MoreVertical,
  Edit,
  Trash2,
  Settings,
  PlusCircle,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface AdminActionsProps {
  type: 'service' | 'course';
  slug: string;
  name: string;
  id?: string;
}

export function AdminActions({ type, slug, name, id }: AdminActionsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if user is admin
  const isAdmin = (session?.user as any)?.role === 'admin' || (session?.user as any)?.role === 'super_admin';

  if (!isAdmin) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const endpoint = type === 'service' ? `/api/services/${slug}` : `/api/courses/${slug}`;
      const res = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete ${type}`);
      }

      toast.success(`${type === 'service' ? 'Service' : 'Course'} deleted successfully`);
      router.push(type === 'service' ? '/services' : '/courses');
      router.refresh();
    } catch (err: any) {
      console.error(`Error deleting ${type}:`, err);
      toast.error(err.message || `Error deleting ${type}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const editPath = type === 'service' ? `/admin/services/${slug}` : `/admin/courses/${slug}`;
  const managePath = type === 'service' ? '/admin/services' : '/admin/courses';
  const createPath = type === 'service' ? '/admin/services/new' : '/admin/courses/new';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-muted transition-colors">
            <MoreVertical className="h-5 w-5 text-muted-foreground" />
            <span className="sr-only">Open admin menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => router.push(editPath)} className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" /> Edit {type === 'service' ? 'Service' : 'Course'}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setShowDeleteModal(true)} 
            className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete {type === 'service' ? 'Service' : 'Course'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push(managePath)} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" /> Manage {type === 'service' ? 'Services' : 'Courses'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(createPath)} className="cursor-pointer">
            <PlusCircle className="mr-2 h-4 w-4" /> Create {type === 'service' ? 'Service' : 'Course'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Delete {type === 'service' ? 'Service' : 'Course'}</DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete <span className="font-bold text-foreground">"{name}"</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex-row gap-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              className="flex-1 sm:flex-none rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 sm:flex-none rounded-xl font-bold"
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isDeleting ? "Deleting..." : `Yes, Delete ${type === 'service' ? 'Service' : 'Course'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
