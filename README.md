# TECRID Specification

TECRID is the persistent identifier for a laboratory-issued Test Evidence Credential. This repository publishes the open technical contract behind identifier issuance, canonical payloads, signatures, public resolution, controlled records, and append-only corrections.

Status: **public draft**. Version: **1.0-draft / repository release 0.1.0**.

## Start here

- [Protocol specification](specification/tecrid-1.0-draft.md)
- [Credential issuance JSON Schema](schema/credential-issuance.schema.json)
- [Canonical signed-payload JSON Schema](schema/issuer-payload.schema.json)
- [Resolved public-record JSON Schema](schema/public-record.schema.json)
- [Fictional example records](examples/)
- [Version history](CHANGELOG.md)
- [Production API documentation](https://tecrid.com/developers)
- [TECRID Connect client and LIMS integration toolkit](https://github.com/tecrid/tecrid-connect)

## What a TECRID establishes

A resolved TECRID can establish issuer attribution, content integrity, current status, and version history. It does **not** by itself establish representative sampling, method suitability, regulatory compliance, certification, or product safety.

The registry is operated by the [Institute of Contaminant Standards](https://contaminantstandards.com). The production resolver is [tecrid.com](https://tecrid.com).

## Validate the package

```bash
npm install
npm test
```

The validation suite checks every schema, validates the fictional example documents, and verifies that the signed example's canonical payload is byte-for-byte reproducible.

## Versioning and citation

Tagged releases are immutable citation targets. `CITATION.cff`, `codemeta.json`, and `.zenodo.json` describe the repository for GitHub, software catalogs, and a Zenodo archive. Once the GitHub–Zenodo connection is enabled, release `v0.1.0` can receive a version DOI and the repository can display the concept DOI.

## License

MIT. See [LICENSE](LICENSE).
