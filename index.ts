import cors from "cors";
import "dotenv/config";
import express from "express";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public/dist"));

import snipNew from "./routes/new.js";
import snipNewCustom from "./routes/newCustom.js";
import snipRedirect from "./routes/redirect.js";

app.use("/", snipRedirect);
app.use("/api/new", snipNew);
app.use("/api/newCustom", snipNewCustom);

app.listen(process.env.PORT || 5000, () => console.log("Server is running"));
