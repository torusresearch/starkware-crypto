import Register from "@babel/register";
import dotenv from "dotenv";
import path from "path";
import { register } from "ts-node";

dotenv.config();

register({ project: path.resolve("tsconfig.json"), transpileOnly: true, compilerOptions: { module: "esnext" } });

Register({
  extensions: [".ts", ".js"],
  rootMode: "upward",
});
