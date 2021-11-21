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
                  
        await fauna.query(
          q.If( // verifica se o usuario não existe no faunaDB
            q.Not(
              q.Exists(
                q.Match(
                  q.Index("users_by_email"),
                  q.Casefold(user.email)
                )
              )
            ),
            q.Create( // caso não exista, cria o usuario no faunaDB
              q.Collection('users'),
              { data: { email } }
            ),
            q.Get( // caso exista, atualiza o usuario no faunaDB
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