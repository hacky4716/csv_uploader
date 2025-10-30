
import { pool } from "./db.js";

export const getAgeGroupStats = async (req, res) => {
  try {
    const result = await pool.query("SELECT age FROM users");
    const ages = result.rows.map(row => row.age).filter(age => !isNaN(age));

    if (ages.length === 0) {
      return res.status(404).json({ message: "No valid user age data found." });
    }

    const groups = { "<20": 0, "20-40": 0, "40-60": 0, ">60": 0 };
    const total = ages.length;

    ages.forEach(age => {
      if (age < 20) groups["<20"]++;
      else if (age <= 40) groups["20-40"]++;
      else if (age <= 60) groups["40-60"]++;
      else groups[">60"]++;
    });

    const percentages = {};
    for (const [key, count] of Object.entries(groups)) {
      percentages[key] = ((count / total) * 100).toFixed(2) + "%";
    }

    console.log("\n Age-Group % Distribution:");
    for (const [group, percent] of Object.entries(percentages)) {
      console.log(`${group} : ${percent}`);
    }

    res.json({
      totalRecords: total,
      ageGroupCounts: groups,
      ageGroupPercentages: percentages,
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
