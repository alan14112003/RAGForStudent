'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Settings, Moon, Sun, Laptop, HelpCircle, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SettingsMenu() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <Button variant="ghost" size="icon" className="text-muted-foreground"><Settings size={20} /></Button>;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted/50">
                    <Settings size={20} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        {theme === 'dark' ? <Moon className="mr-2 h-4 w-4" /> :
                            theme === 'light' ? <Sun className="mr-2 h-4 w-4" /> :
                                <Laptop className="mr-2 h-4 w-4" />}
                        <span>Theme</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                            <DropdownMenuRadioItem value="light">
                                <Sun className="mr-2 h-4 w-4" /> Light
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="dark">
                                <Moon className="mr-2 h-4 w-4" /> Dark
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="system">
                                <Laptop className="mr-2 h-4 w-4" /> System
                            </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuItem>
                    <HelpCircle className="mr-2 h-4 w-4" /> Help & Support
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <MessageSquare className="mr-2 h-4 w-4" /> Send Feedback
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-muted-foreground text-xs justify-center cursor-default hover:bg-transparent">
                    v1.0.0
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
