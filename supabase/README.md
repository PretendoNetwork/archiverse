# Archiverse Database

Archiverse uses PostgreSQL as its database with the Supabase client. To develop locally, follow the steps below (taken from https://supabase.com/docs/guides/cli/local-development)

### Start local development

`supabase start`

When you see...

``` 
         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: ***************************
service_role key: ***************************
```

Copy the API URL and anon key. Then, put them in the `.env` file in the `frontend` folder

You can access your dashboard using http://localhost:54323/

### Initializing the images bucket

Go the Supabase dashboard under the storage tab, and create a new **public bucket** called `images`, and grab all of the folders and data from `database/storage` and put it in the `images` bucket.

### Stop local development

`supabase stop`

### Submitting your db changes

`supabase db diff --use-migra -f name_here`

### If something goes wrong

`supabase db reset` to reset the database

### If you need to remove all docker volumes

`docker rm -vf $(docker ps -aq)`