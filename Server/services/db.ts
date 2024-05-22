import mysql, { Connection } from 'mysql2/promise';

const host = process.env.LOCAL_HOST;
const port = Number(process.env.DB_PORT);
const user = process.env.DB_USER;
const database = process.env.DB_NAME;

export async function initDataBase(): Promise<Connection | null> {
  let connection: Connection | null = null;

  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      database,
    });
  } catch (e) {
    console.error(e.message || e);
    return null;
  }
  console.log(
    `User ${user} has connected to DB ${database} via ${host}:${port}`,
  );
  return connection;
}
