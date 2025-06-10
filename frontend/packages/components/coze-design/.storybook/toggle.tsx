import { useEffect } from 'react';
import { useDarkTheme } from "@/hooks/use-dark-theme";
import { useTheme } from "@/components/theme";
function ModeToggle() {
  const currentTheme = useDarkTheme();
  const { setTheme } = useTheme();
  useEffect(()=>{
    setTheme(currentTheme);
  }, [currentTheme]);
  return (
    <div style={{ display: 'none' }}>Toggle Theme</div>
  )
}
export default ModeToggle;
