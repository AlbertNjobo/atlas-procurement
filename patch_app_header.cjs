const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('import { NotificationsDropdown }')) {
  content = content.replace(
    "import { AppBreadcrumb } from './components/AppBreadcrumb';",
    "import { AppBreadcrumb } from './components/AppBreadcrumb';\nimport { NotificationsDropdown } from './components/NotificationsDropdown';"
  );
  
  const headerAnchor = `<header className="hidden md:flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6 shrink-0">
        <SidebarTrigger />
        <div className="w-px h-4 bg-border mx-2" />
        <AppBreadcrumb />
      </header>`;
      
  const headerReplacement = `<header className="hidden md:flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6 shrink-0">
        <SidebarTrigger />
        <div className="w-px h-4 bg-border mx-2" />
        <AppBreadcrumb />
        <div className="ml-auto flex items-center gap-2">
          <NotificationsDropdown />
        </div>
      </header>`;
      
  content = content.replace(headerAnchor, headerReplacement);
  
  const mobileHeaderAnchor = `<header className="md:hidden flex h-14 items-center justify-between border-b bg-background px-4 shrink-0">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Package className="h-5 w-5 text-primary" />
          <span>ProcureFlow AI</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => toggleSidebar()}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </header>`;
      
  const mobileHeaderReplacement = `<header className="md:hidden flex h-14 items-center justify-between border-b bg-background px-4 shrink-0">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Package className="h-5 w-5 text-primary" />
          <span>ProcureFlow AI</span>
        </div>
        <div className="flex items-center gap-1">
          <NotificationsDropdown />
          <Button variant="ghost" size="icon" onClick={() => toggleSidebar()}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </div>
      </header>`;
      
  content = content.replace(mobileHeaderAnchor, mobileHeaderReplacement);

  fs.writeFileSync('src/App.tsx', content);
}
