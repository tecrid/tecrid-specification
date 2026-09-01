import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = async (relative) => JSON.parse(await readFile(path.join(root, relative), "utf8"));

const schemas = await Promise.all([
  "schema/credential-issuance.schema.json",
  "schema/issuer-payload.schema.json",
  "schema/public-record.schema.json",
].map(readJson));

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
for (const schema of schemas) ajv.addSchema(schema);

const cases = [
  [schemas[0].$id, "examples/credential-issuance.example.json"],
  [schemas[1].$id, "examples/issuer-payload.example.json"],
  [schemas[2].$id, "examples/public-record.example.json"],
  [schemas[2].$id, "examples/controlled-record.example.json"],
];

for (const [schemaId, examplePath] of cases) {
  const validate = ajv.getSchema(schemaId);
  assert.ok(validate, `schema loaded: ${schemaId}`);
  const example = await readJson(examplePath);
  assert.equal(validate(example), true, `${examplePath}: ${ajv.errorsText(validate.errors, { separator: "\n" })}`);
}

const issuance = await readJson("examples/credential-issuance.example.json");
const payload = await readJson("examples/issuer-payload.example.json");
const normalized = {
  type: "TestEvidenceCredential",
  sampleName: issuance.sampleName.trim(),
  productSku: issuance.productSku.trim().toUpperCase().replace(/\s+/g, "-") || null,
  lotNumber: issuance.lotNumber?.trim() || null,
  matrix: issuance.matrix?.trim() || null,
  method: issuance.method?.trim() || null,
  submittingParty: issuance.submittingParty?.trim() || null,
  collectedAt: issuance.collectedAt?.trim() || null,
  receivedAt: issuance.receivedAt?.trim() || null,
  testedAt: issuance.testedAt?.trim() || null,
  releasedAt: issuance.releasedAt?.trim() || null,
  visibility: issuance.visibility === "controlled" ? "controlled" : "public",
  sourceDocument: issuance.sourceDocument ? {
    sha256: issuance.sourceDocument.sha256.toLowerCase(),
    filename: issuance.sourceDocument.filename.trim(),
    reportNumber: issuance.sourceDocument.reportNumber?.trim() || null,
    orderNumber: issuance.sourceDocument.orderNumber?.trim() || null,
    intakeId: issuance.sourceDocument.intakeId?.trim() || null,
    issuanceBasis: issuance.sourceDocument.issuanceBasis?.trim() || null,
  } : null,
  results: issuance.results.map((row) => ({
    analyte: row.analyte.trim(),
    symbol: row.symbol?.trim() || null,
    resultText: row.resultText.trim(),
    numericValue: Number.isFinite(row.numericValue) ? row.numericValue : null,
    unit: row.unit.trim(),
    loqText: row.loqText?.trim() || null,
    method: row.method?.trim() || issuance.method?.trim() || null,
  })),
};

assert.deepEqual(normalized, payload, "the example canonical payload matches production normalization");
assert.equal(JSON.stringify(normalized), JSON.stringify(payload), "canonical serialization is byte-for-byte reproducible");

console.log(`Validated ${schemas.length} schemas and ${cases.length} example documents.`);
