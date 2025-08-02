import { config } from 'dotenv';

config();

const { port } = process.env;
export { port };