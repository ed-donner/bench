# Spec for a change request

## Goal

Today, the entire project currently assumes 1 user and has no login. Change it so that there's a signin / signup screen to sign up with email and password (and you provide name details), once you sign in you see data across the platforms (except Groove, which has no data) that is unique to that user. When you sign up, a new account is populated by default with test data. The CRM home screen is updated to welcome the user.

## Constraints

Passwords only stored hashed

## Out of scope

No reset password / recovery flow / validate email.
No data for the Groove application.

## Success criteria

Screenshots captured and verified with signing in and out, switching accounts.
Making changes to the applications for 1 user doesn't affect another user.
e2e testing covering all this is completed and confirmed.
