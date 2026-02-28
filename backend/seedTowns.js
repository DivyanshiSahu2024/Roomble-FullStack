const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Towns = require("./models/Towns");

dotenv.config();

mongoose.connect(process.env.MONGOURI)
.then(() => console.log("Connected to MongoDB for seeding towns"))
.catch(err => console.error("MongoDB Connection Error:", err));

const townsData = [
    {
        name: "Andheri",
        distances: new Map([
            ["Andheri", 0],
            ["Bandra", 8],
            ["Juhu", 5],
            ["Malad", 10],
            ["Kandivali", 12],
            ["Borivali", 15],
            ["Dahisar", 18],
            ["Mira Road", 22],
            ["Thane", 25],
            ["Goregaon", 7]
        ]),
        nearest_towns: ["Juhu", "Goregaon", "Bandra"]
    },
    {
        name: "Bandra",
        distances: new Map([
            ["Andheri", 8],
            ["Bandra", 0],
            ["Juhu", 6],
            ["Malad", 15],
            ["Kandivali", 18],
            ["Borivali", 22],
            ["Dahisar", 25],
            ["Mira Road", 30],
            ["Thane", 28],
            ["Goregaon", 12]
        ]),
        nearest_towns: ["Juhu", "Andheri", "Goregaon"]
    },
    {
        name: "Juhu",
        distances: new Map([
            ["Andheri", 5],
            ["Bandra", 6],
            ["Juhu", 0],
            ["Malad", 12],
            ["Kandivali", 15],
            ["Borivali", 18],
            ["Dahisar", 22],
            ["Mira Road", 26],
            ["Thane", 30],
            ["Goregaon", 10]
        ]),
        nearest_towns: ["Andheri", "Bandra", "Goregaon"]
    },
    {
        name: "Malad",
        distances: new Map([
            ["Andheri", 10],
            ["Bandra", 15],
            ["Juhu", 12],
            ["Malad", 0],
            ["Kandivali", 5],
            ["Borivali", 8],
            ["Dahisar", 12],
            ["Mira Road", 15],
            ["Thane", 20],
            ["Goregaon", 6]
        ]),
        nearest_towns: ["Kandivali", "Goregaon", "Borivali"]
    },
    {
        name: "Kandivali",
        distances: new Map([
            ["Andheri", 12],
            ["Bandra", 18],
            ["Juhu", 15],
            ["Malad", 5],
            ["Kandivali", 0],
            ["Borivali", 5],
            ["Dahisar", 8],
            ["Mira Road", 12],
            ["Thane", 18],
            ["Goregaon", 8]
        ]),
        nearest_towns: ["Malad", "Borivali", "Goregaon"]
    },
    {
        name: "Borivali",
        distances: new Map([
            ["Andheri", 15],
            ["Bandra", 22],
            ["Juhu", 18],
            ["Malad", 8],
            ["Kandivali", 5],
            ["Borivali", 0],
            ["Dahisar", 5],
            ["Mira Road", 8],
            ["Thane", 15],
            ["Goregaon", 10]
        ]),
        nearest_towns: ["Kandivali", "Dahisar", "Malad"]
    },
    {
        name: "Dahisar",
        distances: new Map([
            ["Andheri", 18],
            ["Bandra", 25],
            ["Juhu", 22],
            ["Malad", 12],
            ["Kandivali", 8],
            ["Borivali", 5],
            ["Dahisar", 0],
            ["Mira Road", 5],
            ["Thane", 12],
            ["Goregaon", 15]
        ]),
        nearest_towns: ["Borivali", "Mira Road", "Kandivali"]
    },
    {
        name: "Mira Road",
        distances: new Map([
            ["Andheri", 22],
            ["Bandra", 30],
            ["Juhu", 26],
            ["Malad", 15],
            ["Kandivali", 12],
            ["Borivali", 8],
            ["Dahisar", 5],
            ["Mira Road", 0],
            ["Thane", 10],
            ["Goregaon", 18]
        ]),
        nearest_towns: ["Dahisar", "Thane", "Borivali"]
    },
    {
        name: "Thane",
        distances: new Map([
            ["Andheri", 25],
            ["Bandra", 28],
            ["Juhu", 30],
            ["Malad", 20],
            ["Kandivali", 18],
            ["Borivali", 15],
            ["Dahisar", 12],
            ["Mira Road", 10],
            ["Thane", 0],
            ["Goregaon", 22]
        ]),
        nearest_towns: ["Mira Road", "Borivali", "Dahisar"]
    },
    {
        name: "Goregaon",
        distances: new Map([
            ["Andheri", 7],
            ["Bandra", 12],
            ["Juhu", 10],
            ["Malad", 6],
            ["Kandivali", 8],
            ["Borivali", 10],
            ["Dahisar", 15],
            ["Mira Road", 18],
            ["Thane", 22],
            ["Goregaon", 0]
        ]),
        nearest_towns: ["Malad", "Andheri", "Kandivali"]
    }
];

const seedTowns = async () => {
    try {
        await Towns.deleteMany();
        await Towns.insertMany(townsData);
        console.log("✅ Towns data seeded successfully!");
        mongoose.connection.close();
    } catch (error) {
        console.error("Error seeding towns:", error);
        mongoose.connection.close();
    }
};

seedTowns();
