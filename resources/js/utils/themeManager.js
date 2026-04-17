// Theme Manager - Handle light/dark mode switching
export const ThemeManager = {
    LIGHT_MODE: 'light',
    DARK_MODE: 'dark',
    STORAGE_KEY: 'sininaco-theme',

    // Initialize theme on app load
    initTheme() {
        const savedTheme = localStorage.getItem(this.STORAGE_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (prefersDark ? this.DARK_MODE : this.LIGHT_MODE);
        this.setTheme(theme);
        return theme;
    },

    // Set theme
    setTheme(theme) {
        const body = document.body;
        
        if (theme === this.DARK_MODE) {
            body.classList.add('dark-mode');
            localStorage.setItem(this.STORAGE_KEY, this.DARK_MODE);
        } else {
            body.classList.remove('dark-mode');
            localStorage.setItem(this.STORAGE_KEY, this.LIGHT_MODE);
        }
    },

    // Toggle theme
    toggleTheme() {
        const currentTheme = localStorage.getItem(this.STORAGE_KEY) || this.LIGHT_MODE;
        const newTheme = currentTheme === this.LIGHT_MODE ? this.DARK_MODE : this.LIGHT_MODE;
        this.setTheme(newTheme);
        return newTheme;
    },

    // Get current theme
    getCurrentTheme() {
        return localStorage.getItem(this.STORAGE_KEY) || this.LIGHT_MODE;
    },

    // Check if dark mode is active
    isDarkMode() {
        return this.getCurrentTheme() === this.DARK_MODE;
    }
};
