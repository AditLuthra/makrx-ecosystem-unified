# Custom React Hooks

## Overview
This directory contains custom React hooks that encapsulate reusable logic and state management patterns used throughout the MakrCave application.

## Available Hooks

### `use-toast.ts`
Toast notification management hook:
```typescript
const { toast, dismiss, toasts } = useToast();

// Usage
toast({
  title: "Success!",
  description: "Operation completed successfully",
  variant: "success"
});
```

### `useProjectPermissions.ts`
Project-specific permission management:
```typescript
const { 
  canEdit, 
  canDelete, 
  canInvite, 
  isOwner 
} = useProjectPermissions(projectId, userId);
```

### `useRealTimeUpdates.ts`
WebSocket-based real-time updates:
```typescript
const { 
  connected, 
  subscribe, 
  unsubscribe 
} = useRealTimeUpdates();

// Subscribe to equipment updates
useEffect(() => {
  subscribe('equipment', (update) => {
    // Handle equipment update
  });
}, []);
```

## Hook Patterns

### State Management Hooks
For complex local state management:
```typescript
function useComplexState(initialValue) {
  const [state, setState] = useState(initialValue);
  
  const actions = useMemo(() => ({
    update: (newValue) => setState(prev => ({ ...prev, ...newValue })),
    reset: () => setState(initialValue),
    clear: () => setState({})
  }), [initialValue]);
  
  return [state, actions];
}
```

### API Data Hooks
For API data fetching and management:
```typescript
function useEquipment(equipmentId?: string) {
  return useQuery({
    queryKey: ['equipment', equipmentId],
    queryFn: () => equipmentId 
      ? apiService.get(`/api/equipment/${equipmentId}`)
      : apiService.get('/api/equipment'),
    enabled: !!equipmentId
  });
}
```

### Form Handling Hooks
For form state and validation:
```typescript
function useForm<T>(initialValues: T, validationSchema: Schema<T>) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<T>>({});
  
  const validate = useCallback(() => {
    const result = validationSchema.safeParse(values);
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [values, validationSchema]);
  
  return { values, setValues, errors, validate };
}
```

## Best Practices

### Hook Naming
- Start with "use" prefix
- Use descriptive, specific names
- Follow camelCase convention

### Dependencies
- Always include dependencies in useEffect arrays
- Use useCallback for expensive functions
- Implement proper cleanup in useEffect

### Type Safety
- Use TypeScript generics for reusable hooks
- Define proper return types
- Use proper type guards

### Performance
- Memoize expensive computations with useMemo
- Use useCallback for event handlers
- Avoid creating objects in render

## Testing Hooks

### Setup
```typescript
import { renderHook, act } from '@testing-library/react';
import { useToast } from './use-toast';

describe('useToast', () => {
  test('should show toast message', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({
        title: 'Test',
        description: 'Test message'
      });
    });
    
    expect(result.current.toasts).toHaveLength(1);
  });
});
```

### Mocking Dependencies
```typescript
jest.mock('@/services/apiService');

test('should fetch data correctly', async () => {
  const mockData = { id: 1, name: 'Test' };
  (apiService.get as jest.Mock).mockResolvedValue(mockData);
  
  const { result, waitFor } = renderHook(() => useEquipment('1'));
  
  await waitFor(() => {
    expect(result.current.data).toEqual(mockData);
  });
});
```

## Contributing

When creating new hooks:
1. Follow established patterns
2. Include proper TypeScript types
3. Add comprehensive tests
4. Document usage examples
5. Consider reusability across components