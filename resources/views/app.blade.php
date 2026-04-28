<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Sinina Co. – Affordable Local Fashion</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <script>
        (function() {
            const theme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', theme);
        })();

        // Dynamic Favicon Generator using Poppins font
        document.addEventListener('DOMContentLoaded', () => {
            document.fonts.ready.then(function () {
                const canvas = document.createElement('canvas');
                canvas.width = 128;
                canvas.height = 128;
                const ctx = canvas.getContext('2d');
                
                // Draw rounded rectangle background
                ctx.fillStyle = '#18181b'; // dark ink color
                ctx.beginPath();
                ctx.roundRect(0, 0, 128, 128, 32);
                ctx.fill();
                
                // Draw SC text
                ctx.fillStyle = '#ffffff';
                ctx.font = '700 72px Poppins, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                // Slight y offset adjustment for visual centering with Poppins
                ctx.fillText('SC', 64, 70); 
                
                const link = document.createElement('link');
                link.rel = 'icon';
                link.type = 'image/png';
                link.href = canvas.toDataURL('image/png');
                document.head.appendChild(link);
            });
        });
    </script>
    @viteReactRefresh
    @vite(['resources/js/main.jsx'])
</head>
<body>
    <div id="root"></div>
</body>
</html>
