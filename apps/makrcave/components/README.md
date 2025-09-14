# Frontend Components

## Overview
This directory contains all React components used throughout the MakrCave frontend application, organized by functionality and scope.

## Directory Structure

### Core UI Components (`ui/`)
Basic, reusable UI primitives built on Radix UI:
- `button.tsx` - Button component with variants
- `input.tsx` - Form input components  
- `dialog.tsx` - Modal dialogs
- `card.tsx` - Content cards
- `badge.tsx` - Status badges
- And more foundational UI elements

### Feature-Specific Components

#### Admin (`admin/`)
- `EnhancedAdminDashboard.tsx` - Main admin interface

#### Analytics (`analytics/`)
- `DataExports.tsx` - Data export functionality
- `EquipmentMetrics.tsx` - Equipment usage metrics
- `ProjectAnalytics.tsx` - Project analytics dashboard
- `RevenueCharts.tsx` - Financial reporting
- `UsageDashboard.tsx` - Overall usage statistics

#### Billing (`billing/`)
- `BillingOverview.tsx` - Main billing interface
- `PaymentForm.tsx` - Payment processing
- `InvoicesList.tsx` - Invoice management
- `CreditWalletWidget.tsx` - Credit balance display
- `TransactionsList.tsx` - Transaction history

#### Equipment Management
- `EquipmentCard.tsx` - Equipment display cards
- `EquipmentReservations.tsx` - Reservation system
- `EquipmentCheckInOut.tsx` - Check-in/out workflow
- `MaintenanceModal.tsx` - Equipment maintenance

#### Inventory Management
- `InventoryCard.tsx` - Inventory item display
- `AddItemModal.tsx` - New item creation
- `CSVImportModal.tsx` - Bulk import functionality

#### Project Management
- `ProjectCard.tsx` - Project display cards
- `ProjectTimeline.tsx` - Project progress tracking
- `ProjectFiles.tsx` - File management
- `EnhancedProjectCard.tsx` - Advanced project features

#### Modals (`modals/`)
Reusable modal components for various workflows:
- `AddMemberModal.tsx` - Member addition
- `EditMemberModal.tsx` - Member editing
- `MembershipPlanModal.tsx` - Plan management
- `NotificationSettingsModal.tsx` - User preferences

#### Sidebar & Navigation
- `Sidebar.tsx` - Main navigation sidebar
- `Header.tsx` - Application header
- `RoleBasedSidebar.tsx` - Role-specific navigation

## Component Guidelines

### Naming Conventions
- Use PascalCase for component names
- Use descriptive, specific names
- Include the component type suffix (Modal, Card, Widget, etc.)

### Component Structure
```tsx
// Import types and dependencies
import { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

// Define props interface
interface ComponentNameProps extends ComponentProps<'div'> {
  // Specific props
}

// Component implementation
export function ComponentName({ 
  className, 
  ...props 
}: ComponentNameProps) {
  return (
    <div className={cn('base-styles', className)} {...props}>
      {/* Component content */}
    </div>
  );
}
```

### Best Practices
- Use TypeScript for all components
- Implement proper prop types
- Include error boundaries where needed
- Use React.memo for performance optimization
- Follow accessibility guidelines
- Include loading and error states

## Usage Examples

### Basic Component Usage
```tsx
import { Button } from '@/components/ui/button';
import { EquipmentCard } from '@/components/EquipmentCard';

function MyPage() {
  return (
    <div>
      <Button variant="primary">Click me</Button>
      <EquipmentCard equipment={equipment} />
    </div>
  );
}
```

### Modal Component Usage
```tsx
import { AddMemberModal } from '@/components/modals/AddMemberModal';

function MemberList() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Add Member</Button>
      <AddMemberModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
```

## Testing
Each component should include:
- Unit tests for logic
- Accessibility tests
- Visual regression tests
- Integration tests for complex workflows

## Contributing
When adding new components:
1. Follow the established patterns
2. Include proper TypeScript types
3. Add comprehensive tests
4. Update this README
5. Consider reusability across the application