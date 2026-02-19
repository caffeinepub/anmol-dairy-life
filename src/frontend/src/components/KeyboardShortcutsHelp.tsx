import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate and interact with the application efficiently
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Global Navigation */}
          <section>
            <h3 className="text-lg font-semibold mb-3 text-foreground">Global Navigation</h3>
            <div className="space-y-2">
              <ShortcutRow keys={['Ctrl', '1']} description="Switch to Dairy section" />
              <ShortcutRow keys={['Ctrl', '2']} description="Switch to Transactions section" />
              <ShortcutRow keys={['Ctrl', '3']} description="Switch to Settings section" />
              <ShortcutRow keys={['?']} description="Show this help dialog" />
            </div>
          </section>

          {/* Dairy Section */}
          <section>
            <h3 className="text-lg font-semibold mb-3 text-foreground">Dairy Section</h3>
            <div className="space-y-2">
              <ShortcutRow keys={['Ctrl', 'M']} description="Go to Milk Collection" />
              <ShortcutRow keys={['Ctrl', 'B']} description="Go to Bill Generator" />
              <ShortcutRow keys={['Ctrl', 'D']} description="Go to Data Reports" />
              <ShortcutRow keys={['Ctrl', 'S']} description="Go to Sell Module" />
              <ShortcutRow keys={['Ctrl', 'C']} description="Go to Cash Module" />
            </div>
          </section>

          {/* Forms & Dialogs */}
          <section>
            <h3 className="text-lg font-semibold mb-3 text-foreground">Forms & Dialogs</h3>
            <div className="space-y-2">
              <ShortcutRow keys={['Enter']} description="Submit form or confirm action" />
              <ShortcutRow keys={['Escape']} description="Close dialog or cancel action" />
              <ShortcutRow keys={['Tab']} description="Move to next field" />
              <ShortcutRow keys={['Shift', 'Tab']} description="Move to previous field" />
            </div>
          </section>

          {/* Search & Lists */}
          <section>
            <h3 className="text-lg font-semibold mb-3 text-foreground">Search & Lists</h3>
            <div className="space-y-2">
              <ShortcutRow keys={['Ctrl', 'F']} description="Focus search input" />
              <ShortcutRow keys={['↑']} description="Navigate up in lists" />
              <ShortcutRow keys={['↓']} description="Navigate down in lists" />
              <ShortcutRow keys={['Enter']} description="Select focused item" />
            </div>
          </section>

          {/* Print & Export */}
          <section>
            <h3 className="text-lg font-semibold mb-3 text-foreground">Print & Export</h3>
            <div className="space-y-2">
              <ShortcutRow keys={['Ctrl', 'P']} description="Generate PDF (Bill or Transaction History)" />
            </div>
          </section>

          {/* Tab Navigation */}
          <section>
            <h3 className="text-lg font-semibold mb-3 text-foreground">Tab Navigation</h3>
            <div className="space-y-2">
              <ShortcutRow keys={['←']} description="Previous tab" />
              <ShortcutRow keys={['→']} description="Next tab" />
              <ShortcutRow keys={['Enter']} description="Activate focused tab" />
              <ShortcutRow keys={['Space']} description="Activate focused tab" />
            </div>
          </section>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> On Mac, use <kbd className="px-2 py-1 bg-background rounded border">Cmd</kbd> instead of <kbd className="px-2 py-1 bg-background rounded border">Ctrl</kbd>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ShortcutRow({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded hover:bg-muted/50">
      <span className="text-sm text-muted-foreground">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <span key={index} className="flex items-center gap-1">
            <kbd className="px-2 py-1 text-xs font-semibold bg-background border border-border rounded shadow-sm">
              {key}
            </kbd>
            {index < keys.length - 1 && <span className="text-muted-foreground">+</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
