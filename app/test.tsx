"use client";

import { useEffect, useState } from "react";
import initSqlJs from "sql.js";

interface User {
  id: number;
  name: string;
  age: number;
}

export default function SQLiteComponent() {
  const [data, setData] = useState<User[]>([]);

  useEffect(() => {
    async function loadDatabase() {
      const SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
      });

      // Fetch the SQLite database file
      const response = await fetch("/database.sqlite");
      const buffer = await response.arrayBuffer();
      const db = new SQL.Database(new Uint8Array(buffer));

      // Prepare the SQL statement
      const stmt = db.prepare("SELECT * FROM users");
      const rows: User[] = [];

      while (stmt.step()) {
        const row = stmt.getAsObject() as unknown as User; // ✅ First cast to 'unknown', then to 'User'
        rows.push(row);
      }

      setData(rows);
      stmt.free();
    }

    loadDatabase();
  }, []);

  return (
    <div>
      <h1>SQLite Database in Next.js</h1>
      <ul>
        {data.map((row) => (
          <li key={row.id}>
            ID: {row.id}, Name: {row.name}, Age: {row.age}
          </li>
        ))}
      </ul>
    </div>
  );
}
