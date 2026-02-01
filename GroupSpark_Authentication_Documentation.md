# GroupSpark Authentication System Documentation

**Project**: GroupSpark Chat Application  
**Date**: July 24, 2025  
**Author**: Technical Documentation  
**Version**: 2.2

---

## Table of Contents

1. [Overview](#overview)
2. [Sign Up (Registration) Process](#sign-up-registration-process)
3. [Login Process](#login-process)
4. [Database Structure](#database-structure)
5. [Security Features](#security-features)
6. [User Experience Features](#user-experience-features)
7. [Technical Implementation](#technical-implementation)
8. [API Reference](#api-reference)

---

## Overview

GroupSpark is a modern chat application built with React, TypeScript, and Supabase. The authentication system provides secure user registration, login, and session management with a beautiful, multi-step user interface.

### Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth)
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL with Row Level Security

---

## Sign Up (Registration) Process

### User Interface Flow

The registration process uses a **3-step wizard interface** that makes account creation simple and engaging:

#### Step 1: Choose Username

- User enters their desired username
- Real-time validation ensures username availability
- Smooth transition animations between steps

#### Step 2: Email Address

- User provides their email address
- Email format validation
- Checks for existing accounts

#### Step 3: Password Creation

- User creates a secure password
- Password strength requirements
- Final account creation

### Technical Process

```typescript
// Signup API Call
const { data, error } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  options: {
    data: {
      username: formData.username,
    },
  },
});
```

### What Happens in the Database

1. **User Creation**: New record added to `auth.users` table
2. **Profile Generation**: Database trigger automatically creates profile
3. **Email Verification**: Verification email sent to user
4. **Initial Setup**: Default values set for streaks and activity tracking

### Guest Mode Option

Users can also access the application without registration through the **Guest Chat** feature, allowing them to experience the platform before committing to creating an account.

---

## Login Process

### User Interface

The login page features:

- Clean, modern design with glassmorphism effects
- Email and password input fields
- Demo credentials display for testing
- "Remember me" functionality through persistent sessions
- Forgot password option
- Quick signup link

### Authentication Flow

```typescript
// Login API Call
const { data, error } = await supabase.auth.signInWithPassword({
  email: formData.email,
  password: formData.password,
});
```

### Session Management

- **Persistent Sessions**: Users stay logged in across browser sessions
- **Auto-Refresh**: JWT tokens automatically refresh before expiration
- **Secure Storage**: Session data stored in browser's localStorage
- **Automatic Redirects**: Logged-in users skip login page

### Demo Account

For testing purposes, the application includes a demo account:

- **Email**: demo@groupspark.com
- **Password**: demo123

---

## Database Structure

### Authentication Table (auth.users)

**Managed by Supabase** - This is the core authentication table that handles:

- Email addresses
- Hashed passwords
- Email verification status
- Account metadata
- Security tokens

### Custom Application Tables

#### 1. profiles Table

**Purpose**: Store user profile information and app-specific data

| Field                | Type      | Description                  |
| -------------------- | --------- | ---------------------------- |
| `id`                 | UUID      | Primary key (auto-generated) |
| `user_id`            | UUID      | Foreign key to auth.users    |
| `username`           | TEXT      | User's display name (unique) |
| `about_me`           | TEXT      | User biography/description   |
| `profile_photo_url`  | TEXT      | Link to profile picture      |
| `current_streak`     | INTEGER   | Consecutive days active      |
| `longest_streak`     | INTEGER   | Record streak achievement    |
| `last_activity_date` | DATE      | Last login date              |
| `created_at`         | TIMESTAMP | Profile creation time        |
| `updated_at`         | TIMESTAMP | Last profile update          |

**Key Features**:

- Automatically created when user signs up
- Username extracted from signup metadata
- Streak tracking for user engagement
- Profile customization options

#### 2. groups Table

**Purpose**: Store chat group/community information

| Field         | Type      | Description                  |
| ------------- | --------- | ---------------------------- |
| `id`          | UUID      | Primary key (auto-generated) |
| `name`        | TEXT      | Group name                   |
| `description` | TEXT      | Group description (optional) |
| `group_type`  | ENUM      | 'custom' or 'class'          |
| `max_members` | INTEGER   | Maximum members allowed      |
| `created_by`  | UUID      | Creator's user ID            |
| `created_at`  | TIMESTAMP | Group creation time          |
| `updated_at`  | TIMESTAMP | Last group update            |

**Group Types**:

- **Custom**: User-created groups (limit: 2 per user)
- **Class**: Official/institutional groups (limit: 1 per user)

#### 3. group_memberships Table

**Purpose**: Many-to-many relationship between users and groups

| Field       | Type      | Description                  |
| ----------- | --------- | ---------------------------- |
| `id`        | UUID      | Primary key (auto-generated) |
| `user_id`   | UUID      | Member's user ID             |
| `group_id`  | UUID      | Group ID                     |
| `joined_at` | TIMESTAMP | When user joined             |

**Constraints**:

- Unique combination of user_id and group_id
- Prevents duplicate memberships
- Cascade delete when user or group is removed

#### 4. user_activities Table

**Purpose**: Track user actions for analytics and streak calculation

| Field           | Type      | Description                      |
| --------------- | --------- | -------------------------------- |
| `id`            | UUID      | Primary key (auto-generated)     |
| `user_id`       | UUID      | User who performed action        |
| `activity_date` | DATE      | Date of activity                 |
| `activity_type` | TEXT      | Type of activity (e.g., 'login') |
| `created_at`    | TIMESTAMP | Exact time of activity           |

**Usage**:

- Daily login streak calculation
- User engagement metrics
- Activity analytics
- Gamification features

---

## Security Features

### Row Level Security (RLS)

All tables implement Row Level Security policies to ensure data protection:

#### Profile Security

```sql
-- Users can view all profiles (for social features)
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
FOR UPDATE USING (auth.uid() = user_id);
```

#### Group Security

```sql
-- Anyone can view groups (for discovery)
CREATE POLICY "Users can view all groups" ON groups FOR SELECT USING (true);

-- Only creators can update their groups
CREATE POLICY "Group creators can update their groups" ON groups
FOR UPDATE USING (auth.uid() = created_by);
```

#### Activity Security

```sql
-- Users can only see their own activities
CREATE POLICY "Users can view their own activities" ON user_activities
FOR SELECT USING (auth.uid() = user_id);
```

### Data Protection Features

- **Password Hashing**: All passwords encrypted using industry-standard methods
- **SQL Injection Prevention**: Parameterized queries prevent injection attacks
- **CSRF Protection**: Cross-site request forgery protection enabled
- **Rate Limiting**: Login attempt rate limiting prevents brute force attacks

---

## User Experience Features

### Smart Navigation

- **Auto-redirect**: Logged-in users bypass login page
- **Deep linking**: Users can bookmark specific pages
- **Back navigation**: Proper browser history handling

### Error Handling

- **Clear messaging**: User-friendly error messages
- **Toast notifications**: Non-intrusive success/error alerts
- **Form validation**: Real-time input validation
- **Loading states**: Visual feedback during operations

### Accessibility

- **Keyboard navigation**: Full keyboard accessibility
- **Screen reader support**: ARIA labels and semantic HTML
- **High contrast**: Readable color schemes
- **Responsive design**: Works on all device sizes

---

## Technical Implementation

### Authentication Flow Diagram

```
User Registration Flow:
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│   Step 1    │───▶│    Step 2    │───▶│   Step 3    │───▶│   Supabase   │
│  Username   │    │    Email     │    │  Password   │    │   signUp()   │
└─────────────┘    └──────────────┘    └─────────────┘    └──────────────┘
                                                                    │
                                                                    ▼
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│   Profile   │◀───│   Trigger    │◀───│ auth.users  │◀───│ Email Verify │
│  Creation   │    │  Execution   │    │   Record    │    │    Sent      │
└─────────────┘    └──────────────┘    └─────────────┘    └──────────────┘

User Login Flow:
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│    Login    │───▶│   Supabase   │───▶│   Session   │───▶│  Dashboard   │
│    Form     │    │ signInWith   │    │  Creation   │    │   Redirect   │
└─────────────┘    │  Password()  │    └─────────────┘    └──────────────┘
                   └──────────────┘
```

### Database Functions

#### Streak Update Function

```sql
CREATE OR REPLACE FUNCTION update_user_streak(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  last_activity DATE;
  current_streak_val INTEGER;
  longest_streak_val INTEGER;
BEGIN
  -- Get current streak values
  SELECT current_streak, longest_streak, last_activity_date
  INTO current_streak_val, longest_streak_val, last_activity
  FROM profiles WHERE user_id = user_uuid;

  -- Calculate new streak based on activity
  IF last_activity = CURRENT_DATE THEN
    RETURN; -- Already active today
  ELSIF last_activity = CURRENT_DATE - INTERVAL '1 day' THEN
    current_streak_val := current_streak_val + 1; -- Consecutive day
  ELSE
    current_streak_val := 1; -- Streak broken
  END IF;

  -- Update records
  UPDATE profiles SET
    current_streak = current_streak_val,
    longest_streak = GREATEST(longest_streak_val, current_streak_val),
    last_activity_date = CURRENT_DATE
  WHERE user_id = user_uuid;
END;
$$;
```

#### Group Join Validation

```sql
CREATE OR REPLACE FUNCTION can_join_group(user_uuid UUID, group_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  custom_count INTEGER;
  class_count INTEGER;
  target_type group_type;
BEGIN
  -- Check group limits based on type
  SELECT group_type INTO target_type FROM groups WHERE id = group_uuid;

  SELECT
    COUNT(CASE WHEN g.group_type = 'custom' THEN 1 END),
    COUNT(CASE WHEN g.group_type = 'class' THEN 1 END)
  INTO custom_count, class_count
  FROM group_memberships gm
  JOIN groups g ON gm.group_id = g.id
  WHERE gm.user_id = user_uuid;

  -- Enforce limits: 2 custom, 1 class
  IF target_type = 'custom' AND custom_count >= 2 THEN
    RETURN FALSE;
  ELSIF target_type = 'class' AND class_count >= 1 THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;
```

---

## API Reference

### Authentication Endpoints

#### Sign Up

```typescript
supabase.auth.signUp({
  email: string,
  password: string,
  options: {
    data: {
      username: string,
    },
  },
});
```

#### Sign In

```typescript
supabase.auth.signInWithPassword({
  email: string,
  password: string,
});
```

#### Get Current User

```typescript
supabase.auth.getUser();
```

#### Sign Out

```typescript
supabase.auth.signOut();
```

### Database Operations

#### Profile Management

```typescript
// Get user profile
const { data } = await supabase
  .from("profiles")
  .select("*")
  .eq("user_id", userId)
  .single();

// Update profile
const { data } = await supabase
  .from("profiles")
  .update({ username, about_me })
  .eq("user_id", userId);
```

#### Group Operations

```typescript
// Create group
const { data } = await supabase.from("groups").insert({
  name,
  description,
  group_type,
  created_by: userId,
});

// Join group
const { data } = await supabase.from("group_memberships").insert({
  user_id: userId,
  group_id: groupId,
});
```

---

## Deployment and Configuration

### Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Configuration

```typescript
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
```

---

## Troubleshooting

### Common Issues

1. **Email Verification**: Users must verify email before full access
2. **Session Expiry**: Sessions automatically refresh, but may need re-login if expired
3. **Group Limits**: Users limited to 2 custom groups and 1 class group
4. **Username Conflicts**: Usernames must be unique across the platform

### Error Codes

- `AuthenticationError`: Invalid credentials
- `ValidationError`: Invalid input data
- `PermissionError`: Insufficient permissions for action
- `RateLimitError`: Too many requests, try again later

---

## Future Enhancements

### Planned Features

- **Social Login**: Google, GitHub OAuth integration
- **Two-Factor Authentication**: Enhanced security options
- **Password Reset**: Self-service password recovery
- **Profile Pictures**: Image upload and management
- **Advanced Analytics**: Detailed user engagement metrics

### Performance Optimizations

- **Connection Pooling**: Database connection optimization
- **Caching Strategy**: Session and data caching
- **CDN Integration**: Static asset delivery optimization

---

_This documentation is maintained and updated with each release of the GroupSpark application._
