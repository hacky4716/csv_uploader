import fs from "fs";

const headers = [
    "name.firstName",
    "name.lastName",
    "age",
    "address.line1",
    "address.line2",
    "address.city",
    "address.state",
    "gender"
];

const firstNames = ["Rohit", "Sneha", "Amit", "Priya", "Vikas", "Rina", "Arjun", "Kiran"];
const lastNames = ["Sharma", "Patil", "Gupta", "Nair", "Iyer", "Khan", "Rao", "Das"];
const cities = ["Pune", "Mumbai", "Delhi", "Chennai", "Kolkata", "Bangalore", "Hyderabad"];
const states = ["Maharashtra", "Tamil Nadu", "Karnataka", "Delhi", "West Bengal", "Telangana"];
const genders = ["male", "female", "other"];

function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

let csvData = headers.join(",") + "\n";

for (let i = 0; i < 10000; i++) {
    const fName = randomChoice(firstNames);
    const lName = randomChoice(lastNames);
    const age = Math.floor(Math.random() * 70) + 10; // 10–80
    const line1 = `A-${100 + i} ${fName} Street`;
    const line2 = `Near ${randomChoice(cities)} Mall`;
    const city = randomChoice(cities);
    const state = randomChoice(states);
    const gender = randomChoice(genders);

    csvData += `${fName},${lName},${age},${line1},${line2},${city},${state},${gender}\n`;
}

fs.writeFileSync("./data/large_users.csv", csvData);
console.log("✅ large_users.csv generated successfully with 10,000 records!");
