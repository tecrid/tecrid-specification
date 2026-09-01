# TECRID Protocol Specification 1.0 — Public Draft

Repository release: 0.1.0  
Published: 2026-09-01  
Status: Public draft; implementations must not claim final conformance.

## 1. Scope

This specification defines a persistent identifier and verification record for laboratory-issued analytical evidence. A **Test Evidence Credential** (TEC) is the structured record. A **TECRID** is the permanent identifier assigned to that record.

The protocol covers issuer attribution, normalized record structure, canonical byte production, cryptographic proof, persistent resolution, visibility, and append-only version history. It does not define sampling plans, analytical fitness, regulatory limits, certification thresholds, or safety determinations.

## 2. Governing entities and stable identifiers

- Registry service: `https://tecrid.com/#service`
- Registry website: `https://tecrid.com/#website`
- Operator: Institute of Contaminant Standards, `https://contaminantstandards.com/#organization`
- Standards architect: Karen Pendergrass, `https://contaminantstandards.com/people/karen-pendergrass#person`
- Research identifier: `https://orcid.org/0000-0002-2348-7259`

The Institute of Contaminant Standards operates the registry, defines issuer rules, and reviews issuer identity, authority, scope, and signing-key control. The named laboratory remains the issuer of each production credential.

## 3. Identifier requirements

A TECRID MUST be globally unique within the registry, MUST NOT be reassigned, and MUST remain resolvable after correction, suspension, or revocation. The production format is currently:

```text
TECRID·<ISSUER-CODE>-<2-DIGIT-YEAR>-<8-CHARACTER-RANDOM-SUFFIX>
```

Consumers MUST treat the identifier as opaque. The visible segments aid human recognition but are not a substitute for resolution.

## 4. Issuer authorization

Production publication MUST be limited to a laboratory issuer whose registry account is verified. Approval is gated independently on:

1. legal identity and authority;
2. accreditation or comparable competence evidence;
3. approved method and matrix scope;
4. control of the submitted public signing key; and
5. successful conformance with TECRID canonicalization and signature verification.

An account, uploaded PDF, draft record, or reserved identifier is not an issued TECRID.

## 5. Credential input

The normative issuance-input shape is `schema/credential-issuance.schema.json`. A record contains:

- sample and optional SKU, lot, matrix, method, submitting-party, and time context;
- public or controlled visibility;
- an optional SHA-256 fingerprint and references for the source document;
- one to 100 analytical results, preserving analyte, reported text, units, and optional numeric value, LOQ, symbol, and method; and
- an Ed25519 proof identifying the reviewed issuer key.

The registry does not infer result comparability across methods, units, bases, or analyte species.

## 6. Normalization and canonical bytes

Before signing, the issuer sends the intended record to the canonicalization endpoint. The registry returns the exact UTF-8 JSON string to sign. The normalized object uses this property order:

1. `type`
2. `sampleName`
3. `productSku`
4. `lotNumber`
5. `matrix`
6. `method`
7. `submittingParty`
8. `collectedAt`
9. `receivedAt`
10. `testedAt`
11. `releasedAt`
12. `visibility`
13. `sourceDocument`
14. `results`

Within `sourceDocument`, order is `sha256`, `filename`, `reportNumber`, `orderNumber`, `intakeId`, `issuanceBasis`. Within each result, order is `analyte`, `symbol`, `resultText`, `numericValue`, `unit`, `loqText`, `method`.

Absent optional scalar values become JSON `null`. `visibility` defaults to `public`. A SKU is trimmed, uppercased, and internal whitespace becomes `-`. Result order is preserved. Implementations MUST sign the returned canonical string directly and MUST NOT reserialize, reformat, reorder, or normalize it again.

The canonical object MUST validate against `schema/issuer-payload.schema.json`.

## 7. Cryptographic proof

Production issuance uses Ed25519. The laboratory signs the exact UTF-8 canonical payload with the private key corresponding to the ICS-reviewed public JWK. The private key MUST remain under laboratory control and MUST NOT be sent to the registry.

The submitted proof contains:

- `keyId` — the reviewed issuer key identifier;
- `algorithm` — exactly `Ed25519`; and
- `signature` — the base64url signature over the canonical payload.

The registry rejects publication when the issuer is unverified, the key is unreviewed, the signature is missing, or signature verification fails.

## 8. Source-document fingerprint

When a laboratory report is represented, `sourceDocument.sha256` is the lowercase hexadecimal SHA-256 digest of the final source bytes. When a TECRID mark is printed on the final report, the identifier MUST be reserved first, rendered into the report, and only then fingerprinted, canonicalized, signed, and finalized.

The public source-document object records the fingerprint and references. It does not make the PDF public.

## 9. Visibility

A public record may expose results and the independently verifiable proof bundle. A controlled record exposes a resolver envelope containing issuer, status, version, fingerprint, and proof metadata while withholding results, canonical payloads, and signed payloads. Assigning an identifier does not by itself make findings or documents public.

The public resolver shape is `schema/public-record.schema.json`.

## 10. Corrections and revocations

Corrections and revocations append a new signed version. A revision payload binds the TECRID, new version number, previous fingerprint, action, reason, and revised credential. Prior version rows and prior fingerprints MUST NOT be erased or silently replaced.

Resolution MUST state the current status and MUST retain version metadata. A revoked TECRID remains resolvable.

## 11. Interpretation boundary

Every resolved record carries this boundary in substance:

> The record establishes issuer attribution, content integrity, and status. It does not by itself establish representative sampling, method suitability, regulatory compliance, or product safety.

TECRID presence MUST NOT be represented as certification, approval, compliance, pass/fail, or a safety claim.

## 12. Conformance

An implementation conforms to this public draft only if it:

- creates persistent, non-reassigned identifiers;
- enforces verified laboratory authority before publication;
- returns deterministic canonical bytes in the defined shape and order;
- verifies Ed25519 signatures against the reviewed issuer key;
- records source fingerprints without implying document publication;
- preserves controlled-record confidentiality at the public boundary;
- appends corrections and revocations without deleting prior versions; and
- exposes the interpretation boundary with resolved records.

Because this is a public draft, implementations SHOULD state the exact release or commit they implement and MUST NOT claim final or universal TECRID conformance.

## 13. Security and privacy considerations

API keys, private signing keys, private reports, controlled findings, routing grants, and recipient packages MUST NOT be committed to public repositories or emitted in logs. Raw credentials SHOULD be stored only in suitable secret managers. Implementers SHOULD test replay, duplicate finalization, expired reservation, invalid signature, revoked routing, and recipient-scope failures.

## 14. Change control

Normative changes require a tagged repository release and an entry in `CHANGELOG.md`. Tagged schemas are immutable. The `main` branch represents the next draft. Production behavior remains the decisive implementation reference until the protocol reaches final status.
