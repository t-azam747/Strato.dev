import express from 'express'
import { connectDB } from './db/db'
import authRouter from './routes/auth.route'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import projectRouter from './routes/project.route'
import aiRouter from './routes/ai.route'
import gitRouter from './routes/git.route'
import walletRouter from './routes/wallet.route'
const app = express()
connectDB()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true 
}))
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "https://strato-dev.vercel.app"); // Replace with frontend URL
//   res.header("Access-Control-Allow-Credentials", "true"); // ✅ Required for authentication!
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   next();
// });

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/project', projectRouter)
app.use('/api/v1/ai', aiRouter)
app.use('/api/v1/git', gitRouter)
app.use('/api/v1/wallet', walletRouter)
app.get('/', (req, res)=>{
  res.send("Health Check")
})

export default app
