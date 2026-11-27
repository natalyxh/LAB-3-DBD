const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.static("public"));

const client = new MongoClient(process.env.MONGODB_URI);

let productos;

async function iniciarServidor() {
    try {
        await client.connect();

        const db = client.db(process.env.DB_NAME);
        productos = db.collection("producto");

        console.log("Conectado a MongoDB Atlas");

        app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
            console.log("Servidor ejecutándose en puerto 3000");
        });

    } catch (error) {
        console.error("Error de conexión:", error);
        process.exit(1);
    }
}

// CONSULTAR
app.get("/api/productos", async (req, res) => {
    try {
        const datos = await productos.find({}).toArray();
        res.json(datos);
    } catch (error) {
        res.status(500).json({ error: "Error al consultar" });
    }
});

// REGISTRAR
app.post("/api/productos", async (req, res) => {
    try {
        const { nombre, categoria, precio, stock } = req.body;

        if (!nombre || !categoria ||
            !Number.isFinite(precio) || precio < 0 ||
            !Number.isInteger(stock) || stock < 0) {
            return res.status(400).json({
                error: "Datos inválidos"
            });
        }

        const resultado = await productos.insertOne({
            nombre,
            categoria,
            precio,
            stock
        });

        res.status(201).json(resultado);

    } catch (error) {
        res.status(500).json({ error: "Error al registrar" });
    }
});

// ACTUALIZAR
app.put("/api/productos/:id", async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const { nombre, categoria, precio, stock } = req.body;

        if (!nombre || !categoria ||
            !Number.isFinite(precio) || precio < 0 ||
            !Number.isInteger(stock) || stock < 0) {
            return res.status(400).json({ error: "Datos inválidos" });
        }

        const resultado = await productos.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { nombre, categoria, precio, stock } }
        );

        res.json(resultado);

    } catch (error) {
        res.status(500).json({ error: "Error al actualizar" });
    }
});

// ELIMINAR
app.delete("/api/productos/:id", async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const resultado = await productos.deleteOne({
            _id: new ObjectId(req.params.id)
        });

        res.json(resultado);

    } catch (error) {
        res.status(500).json({ error: "Error al eliminar" });
    }
});

iniciarServidor();