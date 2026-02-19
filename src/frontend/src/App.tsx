import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DairySection from '@/components/dairy/DairySection';
import TransactionsSection from '@/components/transactions/TransactionsSection';
import SettingsSection from '@/components/settings/SettingsSection';
import KeyboardShortcutsHelp from '@/components/KeyboardShortcutsHelp';
import { useGlobalKeyboardShortcuts } from '@/hooks/useGlobalKeyboardShortcuts';
import { Milk, Receipt, Settings } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dairy');
  const [showHelp, setShowHelp] = useState(false);

  // Global keyboard shortcuts
  useGlobalKeyboardShortcuts({
    onNavigateToDairy: () => setActiveTab('dairy'),
    onNavigateToTransactions: () => setActiveTab('transactions'),
    onNavigateToSettings: () => setActiveTab('settings'),
    onShowHelp: () => setShowHelp(true),
  });

  const handleTabKeyDown = (e: React.KeyboardEvent, tabValue: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTab(tabValue);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const tabs = ['dairy', 'transactions', 'settings'];
      const currentIndex = tabs.indexOf(activeTab);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
      setActiveTab(tabs[prevIndex]);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const tabs = ['dairy', 'transactions', 'settings'];
      const currentIndex = tabs.indexOf(activeTab);
      const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
      setActiveTab(tabs[nextIndex]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
      >
        Skip to main content
      </a>

      {/* Hero Background */}
      <div 
        className="fixed inset-0 z-0 opacity-10"
        style={{
          backgroundImage: 'url(/assets/generated/hero-dairy.dim_1920x1080.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Milk className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">ANMOL DAIRY LIFE</h1>
            </div>
            <p className="text-sm text-muted-foreground">Dairy Management System</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="relative z-10 container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList
            className="grid w-full max-w-md mx-auto grid-cols-3 mb-8"
            role="tablist"
            aria-label="Main navigation tabs"
          >
            <TabsTrigger
              value="dairy"
              className="flex items-center gap-2"
              onKeyDown={(e) => handleTabKeyDown(e, 'dairy')}
              role="tab"
              tabIndex={activeTab === 'dairy' ? 0 : -1}
              aria-selected={activeTab === 'dairy'}
              aria-controls="dairy-panel"
            >
              <Milk className="h-4 w-4" />
              Dairy
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="flex items-center gap-2"
              onKeyDown={(e) => handleTabKeyDown(e, 'transactions')}
              role="tab"
              tabIndex={activeTab === 'transactions' ? 0 : -1}
              aria-selected={activeTab === 'transactions'}
              aria-controls="transactions-panel"
            >
              <Receipt className="h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center gap-2"
              onKeyDown={(e) => handleTabKeyDown(e, 'settings')}
              role="tab"
              tabIndex={activeTab === 'settings' ? 0 : -1}
              aria-selected={activeTab === 'settings'}
              aria-controls="settings-panel"
            >
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="dairy"
            className="mt-0"
            id="dairy-panel"
            role="tabpanel"
            aria-labelledby="dairy-tab"
          >
            <DairySection isActive={activeTab === 'dairy'} />
          </TabsContent>

          <TabsContent
            value="transactions"
            className="mt-0"
            id="transactions-panel"
            role="tabpanel"
            aria-labelledby="transactions-tab"
          >
            <TransactionsSection />
          </TabsContent>

          <TabsContent
            value="settings"
            className="mt-0"
            id="settings-panel"
            role="tabpanel"
            aria-labelledby="settings-tab"
          >
            <SettingsSection />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} ANMOL DAIRY LIFE. All rights reserved.</p>
            <p>
              Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Keyboard Shortcuts Help Dialog */}
      <KeyboardShortcutsHelp open={showHelp} onOpenChange={setShowHelp} />
    </div>
  );
}

export default App;
