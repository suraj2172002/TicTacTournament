import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

console.log(process.env.JWT_SECRET);

export const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET environment variable");
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};
