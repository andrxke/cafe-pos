// c:\Coding\OpenCafe\cafe-pos\backend\src\server.ts
import dotenv from 'dotenv';
import app from './app';

dotenv.config({ path: '../.env' });
dotenv.config();

const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  console.log(`Cafe POS backend listening on http://localhost:${port}`);
});

