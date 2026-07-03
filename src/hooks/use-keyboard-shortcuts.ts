import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if the user is pressing a modifier key (Ctrl or Cmd)
      const isModifierPressed = event.ctrlKey || event.metaKey;

      if (!isModifierPressed) return;

      switch (event.key.toLowerCase()) {
        case 'k':
          // Ctrl+K -> Open AgentChat
          event.preventDefault();
          navigate('/agent');
          toast.info('Opened AI Agent via shortcut');
          break;
        case 'n':
          // Ctrl+N -> New Requisition
          event.preventDefault();
          navigate('/requisitions?new=true');
          toast.info('Opened New Requisition via shortcut');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);
}
