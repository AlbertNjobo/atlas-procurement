const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('import { AppBreadcrumb }')) {
  content = content.replace(
    "import { TooltipProvider } from '@/components/ui/tooltip';",
    "import { TooltipProvider } from '@/components/ui/tooltip';\nimport { AppBreadcrumb } from './components/AppBreadcrumb';"
  );
  
  const headerReplacement = `<header className="hidden md:flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6 shrink-0">
        <SidebarTrigger />
        <div className="w-px h-4 bg-border mx-2" />
        <AppBreadcrumb />
      </header>`;
      
  content = content.replace(
    `<header className="hidden md:flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6 shrink-0">
        <SidebarTrigger />
      </header>`,
    headerReplacement
  );
  
  // also add breadcrumbs for mobile header if needed, but the prompt says "main header area". I'll add it there.
  fs.writeFileSync('src/App.tsx', content);
}
