![archiverse-logo](https://github.com/user-attachments/assets/0ddb8ff1-422d-4800-993c-4198a1a0cddb)

### The Biggest Miiverse Archive on the Internet

View the website at [archiverse.pretendo.network](https://archiverse.pretendo.network)

## About Archiverse

Archiverse is a comprehensive archive of [Miiverse](https://en.wikipedia.org/wiki/Miiverse), a social media platform for the Nintendo Wii U and 3DS which ran from November 18, 2012 until November 8, 2017. This archive stores millions of archived Miiverse users, posts, drawings, comments, and more, totaling over 17TB of data.  

Archiverse's frontend is built using [React](https://react.dev/), [Next.js](https://nextjs.org/), [Redux](https://redux.js.org/), and [Docker](https://www.docker.com/). It takes advantage of server-side rendering for optimized SEO (search engine optimization) in order for users to more easily Google keywords in Miiverse posts. The data behind archiverse is stored through [PostgreSQL](https://www.postgresql.org/) hosted with [Supabase](https://supabase.com/). In total, the data behind Archiverse consists of...

5,141 Communities  
8,290,282 Users  
133,078,026 Posts  
216,972,349 Replies  

This data is quickly searchable on Archiverse thanks to optimized binary tree indexes applied on certain columns in each table.  The database is backed up on [internet archive](https://archive.org/details/archiverse) (Note: some modifications to this database has occured. Look over `supabase/migrations` for more details).
