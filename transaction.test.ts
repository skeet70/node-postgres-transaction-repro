import { type } from "node:os";
import { GenericContainer, StartedTestContainer } from "testcontainers";
import { Pool, PoolConfig, PoolClient } from "pg";

const dbName = `TEST_DB_${process.env.JEST_WORKER_ID}`;
let container: StartedTestContainer;
let port: number;
let connection: Pool;
let client: PoolClient;

describe("automatic transaction issue", () => {
  beforeAll(async () => {
    // setup postgres
    const toStart = new GenericContainer("postgres:14")
      .withExposedPorts(5432)
      .withEnvironment({
        POSTGRES_USER: "postgres",
        POSTGRES_PASSWORD: "postgres",
        POSTGRES_DB: dbName,
      });

    if (type() === "Linux") {
      console.log("postgres: using tmpfs mount");
      toStart.withTmpFs({ "/var/lib/postgresql/data": "" });
    }

    container = await toStart.start();
    port = container.getMappedPort(5432);

    // setup pg driver
    const connectionConfig: PoolConfig = {
      host: "localhost",
      user: "postgres",
      database: dbName,
      password: "postgres",
      port,
    };
    connection = new Pool(connectionConfig);
  });

  beforeEach(async () => {
    client = await connection.connect();
  });

  afterEach(async () => {
    client.release();
  });

  afterAll(async () => {
    await connection.end();
    container.stop({ timeout: 10000 });
  });

  test("has no automatic transactions with single statements", async () => {
    await client.query(`CREATE DATABASE nomatter`);
    await client.query(`DROP DATABASE nomatter`);
  });

  /**
   * This test fails with `error: CREATE DATABASE cannot run inside a transaction block`
   * even though no transactions were defined as per https://node-postgres.com/features/transactions
   */
  test("has automatic transactions with multiple statements", async () => {
    await client.query(`CREATE DATABASE nomatter; DROP DATABASE nomatter;`);
  });
});
