# Permission Validation System Implementation

## Overview

This permission validation system implements access control for user resources. It queries resource information by calling corresponding interfaces under crossdomain based on different resource types, and performs permission validation by comparing the current operator with the creator_id in the resource information.

## Architecture Design

### Core Components

1. **CheckAuthz Interface** (`permission_impl.go`)
   - Main entry point for permission validation
   - Receives CheckAuthzData requests and returns CheckAuthzResult
   - Supports batch resource permission validation

2. **AuthzChecker Permission Validator** (`authz_checker.go`)
   - Core permission validation logic
   - Manages queryiers for different resource types
   - Implements creator-based permission control

3. **ResourceQueryer Resource Queryier** (`resource_queryiers.go`)
   - Abstract resource query interface
   - Provides unified query methods for different resource types
   - Supported resource types: Bot, Plugin, Workflow, Knowledge, Database

### Permission Validation Flow

1. **Receive Request**: CheckAuthz method receives requests containing multiple resource identifiers
2. **Create Validator**: Instantiate AuthzChecker permission validator
3. **Validate Individually**: Perform permission validation for each resource
4. **Query Resource Info**: Query resource creator_id through corresponding ResourceQueryer
5. **Permission Decision**: Compare operator with creator_id to decide whether to allow access
6. **Return Result**: Return Deny if any resource validation fails, return Allow if all pass

## Permission Rules

### Basic Rules
- **Creator Permission**: Resource creators have all permissions for their resources
- **Read Permission**: Relatively lenient, can be extended based on business needs (e.g., same workspace users)
- **Write Permission**: Relatively strict, only creators have write permission by default

### Extensibility
- Support for adding new resource types
- Support for custom permission rules
- Support for more complex permission control based on workspace, roles, etc.

## Usage Example

```go
// Create permission validation request
req := &CheckAuthzData{
    ResourceIdentifier: []*ResourceIdentifier{
        {
            Type:   ResourceTypeBot,
            ID:     []int64{123},
            Action: ActionRead,
        },
        {
            Type:   ResourceTypeKnowledge,
            ID:     []int64{456},
            Action: ActionWrite,
        },
    },
    OperatorID: 789,
}

// Execute permission validation
result, err := permissionService.CheckAuthz(ctx, req)
if err != nil {
    // Handle error
}

if result.Decision == Allow {
    // Permission validation passed
} else {
    // Permission validation failed
}
```

## Notes

1. **Plugin Resource Query**: Due to the complex Plugin model structure, the current implementation is a placeholder and needs to be improved based on actual Plugin service interfaces
2. **Workflow Resource Query**: Similarly needs to be implemented based on actual Workflow service interfaces
3. **Performance Optimization**: Supports batch queries to reduce network call frequency
4. **Error Handling**: Comprehensive error handling and logging
5. **Extensibility**: Designed to support adding more resource types and permission rules in the future

## Features to be Improved

- [ ] Improve Plugin resource query implementation
- [ ] Improve Workflow resource query implementation
- [ ] Add workspace-based permission control
- [ ] Add role-based permission control
- [ ] Add permission caching mechanism
- [ ] Add detailed permission audit logs