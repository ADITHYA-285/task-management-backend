const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Check whether all fields are provided
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        // 2. Check whether the email already exists
        const existingUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        // 3. Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Create the user
        const user = await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword
            }
        });

        // 5. Send response
        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check whether email and password are provided
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // 2. Find the user by email
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // 3. Compare the entered password with the hashed password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // 4. Create JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // 5. Send token to client
        res.json({
            message: "Login successful",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Something went wrong"
        });
    }
};

module.exports = {
    register,
    login
};