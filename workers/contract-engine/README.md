# ESUM Digital Contracts System

## Overview

Full digital contract lifecycle management with electronic signatures, designed for South African energy trading compliance.

## Features

### 📄 Contract Generation
- **AI-Powered Drafting** - Automatic contract generation from trade details using Llama-3
- **Template System** - Pre-approved legal templates for different contract types
- **Version Control** - Track contract versions and amendments
- **Document Storage** - Secure R2 storage for unsigned and signed documents

### ✍️ Electronic Signatures
- **Multi-Party Signing** - Sequential or parallel signature workflows
- **Signature Types** - Electronic, digital (PKI), or wet-ink support
- **Legal Compliance** - ECTA (Electronic Communications and Transactions Act) compliant
- **Audit Trail** - Complete signature history with IP, geolocation, timestamps
- **Witness Support** - Optional witness signatures for high-value contracts

### 🔄 Contract Lifecycle
- **Status Management** - Draft → Pending Signature → Partially Signed → Active → Completed/Terminated
- **Amendments** - Formal amendment workflow with dual-party approval
- **Termination** - Structured termination with reason tracking
- **Auto-Activation** - Contracts automatically activate when fully signed

### 🔒 Security & Compliance
- **SHA-256 Hashing** - Digital fingerprint for each signature
- **Certificate Generation** - Automatic signature certificates
- **Immutable Audit Log** - All actions logged with timestamps and user info
- **POPIA Compliant** - Personal information protection

## Database Schema

### Tables Added

1. **contracts** (enhanced)
   - Template support
   - Version tracking
   - Document references (signed/unsigned)
   - Lifecycle timestamps

2. **contract_templates**
   - Pre-approved legal templates
   - Default terms and conditions
   - Required/optional fields configuration

3. **contract_signatures**
   - Signature requests and execution
   - Signature metadata (IP, geolocation, device)
   - Signature certificates
   - Witness support

4. **contract_amendments**
   - Amendment proposals
   - Dual-party approval tracking
   - Executed amendments

5. **contract_audit_log**
   - Complete audit trail
   - All contract actions logged
   - Immutable history

## API Endpoints

### Contract Management

```bash
# Create contract
POST /api/contracts
{
  "trade_id": "uuid",
  "instrument_id": "uuid",
  "buyer_org_id": "uuid",
  "seller_org_id": "uuid",
  "contract_type": "physical_ppa",
  "start_date": "2026-04-01",
  "end_date": "2036-03-31",
  "total_contracted_mwh": 10000,
  "price_terms": {
    "price_per_mwh": 0.75,
    "currency": "ZAR",
    "payment_terms": "Net 30",
    "delivery_point": "Apollo Substation"
  }
}

# Get contract details
GET /api/contracts/:id

# List contracts (filtered by organisation)
GET /api/contracts?org_id=uuid&status=active&type=physical_ppa

# Terminate contract
POST /api/contracts/:id/terminate
{
  "reason": "Force majeure - grid failure",
  "user_id": "uuid",
  "org_id": "uuid"
}
```

### Signature Management

```bash
# Request signature
POST /api/contracts/:id/signatures
{
  "signer_user_id": "uuid",
  "signer_org_id": "uuid",
  "signer_role": "CEO",
  "signer_email": "ceo@company.co.za",
  "signer_name": "John Doe",
  "requires_witness": false
}

# Execute signature
POST /api/contracts/:id/signatures/:signature_id/execute
{
  "consent_given": true,
  "consent_timestamp": "2026-03-27T10:00:00Z",
  "ip_address": "196.25.0.1",
  "user_agent": "Mozilla/5.0...",
  "geolocation": {
    "latitude": -26.2041,
    "longitude": 28.0473,
    "country": "ZA"
  }
}

# Decline signature
POST /api/contracts/:id/signatures/:signature_id/decline
{
  "reason": "Terms require revision"
}
```

### Amendment Management

```bash
# Propose amendment
POST /api/contracts/:id/amendments
{
  "title": "Price Adjustment Q2 2026",
  "description": "Adjust price per CPI increase",
  "proposed_changes": {
    "price_terms": {
      "price_per_mwh": 0.78
    }
  },
  "proposed_by_user_id": "uuid"
}

# Accept amendment
POST /api/contracts/:id/amendments/:amendment_id/accept
{
  "user_id": "uuid",
  "is_buyer": true
}
```

### Template Management

```bash
# Create template
POST /api/contract-templates
{
  "name": "Standard Physical PPA",
  "description": "Long-term physical power purchase agreement",
  "contract_type": "physical_ppa",
  "version": "1.0",
  "default_terms": { ... },
  "required_fields": ["delivery_point", "metering_standard"],
  "approval_required": true,
  "created_by_user_id": "uuid"
}

# List templates
GET /api/contract-templates
```

### Audit Trail

```bash
# Get contract audit log
GET /api/contracts/:id/audit
```

## Signature Workflow

### 1. Contract Creation
```
Trade Executed → Contract Generated (Draft) → Ready for Signatures
```

### 2. Signature Collection
```
Draft → Pending Signature → Partially Signed → Active
```

### 3. Signature Execution
For each signer:
1. **Request** - Signature request created, notification sent
2. **Review** - Signer reviews contract document
3. **Consent** - Signer provides electronic signature consent
4. **Execute** - Signature captured with metadata (IP, location, timestamp)
5. **Certificate** - Digital signature certificate generated
6. **Verify** - SHA-256 hash created for integrity

### 4. Activation
When all signatures complete:
- Contract status → `active`
- `activated_at` timestamp set
- Settlement processing queued
- All parties notified

## Legal Compliance

### South African ECTA Compliance

The electronic signature system complies with the **Electronic Communications and Transactions Act (ECTA)**:

✅ **Section 13**: Electronic signatures have legal validity
✅ **Authentication**: Signer identity verified through platform authentication
✅ **Consent**: Explicit consent captured for each signature
✅ **Integrity**: Document integrity maintained via hashing
✅ **Accessibility**: Signatures accessible for future reference
✅ **Audit Trail**: Complete transaction history maintained

### Signature Validity Requirements

For an electronic signature to be legally binding:
1. Signer must be authenticated (platform login)
2. Signer must consent to electronic signature
3. Signature must be linked to signer (captured metadata)
4. Document must be tamper-evident (hash verification)
5. Record must be retainable (R2 storage)

## Security Features

### Signature Integrity
- **SHA-256 Hash** - Unique fingerprint of signature data
- **Timestamp Authority** - Precise signing timestamp
- **IP Tracking** - Network location of signer
- **Geolocation** - Physical location (if available)
- **Device Fingerprint** - User agent and device info

### Document Security
- **R2 Storage** - Encrypted at rest
- **Access Control** - Role-based document access
- **Version History** - All versions preserved
- **Tamper Detection** - Hash verification on retrieval

### Audit Trail
- **Immutable Logs** - Append-only audit log
- **Complete History** - Every action tracked
- **User Attribution** - All actions linked to users
- **Timestamp Precision** - Millisecond accuracy

## Contract Types Supported

| Type | Description | Typical Tenor | Signatures Required |
|------|-------------|---------------|---------------------|
| **Spot** | Single delivery, immediate settlement | 1-7 days | 2 (buyer + seller) |
| **Term** | Fixed volume over period | 1-5 years | 2-4 (executives + witnesses) |
| **Physical PPA** | Physical energy delivery | 5-20 years | 4-6 (executives + legal + witnesses) |
| **Virtual PPA** | Financial settlement only | 5-15 years | 2-4 (executives + legal) |
| **Wheeling** | Transmission service agreement | 1-10 years | 3-5 (buyer + seller + municipality) |

## Integration Points

### Trading Engine
- Trades automatically generate contracts
- Contract status updates trigger settlement

### Settlement Engine
- Activated contracts queue for settlement
- Amendments update settlement calculations

### Notification System
- Signature requests via email + in-app
- Status change notifications
- Renewal reminders (30, 60, 90 days before expiry)

### Document Management
- R2 bucket: `energy-contracts`
- Structure: `contracts/{contract_id}/{document_type}.pdf`
- Certificates: `contracts/{contract_id}/certificates/{signature_id}.pdf`

## Frontend Integration

### React Component Example

```typescript
// Signature request component
function SignatureRequest({ contractId, signerInfo }) {
  const [consent, setConsent] = useState(false);
  const [signing, setSigning] = useState(false);
  
  const handleSign = async () => {
    setSigning(true);
    try {
      const response = await fetch(`/api/contracts/${contractId}/signatures/${signatureId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent_given: true,
          consent_timestamp: new Date().toISOString(),
          ip_address: await getIPAddress(),
          user_agent: navigator.userAgent,
          geolocation: await getGeolocation()
        })
      });
      
      if (response.ok) {
        // Show success, redirect to confirmation
      }
    } finally {
      setSigning(false);
    }
  };
  
  return (
    <div>
      <ContractDocument contractId={contractId} />
      <Checkbox 
        checked={consent} 
        onChange={setConsent}
        label="I consent to using electronic signatures"
      />
      <Button 
        onClick={handleSign} 
        disabled={!consent || signing}
      >
        {signing ? 'Signing...' : 'Sign Contract'}
      </Button>
    </div>
  );
}
```

## Migration Guide

### 1. Run Database Migrations

```bash
npm run db:migrate
```

This creates the new tables:
- `contract_templates`
- `contract_signatures` (enhanced)
- `contract_amendments`
- `contract_audit_log`

And updates:
- `contracts` (new columns for template, version, documents)

### 2. Deploy Contract Engine Worker

```bash
cd workers/contract-engine
npm run deploy
```

### 3. Update API Gateway Routes

Add contract engine routes to `apps/api-gateway/src/index.ts`:

```typescript
// Import contract engine
import contractEngine from '@esum/contract-engine';

// Forward contract routes
app.all('/api/contracts/*', (c) => {
  return contractEngine.fetch(c.req.raw, c.env);
});
```

### 4. Configure R2 Bucket

```bash
wrangler r2 bucket create energy-contracts
```

Update `wrangler.toml`:

```toml
[[r2_buckets]]
binding = "DOCUMENTS"
bucket_name = "energy-contracts"
```

## Testing

### Unit Tests

```bash
npm run test -- workers/contract-engine
```

### Integration Tests

```bash
npm run test:integration -- contracts
```

### E2E Tests

```bash
npm run test:e2e -- --grep "contract"
```

## Performance Targets

| Metric | Target |
|--------|--------|
| Contract Generation | < 5 seconds |
| Signature Execution | < 2 seconds |
| Document Retrieval | < 500ms |
| Audit Log Query | < 100ms |
| Concurrent Signatures | 1000+ |

## Monitoring

### Key Metrics

- Contracts created (daily, weekly, monthly)
- Average time to full signature
- Signature decline rate
- Amendment frequency
- Contract termination rate

### Alerts

- Signature pending > 7 days
- Contract activation failures
- Document generation errors
- Audit log write failures

## Future Enhancements

### Phase 2 (Q3 2026)
- [ ] Digital signature certificates (PKI integration)
- [ ] DocuSign/Adobe Sign integration
- [ ] Smart contracts for automated execution
- [ ] Blockchain-based contract registry

### Phase 3 (Q4 2026)
- [ ] AI contract review (clause analysis)
- [ ] Automated compliance checking
- [ ] Contract analytics dashboard
- [ ] Renewal automation

## Support

For legal or compliance questions regarding electronic signatures:
- **Legal Team**: legal@esum.energy
- **Compliance**: compliance@esum.energy

For technical support:
- **Platform Team**: platform@esum.energy
- **Documentation**: https://docs.esum.energy/contracts

---

**Version**: 1.0  
**Last Updated**: March 2026  
**Status**: Production Ready
