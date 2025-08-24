# User Profile Feature Implementation Plan

## Product Requirements Document

### 1. Elevator Pitch
Add a user profile management system that allows users to update their personal information including username, email, first/last name, and MarvelCDB profile link. The feature includes email re-verification for changed emails, unique validation for usernames, and GDPR-compliant account deletion.

### 2. Core Features
- **Clickable username** in header that navigates to profile page
- **Editable profile fields**: username, email, first name, last name, MarvelCDB profile URL
- **Email re-verification** when email is changed
- **Username uniqueness** validation
- **Account deletion** with clear warning and GDPR compliance
- **Email verification status** display with resend option

## UI/UX Design

### Layout Structure
- Consistent with existing pages (collection.vue style)
- Card-based layout with white background and shadow
- Section headers for "Profile Information" and "Danger Zone"
- Responsive design matching existing breakpoints

### Visual Elements
- Use existing color scheme (red-600 for primary actions, gray for secondary)
- Status indicators for email verification (green checkmark or yellow warning)
- Red danger zone section for account deletion
- Consistent form styling with existing auth pages

## Technical Implementation Plan

### 1. Database Schema Updates
- Add new fields to User model:
  - `firstName` (optional string)
  - `lastName` (optional string)  
  - `marvelcdbProfile` (optional string)
  - `pendingEmail` (optional string for email changes)
  - `pendingEmailToken` (optional string)
  - `pendingEmailTokenExpiresAt` (optional DateTime)

### 2. Backend Implementation
- **API Endpoints**:
  - `GET /api/profile` - Get current user profile
  - `PUT /api/profile` - Update profile (with validation)
  - `POST /api/profile/verify-email-change` - Verify new email
  - `POST /api/profile/resend-email-verification` - Resend verification
  - `DELETE /api/profile` - Delete account

- **Validation Rules**:
  - Username: unique, 3-50 chars, alphanumeric + underscore/hyphen
  - Email: valid format, unique when changed
  - MarvelCDB profile: valid URL format
  - Names: max 100 chars each

### 3. Frontend Implementation
- **Update AppHeader.vue**: Make username clickable with NuxtLink to `/profile`
- **Create profile.vue page**: 
  - Profile form with all fields
  - Email verification status indicator
  - Save changes button with validation
  - Account deletion section with confirmation modal
- **Update composables/useSession.ts**: Add profile update methods

### 4. Email Flow for Email Changes
1. User changes email → Store as `pendingEmail`
2. Send verification to new email
3. Keep using old email until verified
4. On verification, swap emails and clear pending fields

### 5. Security Considerations
- Rate limit profile updates (5 per hour)
- Require session for all profile operations
- Log account deletions for audit trail
- Clear all user data on deletion (cascade delete)

## Files to Create/Modify

### New Files:
- `pages/profile.vue` - Profile page component
- `server/api/profile.get.ts` - Get profile endpoint
- `server/api/profile.put.ts` - Update profile endpoint
- `server/api/profile.delete.ts` - Delete account endpoint
- `server/api/profile/verify-email-change.post.ts` - Email change verification
- `server/api/profile/resend-email-verification.post.ts` - Resend verification

### Modified Files:
- `components/AppHeader.vue` - Make username clickable
- `prisma/schema.prisma` - Add new user fields
- `composables/useSession.ts` - Add profile methods
- `server/utils/emailTemplates.ts` - Add email change template
- `server/utils/rateLimit.ts` - Add profile rate limits

## Migration Strategy
1. Create database migration for new fields
2. Deploy backend endpoints with validation
3. Add frontend profile page
4. Update header component
5. Test complete flow including email changes

## User Stories

### As a logged-in user:
1. I can click my username in the header to navigate to my profile
2. I can view all my profile information on one page
3. I can edit my username (with uniqueness validation)
4. I can edit my email (triggers re-verification)
5. I can add/edit my first and last name
6. I can add/edit my MarvelCDB profile link
7. I can see my email verification status
8. I can resend verification email if needed
9. I can delete my account with proper warning

### As a developer:
1. Profile updates are rate-limited to prevent abuse
2. Email changes maintain data integrity with pending state
3. Account deletion follows GDPR compliance
4. All changes are validated server-side
5. The UI maintains consistency with existing design patterns

## Success Criteria
- Users can successfully update all profile fields
- Email changes trigger verification process
- Username changes are validated for uniqueness
- Account deletion removes all user data
- UI is responsive and matches existing design
- All endpoints are properly secured and rate-limited