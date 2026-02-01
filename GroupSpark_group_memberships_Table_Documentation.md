# GroupSpark Database: group_memberships Table Documentation

**Project**: GroupSpark Chat Application  
**Date**: July 29, 2025  
**Author**: Technical Documentation  
**Table**: group_memberships

---

## Table of Contents

1. [Overview](#overview)
2. [Table Purpose](#table-purpose)
3. [Table Structure](#table-structure)
4. [Column Details](#column-details)
5. [Data Sources and Flow](#data-sources-and-flow)
6. [Relationships](#relationships)
7. [Security Implementation](#security-implementation)
8. [Common Queries](#common-queries)
9. [Real-World Examples](#real-world-examples)
10. [Business Logic](#business-logic)

---

## Overview

The `group_memberships` table is a critical component of the GroupSpark chat application's database schema. It serves as a **junction table** that establishes and manages the many-to-many relationship between users and groups, enabling the core social functionality of the platform.

### Key Characteristics

- **Table Type**: Junction/Bridge Table
- **Relationship**: Many-to-Many (Users ↔ Groups)
- **Primary Function**: Track group membership
- **Security**: Row Level Security (RLS) enabled
- **Created**: July 22, 2025

---

## Table Purpose

### Primary Functions

1. **Membership Tracking**: Records which users belong to which groups
2. **Access Control**: Determines user permissions within groups
3. **Social Networking**: Enables group-based communication features
4. **Analytics**: Provides data for membership statistics and trends
5. **Audit Trail**: Maintains history of when users joined groups

### Why This Table Exists

In a group chat application like GroupSpark, you need to solve the following relationship problem:

- **One user** can be a member of **multiple groups**
- **One group** can have **multiple users** as members

This creates a **many-to-many relationship** that cannot be stored in either the users table or the groups table alone. The `group_memberships` table solves this by creating a separate table that links the two entities.

---

## Table Structure

```sql
CREATE TABLE public.group_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, group_id)
);
```

### Table Specifications

- **Schema**: public
- **Engine**: PostgreSQL
- **Character Set**: UTF-8
- **Primary Key**: id (UUID)
- **Foreign Keys**: user_id, group_id
- **Unique Constraints**: (user_id, group_id)

---

## Column Details

### 1. id (Primary Key)

| Property          | Value                                        |
| ----------------- | -------------------------------------------- |
| **Data Type**     | UUID                                         |
| **Constraint**    | PRIMARY KEY, NOT NULL                        |
| **Default Value** | gen_random_uuid()                            |
| **Purpose**       | Unique identifier for each membership record |

**Description**:
A universally unique identifier that serves as the primary key for each membership record. This ensures every membership relationship has a unique reference point.

**Example**: `550e8400-e29b-41d4-a716-446655440000`

### 2. user_id (Foreign Key)

| Property            | Value                             |
| ------------------- | --------------------------------- |
| **Data Type**       | UUID                              |
| **Constraint**      | NOT NULL, FOREIGN KEY             |
| **References**      | auth.users(id)                    |
| **Delete Behavior** | CASCADE                           |
| **Purpose**         | Links to the user who is a member |

**Description**:
References the user's unique identifier from Supabase's built-in authentication system. When a user account is deleted, all their group memberships are automatically removed due to the CASCADE constraint.

**Data Source**: Retrieved from `supabase.auth.getUser()` or current session

### 3. group_id (Foreign Key)

| Property            | Value                                  |
| ------------------- | -------------------------------------- |
| **Data Type**       | UUID                                   |
| **Constraint**      | NOT NULL, FOREIGN KEY                  |
| **References**      | public.groups(id)                      |
| **Delete Behavior** | CASCADE                                |
| **Purpose**         | Links to the group the user belongs to |

**Description**:
References the group's unique identifier from the groups table. When a group is deleted, all membership records for that group are automatically removed.

**Data Source**: Selected from existing groups when user initiates join action

### 4. joined_at (Timestamp)

| Property          | Value                                   |
| ----------------- | --------------------------------------- |
| **Data Type**     | TIMESTAMP WITH TIME ZONE                |
| **Constraint**    | NOT NULL                                |
| **Default Value** | now()                                   |
| **Purpose**       | Records when the membership was created |

**Description**:
Automatically captures the exact moment when a user joins a group. This timestamp is used for:

- Sorting members by join date
- Analytics on group growth
- Membership history tracking
- Potential future features (member seniority, etc.)

**Example**: `2025-07-29T14:30:25.123456+00:00`

### 5. UNIQUE Constraint (user_id, group_id)

| Property    | Value                          |
| ----------- | ------------------------------ |
| **Type**    | Composite Unique Constraint    |
| **Columns** | user_id, group_id              |
| **Purpose** | Prevents duplicate memberships |

**Description**:
Ensures that a user cannot join the same group multiple times. This prevents data inconsistencies and duplicate membership records.

---

## Data Sources and Flow

### Input Data Sources

#### 1. User Identification

```javascript
// Frontend: Get current user
const {
  data: { user },
} = await supabase.auth.getUser();
const userId = user.id; // This becomes user_id in the table
```

#### 2. Group Selection

```javascript
// Frontend: User selects a group to join
const groupId = selectedGroup.id; // This becomes group_id in the table
```

#### 3. Membership Creation

```javascript
// Frontend: Create membership record
const { data, error } = await supabase.from("group_memberships").insert({
  user_id: userId, // From auth system
  group_id: groupId, // From user selection
  // id and joined_at are auto-generated
});
```

### Data Flow Diagram

```
User Authentication System (auth.users)
            ↓
    [user_id extracted]
            ↓
User Interface → Group Selection → group_memberships Table
            ↓                           ↑
    [group_id from groups table] ←──────┘
            ↓
    [joined_at auto-generated]
            ↓
    [id auto-generated]
```

---

## Relationships

### Database Relationships

#### 1. User Relationship

```sql
user_id REFERENCES auth.users(id) ON DELETE CASCADE
```

- **Type**: Many-to-One
- **Description**: Many memberships can belong to one user
- **Cascade**: When user is deleted, all their memberships are removed

#### 2. Group Relationship

```sql
group_id REFERENCES public.groups(id) ON DELETE CASCADE
```

- **Type**: Many-to-One
- **Description**: Many memberships can belong to one group
- **Cascade**: When group is deleted, all memberships are removed

### Entity Relationship Diagram

```
┌─────────────┐    ┌───────────────────┐    ┌─────────────┐
│ auth.users  │    │ group_memberships │    │   groups    │
├─────────────┤    ├───────────────────┤    ├─────────────┤
│ id (PK)     │◄──┤ user_id (FK)      │    │ id (PK)     │
│ email       │    │ group_id (FK)     ├───►│ name        │
│ ...         │    │ id (PK)           │    │ description │
└─────────────┘    │ joined_at         │    │ ...         │
                   └───────────────────┘    └─────────────┘
```

---

## Security Implementation

### Row Level Security (RLS) Policies

#### 1. Read Access Policy

```sql
CREATE POLICY "Users can view all memberships"
ON public.group_memberships
FOR SELECT
USING (true);
```

**Purpose**: Allows all authenticated users to see group membership information  
**Reason**: Needed for displaying group member lists and checking if users are in groups

#### 2. Insert Policy

```sql
CREATE POLICY "Users can join groups"
ON public.group_memberships
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

**Purpose**: Users can only create membership records for themselves  
**Security**: Prevents users from adding others to groups without permission

#### 3. Delete Policy

```sql
CREATE POLICY "Users can leave groups"
ON public.group_memberships
FOR DELETE
USING (auth.uid() = user_id);
```

**Purpose**: Users can only remove their own memberships  
**Security**: Prevents users from removing others from groups

### Security Benefits

- **Data Integrity**: Prevents unauthorized membership modifications
- **Privacy Protection**: Controls access to membership information
- **Audit Trail**: All actions are traceable to specific users
- **Scalability**: Policies automatically apply to all operations

---

## Common Queries

### 1. Get All Groups a User Belongs To

```sql
SELECT
    g.id,
    g.name,
    g.description,
    g.group_type,
    gm.joined_at
FROM group_memberships gm
JOIN groups g ON gm.group_id = g.id
WHERE gm.user_id = $1
ORDER BY gm.joined_at DESC;
```

### 2. Get All Members of a Specific Group

```sql
SELECT
    p.username,
    p.profile_photo_url,
    gm.joined_at,
    gm.user_id
FROM group_memberships gm
JOIN profiles p ON gm.user_id = p.user_id
WHERE gm.group_id = $1
ORDER BY gm.joined_at ASC;
```

### 3. Check if User is Member of Group

```sql
SELECT EXISTS(
    SELECT 1
    FROM group_memberships
    WHERE user_id = $1 AND group_id = $2
) AS is_member;
```

### 4. Count Members in Each Group

```sql
SELECT
    g.name,
    COUNT(gm.user_id) as member_count
FROM groups g
LEFT JOIN group_memberships gm ON g.id = gm.group_id
GROUP BY g.id, g.name
ORDER BY member_count DESC;
```

### 5. Get Recent Group Joins

```sql
SELECT
    p.username,
    g.name as group_name,
    gm.joined_at
FROM group_memberships gm
JOIN profiles p ON gm.user_id = p.user_id
JOIN groups g ON gm.group_id = g.id
WHERE gm.joined_at >= NOW() - INTERVAL '7 days'
ORDER BY gm.joined_at DESC;
```

---

## Real-World Examples

### Example 1: User Journey - Joining a Group

**Scenario**: Sarah wants to join the "JavaScript Study Group"

**Step 1**: Sarah browses available groups

```sql
-- System shows available groups
SELECT id, name, description
FROM groups
WHERE id NOT IN (
    SELECT group_id
    FROM group_memberships
    WHERE user_id = 'sarah_user_id'
);
```

**Step 2**: Sarah clicks "Join Group"

```sql
-- System checks if she can join (using business logic function)
SELECT can_join_group('sarah_user_id', 'js_study_group_id');
```

**Step 3**: If allowed, membership is created

```sql
INSERT INTO group_memberships (user_id, group_id)
VALUES ('sarah_user_id', 'js_study_group_id');
```

**Result**: Sarah now appears in the group member list

### Example 2: Group Administrator View

**Scenario**: Group admin wants to see all members with join dates

```sql
SELECT
    p.username,
    p.profile_photo_url,
    gm.joined_at,
    EXTRACT(days FROM NOW() - gm.joined_at) as days_as_member
FROM group_memberships gm
JOIN profiles p ON gm.user_id = p.user_id
WHERE gm.group_id = 'group_admin_group_id'
ORDER BY gm.joined_at ASC;
```

**Output**:

```
username     | profile_photo_url | joined_at           | days_as_member
-------------|-------------------|---------------------|---------------
admin_user   | /photos/admin.jpg | 2025-07-01 10:00:00| 28
sarah_dev    | /photos/sarah.jpg | 2025-07-15 14:30:00| 14
mike_coder   | /photos/mike.jpg  | 2025-07-20 09:15:00| 9
```

---

## Business Logic

### Group Membership Limits

The application enforces specific business rules through the `can_join_group()` function:

#### Custom Groups

- **Limit**: Maximum 2 custom groups per user
- **Reason**: Prevents users from joining too many casual groups
- **Type**: User-created groups for specific interests

#### Class Groups

- **Limit**: Maximum 1 class group per user
- **Reason**: Academic/professional groups should be focused
- **Type**: Official institutional groups

### Implementation

```sql
CREATE OR REPLACE FUNCTION public.can_join_group(user_uuid UUID, group_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  custom_group_count INTEGER;
  class_group_count INTEGER;
  target_group_type group_type;
BEGIN
  -- Get the type of group user wants to join
  SELECT group_type INTO target_group_type
  FROM public.groups
  WHERE id = group_uuid;

  -- Count user's current memberships by type
  SELECT
    COUNT(CASE WHEN g.group_type = 'custom' THEN 1 END),
    COUNT(CASE WHEN g.group_type = 'class' THEN 1 END)
  INTO custom_group_count, class_group_count
  FROM public.group_memberships gm
  JOIN public.groups g ON gm.group_id = g.id
  WHERE gm.user_id = user_uuid;

  -- Apply business rules
  IF target_group_type = 'custom' AND custom_group_count >= 2 THEN
    RETURN FALSE;
  ELSIF target_group_type = 'class' AND class_group_count >= 1 THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Frontend Integration

### React/TypeScript Implementation

#### Join Group Function

```typescript
const joinGroup = async (groupId: string) => {
  try {
    // Check if user can join
    const { data: canJoin } = await supabase.rpc("can_join_group", {
      user_uuid: user.id,
      group_uuid: groupId,
    });

    if (!canJoin) {
      toast.error("You've reached the maximum number of groups for this type");
      return;
    }

    // Create membership
    const { data, error } = await supabase.from("group_memberships").insert({
      user_id: user.id,
      group_id: groupId,
    });

    if (error) throw error;

    toast.success("Successfully joined group!");
    // Refresh group data
    refreshUserGroups();
  } catch (error) {
    toast.error("Failed to join group");
  }
};
```

#### Leave Group Function

```typescript
const leaveGroup = async (groupId: string) => {
  try {
    const { error } = await supabase
      .from("group_memberships")
      .delete()
      .eq("user_id", user.id)
      .eq("group_id", groupId);

    if (error) throw error;

    toast.success("Successfully left group!");
    refreshUserGroups();
  } catch (error) {
    toast.error("Failed to leave group");
  }
};
```

---

## Performance Considerations

### Indexing Strategy

#### Automatic Indexes

- **Primary Key Index**: Automatically created on `id` column
- **Foreign Key Indexes**: Automatically created on `user_id` and `group_id`
- **Unique Index**: Created for `(user_id, group_id)` constraint

#### Recommended Additional Indexes

```sql
-- For queries filtering by join date
CREATE INDEX idx_group_memberships_joined_at
ON group_memberships(joined_at);

-- For counting memberships by group type
CREATE INDEX idx_group_memberships_user_group_type
ON group_memberships(user_id)
INCLUDE (group_id);
```

### Query Optimization Tips

1. **Use Proper Joins**: Always use JOINs instead of subqueries when possible
2. **Limit Results**: Use LIMIT for paginated results
3. **Index Usage**: Ensure queries use existing indexes
4. **Batch Operations**: Group multiple membership changes into transactions

---

## Monitoring and Analytics

### Key Metrics to Track

#### Membership Growth

```sql
-- Daily new memberships
SELECT
    DATE(joined_at) as join_date,
    COUNT(*) as new_members
FROM group_memberships
WHERE joined_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(joined_at)
ORDER BY join_date;
```

#### Group Popularity

```sql
-- Most popular groups by member count
SELECT
    g.name,
    COUNT(gm.user_id) as member_count,
    AVG(EXTRACT(days FROM NOW() - gm.joined_at)) as avg_days_since_join
FROM groups g
LEFT JOIN group_memberships gm ON g.id = gm.group_id
GROUP BY g.id, g.name
HAVING COUNT(gm.user_id) > 0
ORDER BY member_count DESC;
```

#### User Engagement

```sql
-- Users by number of groups joined
SELECT
    COUNT(gm.group_id) as groups_joined,
    COUNT(DISTINCT gm.user_id) as user_count
FROM group_memberships gm
GROUP BY gm.user_id
ORDER BY groups_joined;
```

---

## Troubleshooting Guide

### Common Issues

#### 1. Duplicate Membership Error

**Error**: `duplicate key value violates unique constraint`  
**Cause**: Attempting to join the same group twice  
**Solution**: Check membership before inserting

#### 2. Foreign Key Violation

**Error**: `violates foreign key constraint`  
**Cause**: Referenced user or group doesn't exist  
**Solution**: Verify user is authenticated and group exists

#### 3. Permission Denied

**Error**: `new row violates row-level security policy`  
**Cause**: User trying to create membership for another user  
**Solution**: Ensure user_id matches authenticated user

### Debugging Queries

#### Check User's Current Memberships

```sql
SELECT
    gm.*,
    g.name as group_name,
    g.group_type
FROM group_memberships gm
JOIN groups g ON gm.group_id = g.id
WHERE gm.user_id = 'user_id_here';
```

#### Verify Group Exists and Is Accessible

```sql
SELECT * FROM groups WHERE id = 'group_id_here';
```

#### Test Business Logic Function

```sql
SELECT can_join_group('user_id_here', 'group_id_here');
```

---

## Future Enhancements

### Potential Table Additions

#### 1. Membership Roles

```sql
ALTER TABLE group_memberships
ADD COLUMN role TEXT DEFAULT 'member'
CHECK (role IN ('member', 'moderator', 'admin'));
```

#### 2. Membership Status

```sql
ALTER TABLE group_memberships
ADD COLUMN status TEXT DEFAULT 'active'
CHECK (status IN ('active', 'suspended', 'banned'));
```

#### 3. Invitation System

```sql
ALTER TABLE group_memberships
ADD COLUMN invited_by UUID REFERENCES auth.users(id),
ADD COLUMN invitation_accepted_at TIMESTAMP WITH TIME ZONE;
```

### Advanced Features

1. **Membership Tiers**: Different levels of access within groups
2. **Temporary Memberships**: Time-limited group access
3. **Membership History**: Track when users leave and rejoin groups
4. **Bulk Operations**: Admin tools for managing multiple memberships

---

_This documentation serves as a comprehensive guide to understanding and working with the group_memberships table in the GroupSpark application. It should be updated as the application evolves and new features are added._
