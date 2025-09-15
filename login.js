document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const userData = await response.json();
                localStorage.setItem('user', JSON.stringify(userData.user)); 
                alert('Logged in successfully!');
                window.location.href = 'index.html'; 
            } else {
                alert('The email or password is incorrect.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('The server is not responding');
        }
    });
});

