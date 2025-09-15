document.addEventListener('DOMContentLoaded', () => {
    const redirectBtn = document.getElementById('redirectBtn');
    const message = document.getElementById('message');

    redirectBtn.addEventListener('click', () => {
        message.textContent = 'Redirecting in 3 seconds...';
        
        // This will redirect to Google's homepage after 3 seconds
        setTimeout(() => {
            window.location.href = 'https://www.google.com';
        }, 3000); 
    });
});