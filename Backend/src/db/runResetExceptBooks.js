require("dotenv").config();

const { connectPostgreSQL } = require("../config/connection");
const { resetExceptBooks } = require("./resetExceptBooks");

async function main() {
  await connectPostgreSQL();
  const { booksKept, tableCounts, booksRestored, booksStillZeroQty } =
    await resetExceptBooks();
  console.log(`Database reset complete. Books kept: ${booksKept}`);
  if (booksRestored > 0) {
    console.log(`Restored available qty on ${booksRestored} book(s) that were out on loan.`);
  }
  if (booksStillZeroQty > 0) {
    console.log(
      `Note: ${booksStillZeroQty} book(s) still have qty=0 in catalog (edit in Books if needed).`,
    );
  }
  console.log("Other tables (should be 0 except users=1 for admin):");
  Object.entries(tableCounts).forEach(([table, count]) => {
    console.log(`  ${table}: ${count}`);
  });
  console.log(
    `Default admin: username admin / password from SEED_ADMIN_PASSWORD in .env`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Reset failed:", err.message);
  process.exit(1);
});
