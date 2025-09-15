document.addEventListener("DOMContentLoaded", () => {

  const registerForm = document.getElementById("register-form");


  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value.trim();

    console.log(" Collected values:", { name, email, password });

    if (!name || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      console.log("Sending fetch request...");
      const response = await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: "user",
          isActive: true,
        }),
      });


      if (response.status === 200 || response.status === 201) {

        const newUserData = await response.json();


        localStorage.setItem("user", JSON.stringify(newUserData));

        window.location.href = "index.html";
      } else {
        const errorText = await response.text();
      
        alert(`Registration failed: ${errorText}`);
      }
    } catch (error) {
      console.error(" Fetch error:", error);
      alert("An unexpected error occurred. Please try again later.");
    }
  });
});
