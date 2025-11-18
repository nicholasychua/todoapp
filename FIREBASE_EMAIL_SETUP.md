# Firebase Email Authentication Setup Guide

## Overview

Firebase Authentication can send password reset emails, but you need to configure a few things in the Firebase Console first.

---

## Step 1: Enable Email/Password Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Email/Password**
5. Enable both toggles:
   - ✅ Email/Password
   - ✅ Email link (passwordless sign-in) - optional but recommended
6. Click **Save**

---

## Step 2: Configure Email Templates

1. In Firebase Console, go to **Authentication** → **Templates**
2. Select **Password reset** from the list
3. You'll see the default email template

### Customize the Email Template (Optional)

You can customize:

- **Sender name**: Change from "Your Project" to "Subspace"
- **Subject**: Default is "Reset your password for %APP_NAME%"
- **Email body**: Customize the message (use `%LINK%` placeholder for reset link)

Example custom template:

```
Subject: Reset your Subspace password

Hi there,

We received a request to reset your password for your Subspace account.

Click the link below to reset your password:
%LINK%

If you didn't request this, you can safely ignore this email.

Thanks,
The Subspace Team
```

4. Click **Save**

---

## Step 3: Configure Authorized Domains

1. In Firebase Console, go to **Authentication** → **Settings**
2. Click on **Authorized domains** tab
3. Make sure these domains are added:

   - `localhost` (for development)
   - Your production domain (e.g., `yourdomain.com`)
   - Your custom auth domain (`auth.usesubspace.live`)

4. Add any additional domains where your app will be hosted

---

## Step 4: Configure Action URL (Optional but Recommended)

For a better user experience, you can redirect users back to your app after resetting:

1. In **Authentication** → **Templates** → **Password reset**
2. Click **Edit** (pencil icon)
3. Scroll to **Customize action URL**
4. Enter your custom URL (e.g., `https://yourdomain.com/reset-password`)
   - For development: `http://localhost:3001/reset-password`
5. Click **Save**

---

## Step 5: Test the Email Functionality

### From your app:

1. Navigate to `/forgot-password`
2. Enter a valid email address that you have access to
3. Click "send reset link"
4. Check your email (including spam folder)

### Common Issues:

#### Emails not sending?

- ✅ Check that Email/Password auth is enabled
- ✅ Verify the email exists in your Firebase users list
- ✅ Check browser console for errors
- ✅ Look in spam/junk folder
- ✅ Verify Firebase project is on a paid plan (Spark free plan has limits)

#### Emails in spam?

- Add a custom domain email sender (requires Firebase paid plan + email service)
- Warm up your sending domain
- Configure SPF/DKIM records

#### Rate limiting?

Firebase has built-in rate limiting to prevent abuse:

- Same email: 1 request per minute
- Same IP: Multiple requests allowed but throttled

---

## Step 6: Email Verification (Optional)

To also enable email verification on signup:

1. In **Authentication** → **Templates**
2. Select **Email address verification**
3. Customize the template
4. Add this to your signup flow (we can implement this if needed)

---

## Production Checklist

Before going live:

- [ ] Email/Password authentication enabled
- [ ] Password reset template customized with your branding
- [ ] Production domain added to authorized domains
- [ ] Action URL configured to point to production
- [ ] Tested password reset flow end-to-end
- [ ] Email deliverability tested (not in spam)
- [ ] Consider upgrading to Blaze plan for better email deliverability
- [ ] (Optional) Configure custom email sender for branded emails

---

## Advanced: Custom Email Handler (Optional)

If you want to handle password resets in your own app instead of Firebase's hosted page:

1. We can create a `/reset-password` page
2. Configure the action URL to point to this page
3. Parse the `oobCode` from URL query params
4. Use Firebase's `confirmPasswordReset(auth, code, newPassword)` method

Let me know if you want this implemented!

---

## Monitoring

You can monitor authentication activity:

1. Go to **Authentication** → **Users** tab
2. See user sign-ins, email verification status
3. Go to **Authentication** → **Usage** tab
4. Monitor authentication requests and email sends

---

## Questions?

If emails still aren't sending after following these steps:

1. Check the browser console for errors
2. Verify your `.env.local` has all required Firebase config values
3. Make sure you're using a valid email address
4. Try with a different email provider (Gmail, Outlook, etc.)
5. Check Firebase Console → Authentication → Usage for any error logs
