'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ThemeValue = 'light' | 'dark' | 'system';

const labels: Record<ThemeValue, string> = {
  light: 'Claro',
  dark: 'Oscuro',
  system: 'Sistema',
};

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const currentTheme = (theme ?? 'system') as ThemeValue;
  const isDark = resolvedTheme === 'dark';

  const Icon = currentTheme === 'system' ? Monitor : isDark ? Moon : Sun;

  const handleThemeChange = (newTheme: ThemeValue) => {
    setTheme(newTheme);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          aria-label="Cambiar tema"
        >
          <Icon className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="z-[100] bg-popover"
        sideOffset={8}
      >
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={() => handleThemeChange('light')}
        >
          <Sun className="mr-2 h-4 w-4" />
          {labels.light}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={() => handleThemeChange('dark')}
        >
          <Moon className="mr-2 h-4 w-4" />
          {labels.dark}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={() => handleThemeChange('system')}
        >
          <Monitor className="mr-2 h-4 w-4" />
          {labels.system}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
