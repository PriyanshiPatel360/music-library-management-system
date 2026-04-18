async function register() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        showToast("Enter username and password");
        return;
    }

    try {
        const res = await fetch(`${API}/register`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (data.success !== false && data.token) {
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("token", data.token);
            showToast("Registered && logged in!");
            window.location.href = "index.html";
        } else {
            showToast("Registration failed");
        }
    } catch (err) {
        showToast("Network error");
    }
}

