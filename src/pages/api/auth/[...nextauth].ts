import { query as q } from 'faunadb';

import NextAuth from "next-auth"
import Providers from "next-auth/providers"

import { fauna } from "../../../services/fauna"

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: 'read:user'
    }),
  ],
  jwt: {
    signingKey: process.env.JWT_SIGNING_KEY,
  },
  callbacks: {
    async signIn(user, account, profile) {
      try {
        const { email } = user;
        console.log(email)
                  
        await fauna.query(
          q.If(
            q.Not(
              q.Exists(
                q.Match(
                  q.Index("users_by_email"),
                  q.Casefold(user.email)
                )
              )
            ),
            q.Create(
              q.Collection('users'),
              { data: { email } }
            ),
            q.Get(
              q.Match(
                q.Index("users_by_email"),
                q.Casefold(email),
              )
            ),
          )
        );
        return true;
      } catch(err) {
        console.log(err)
        return false
      }
    },
  }
})