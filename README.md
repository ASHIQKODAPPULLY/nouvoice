## Environment Variables

Copy `.env.example` to `.env` and replace the placeholder values with your
project's actual credentials. The following keys are required for the
application to function:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
PICA_SECRET_KEY
PICA_STRIPE_CONNECTION_KEY
```

You may also update `.env.production` with the same keys when deploying to
production.
