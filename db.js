const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

async function testConnection() {
  const session = driver.session();
  try {
    const result = await session.run("RETURN 'Connection Successful' AS message");
    const message = result.records[0].get('message');
    console.log(message);
    return message;
  } catch (error) {
    console.error('Connection failed:', error.message);
    throw error;
  } finally {
    await session.close();
  }
}

async function closeDriver() {
  await driver.close();
}

module.exports = { driver, testConnection, closeDriver };

if (require.main === module) {
  testConnection()
    .then(() => closeDriver())
    .catch(() => process.exit(1));
}
