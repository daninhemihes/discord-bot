import dotenv from "dotenv";
dotenv.config({ path:__dirname+`../../../.env.${process.env.NODE_ENV}` });
import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
    apiKey: process.env.OPEN_AI_KEY
})
const openai = new OpenAIApi(configuration)

export default openai
