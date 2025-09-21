# Changelog

## [Unreleased]

### Added

- MakrCave: Backward-compatible alias endpoints to ease frontend migration:
  - Alias: `GET /api/v1/equipment/skill-requirements`
    - Preferred: `GET /api/v1/skills/equipment-requirements`
  - Alias: `GET /api/v1/machine-access/stats`
    - Preferred: `GET /api/v1/machine-access/dashboard/makerspace`
  - Alias: `GET /api/v1/projects/showcase/featured-maker`
    - Preferred: `GET /api/v1/projects/showcase/featured`

### Notes

- All endpoints require authentication.
- Preferred endpoints are canonical and will continue to evolve; alias responses are considered temporary and may be removed in a future release.
