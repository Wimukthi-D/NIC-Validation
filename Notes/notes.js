const token = response.data.token;
localStorage.setItem("token", JSON.stringify({ token }));
const storedData = localStorage.getItem("token");
const parsedData = JSON.parse(storedData);
console.log(parsedData);
const decoded = jwtDecode(token);
console.log(decoded);