import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/Components/ui/sheet';

export function EntityDrawer({ open, onOpenChange, title, description, children }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[calc(100vw-5rem)] max-w-none overflow-y-auto p-0 md:w-[calc(100vw-16rem)]">
        <div className="p-6">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            {description ? <SheetDescription>{description}</SheetDescription> : null}
          </SheetHeader>
          <div className="mt-4 space-y-4">{children}</div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
