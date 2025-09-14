# MakrX Services Feature Flags System

## Overview

The MakrX Services platform features a comprehensive feature flags system that allows for:

- Granular control over feature availability
- A/B testing capabilities
- Beta user management
- Password-protected experimental features
- Role-based access control
- Real-time configuration updates

## Access Levels

### 1. **DISABLED**

- Feature is completely unavailable
- Returns 404 for related endpoints
- Hidden from UI components

### 2. **ENABLED**

- Feature is publicly available
- No restrictions on access
- Default state for production features

### 3. **BETA**

- Available only to users with `beta_user` role
- Used for testing new features
- Can be combined with specific user allowlists

### 4. **PASSWORD_ONLY**

- Requires specific password in `X-Feature-Password` header
- Used for experimental/sensitive features
- Password can be shared with specific stakeholders

### 5. **ROLE_BASED**

- Restricted to specific user roles
- Common roles: `admin`, `provider`, `super_admin`
- Can include explicit user allowlists

### 6. **A_B_TEST**

- Enables A/B testing with percentage-based rollout
- User assignment based on stable hash
- Analytics tracking included

## Core Features by Category

### Service Features

- **SERVICE_3D_PRINTING**: Complete 3D printing service platform
- **SERVICE_LASER_ENGRAVING**: Laser cutting and engraving services
- **SERVICE_CNC**: CNC machining services (Beta)
- **SERVICE_INJECTION_MOLDING**: Injection molding services (Password: `injection-beta-2024`)

### File Processing

- **FILE_UPLOAD_3D**: Upload STL, OBJ, 3MF files
- **FILE_UPLOAD_2D**: Upload SVG, DXF, AI files
- **FILE_PREVIEW_3D**: Interactive 3D model preview
- **FILE_ANALYSIS**: Volume, surface area analysis
- **FILE_AUTO_REPAIR**: Automatic mesh repair (Beta)

### Provider Features

- **PROVIDER_DASHBOARD**: Provider management interface
- **PROVIDER_REAL_TIME_JOBS**: WebSocket job notifications
- **PROVIDER_INVENTORY_MANAGEMENT**: Material tracking
- **PROVIDER_ANALYTICS**: Performance metrics (Beta)

### Experimental Features

- **AI_DESIGN_SUGGESTIONS**: AI optimization suggestions (Password: `ai-design-2024`)
- **AR_PREVIEW**: Augmented reality preview (Password: `ar-preview-2024`)
- **BLOCKCHAIN_TRACKING**: Blockchain order verification (Disabled)

## API Usage

### Backend Implementation

#### 1. Protecting Endpoints with Decorators

```python
from app.features import feature_required, beta_access_required, password_access_required

@router.get("/services/3d-printing")
@feature_required("SERVICE_3D_PRINTING")
async def get_3d_printing_info(request: Request):
    return {"service": "3D Printing", "available": True}

@router.post("/files/repair")
@beta_access_required("FILE_AUTO_REPAIR")
async def auto_repair_file(request: Request):
    return {"status": "repaired"}

@router.get("/ai/suggestions")
@password_access_required("AI_DESIGN_SUGGESTIONS")
async def get_ai_suggestions(request: Request):
    return {"suggestions": [...]}
```

#### 2. Manual Feature Checking

```python
from app.features import feature_flags

def my_service_function(user_id, user_roles):
    if feature_flags.is_enabled("SERVICE_CNC", user_id, user_roles):
        return process_cnc_request()
    else:
        raise HTTPException(404, "CNC service not available")
```

### Frontend Implementation

#### 1. Using React Context

```tsx
import { useFeatureFlags, useFeature } from "@/lib/features";

function ServiceComponent() {
  const { isFeatureEnabled } = useFeatureFlags();
  const { isEnabled, isBeta } = useFeature("SERVICE_3D_PRINTING");

  if (!isEnabled) return <ServiceUnavailable />;

  return (
    <div>
      <h1>3D Printing Service {isBeta && <BetaBadge />}</h1>
      {/* Service content */}
    </div>
  );
}
```

#### 2. Feature Gates

```tsx
import { FeatureGate, PasswordProtectedFeature } from '@/lib/features';

<FeatureGate
  feature="SERVICE_CNC"
  fallback={<div>CNC service coming soon</div>}
>
  <CNCServiceInterface />
</FeatureGate>

<PasswordProtectedFeature feature="AI_DESIGN_SUGGESTIONS">
  <AIDesignPanel />
</PasswordProtectedFeature>
```

#### 3. Service-Specific Hooks

```tsx
import { useServiceFeatures } from "@/lib/features";

function ServicesOverview() {
  const { enabledServices, has3DPrinting, hasLaserEngraving } =
    useServiceFeatures();

  return (
    <div>
      <h2>Available Services ({enabledServices.length})</h2>
      {has3DPrinting && <ServiceCard type="3d-printing" />}
      {hasLaserEngraving && <ServiceCard type="laser" />}
    </div>
  );
}
```

## Management

### 1. Admin Dashboard

Access via `/admin/feature-flags` (requires admin role + `ADMIN_FEATURE_FLAGS`)

Features:

- Real-time flag status overview
- Bulk operations
- Runtime overrides
- Usage analytics
- Search and filtering

### 2. CLI Management

```bash
# List all features
python scripts/manage_features.py list

# Filter by tag or level
python scripts/manage_features.py list --tag=experimental --level=beta

# Show feature details
python scripts/manage_features.py show SERVICE_CNC

# Update feature level
python scripts/manage_features.py set SERVICE_CNC enabled

# Create runtime override
python scripts/manage_features.py override SERVICE_CNC disabled

# Bulk operations
python scripts/manage_features.py bulk updates.json

# Service shortcuts
python scripts/manage_features.py enable-service cnc
python scripts/manage_features.py disable-service injection

# Beta mode management
python scripts/manage_features.py enable-beta
python scripts/manage_features.py disable-beta

# Reset to defaults
python scripts/manage_features.py reset
```

### 3. API Management

```bash
# Check feature availability
curl "http://localhost:8006/api/v1/feature-flags/check/SERVICE_CNC"

# Get available features for user
curl "http://localhost:8006/api/v1/feature-flags/available?user_id=123"

# Admin endpoints (require auth token)
curl -H "Authorization: Bearer $TOKEN" \
     "http://localhost:8006/api/v1/feature-flags/admin/all"

# Create runtime override
curl -X POST \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '"enabled"' \
     "http://localhost:8006/api/v1/feature-flags/admin/SERVICE_CNC/override"
```

## Configuration

### 1. Environment Variables

```bash
# Feature flags configuration directory
FEATURE_FLAGS_DIR=./config/features

# Auto-reload interval (seconds)
FEATURE_FLAGS_RELOAD_INTERVAL=30

# Enable auto-reload
FEATURE_FLAGS_AUTO_RELOAD=true
```

### 2. Configuration Files

#### Main Configuration (`config/features/feature_flags.json`)

```json
{
  "SERVICE_3D_PRINTING": {
    "key": "SERVICE_3D_PRINTING",
    "name": "3D Printing Services",
    "description": "Complete 3D printing service platform",
    "access_level": "enabled",
    "tags": ["service", "3d-printing", "core"]
  }
}
```

#### Runtime Overrides (`config/features/overrides.json`)

```json
{
  "SERVICE_CNC": {
    "access_level": "disabled",
    "tags": ["runtime_override"]
  }
}
```

### 3. Bulk Updates File Format

```json
{
  "SERVICE_CNC": "enabled",
  "AI_DESIGN_SUGGESTIONS": "beta",
  "AR_PREVIEW": "disabled"
}
```

## Best Practices

### 1. Feature Rollout Strategy

1. Start with `disabled` for new features
2. Move to `beta` for internal testing
3. Use `password_only` for stakeholder demos
4. Graduate to `enabled` for public release

### 2. Naming Conventions

- Service features: `SERVICE_<NAME>`
- Feature enhancements: `<SERVICE>_<ENHANCEMENT>`
- File operations: `FILE_<ACTION>`
- Provider features: `PROVIDER_<FEATURE>`
- Admin features: `ADMIN_<FEATURE>`
- Experimental: Descriptive names with clear intent

### 3. Dependency Management

- Use `depends_on` for feature prerequisites
- Use `conflicts_with` for mutually exclusive features
- Validate dependencies before enabling features

### 4. Testing Strategies

- Use A/B testing for performance comparisons
- Beta test with power users before public release
- Monitor analytics for feature adoption

### 5. Security Considerations

- Regularly rotate passwords for sensitive features
- Use role-based access for internal features
- Monitor feature access patterns for anomalies

## Monitoring and Analytics

### 1. Feature Usage Metrics

- Request counts per feature
- Unique user access patterns
- Error rates by feature
- Performance impact analysis

### 2. A/B Testing Analytics

- Conversion rates by variant
- User engagement metrics
- Feature adoption curves
- Statistical significance testing

### 3. Alerts and Notifications

- Failed feature access attempts
- Unusual usage patterns
- Configuration change notifications
- System health impacts

## Troubleshooting

### Common Issues

1. **Feature Not Available**
   - Check access level and user permissions
   - Verify feature dependencies
   - Check for runtime overrides

2. **Password Not Working**
   - Ensure password is sent in `X-Feature-Password` header
   - Check for recent password changes
   - Verify feature requires password access

3. **Beta Access Denied**
   - Confirm user has `beta_user` role
   - Check explicit user allowlist
   - Verify authentication status

### Debug Tools

1. **Frontend Debug Panel**
   - Access via floating debug button
   - Test different user roles
   - View enabled features in real-time

2. **Backend Logging**
   - Feature access attempts logged
   - Middleware traces available
   - Analytics data collection

3. **Health Checks**
   - Feature system health at `/health`
   - Configuration validation
   - Dependency checking

## Migration and Deployment

### 1. Adding New Features

1. Define feature in `flags.py`
2. Add to configuration files
3. Implement feature gates
4. Test with disabled state
5. Deploy and enable gradually

### 2. Removing Features

1. Set to `disabled` in production
2. Monitor for access attempts
3. Remove feature gates from code
4. Clean up configuration files

### 3. Configuration Updates

- Changes are auto-reloaded (if enabled)
- Runtime overrides take precedence
- Bulk operations for major changes
- Rollback capabilities via configuration export/import

This feature flags system provides comprehensive control over the MakrX Services platform, enabling safe feature rollouts, user segmentation, and experimental feature testing while maintaining system stability and security.
