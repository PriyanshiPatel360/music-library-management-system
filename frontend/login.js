async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        showToast("Enter username and password");
        return;
    }

    try {
        const res = await fetch(`${API}/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        console.log("Login data:", data);

        if (data.success) {
            localStorage.setItem("user", JSON.stringify(data.user));
            showToast("Login successful!");
            window.location.href = "index.html";
        } else {
            showToast("Invalid credentials");
        }
    } catch (err) {
        console.error(err);
        showToast("Login failed - check server");
    }
}

